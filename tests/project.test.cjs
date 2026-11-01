const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseAppJson } = require('../out/analysis/appJson');
const { planALStructure } = require('../out/core/structurePlan');
const { normalizeModules, objectTypesFromManifest } = require('../out/core/alStructure');
const { loadManifest } = require('../out/templates/catalog');
const { TemplateValidationError } = require('../out/core/templateValidation');
const base = path.resolve(__dirname, '../resources/templates');
const standard = loadManifest(fs.readFileSync(path.join(base, 'al-standard/manifest.json'), 'utf8'));
const modular = loadManifest(fs.readFileSync(path.join(base, 'al-modular/manifest.json'), 'utf8'));
const gitignore = fs.readFileSync(path.join(base, 'al.gitignore'), 'utf8');
const empty = () => ({ rootUri: 'file:///tmp/project', state: 'new', appJsonStatus: 'missing', existingEntries: [],
  alFiles: [], objectFolders: [], detectedModules: [], issues: [], scanComplete: true });
const directory = relativePath => ({ relativePath, kind: 'directory', childrenKnown: true });
const file = relativePath => ({ relativePath, kind: 'file' });
const plan = (context = empty(), options = { profile: 'standard' }) => planALStructure(context, options.profile === 'standard' ? standard : modular, options, gitignore);
const creates = value => value.operations.filter(item => item.action === 'create');
const fails = run => assert.throws(run, TemplateValidationError);

test('app.json extracts only actually observed typed metadata, including BOM and dependencies', () => {
  const data = { id: 'app-id', name: 'Observed', publisher: 'Publisher', version: '1.0.0.0', runtime: '13.0',
    idRanges: [{ from: 50000, to: 50099 }], dependencies: [{ id: 'dep-id', name: 'Base', publisher: 'Microsoft', version: '24.0.0.0', extra: 'ignored' }], unknown: 'not copied' };
  const parsed = parseAppJson('\uFEFF' + JSON.stringify(data));
  assert.equal(parsed.name, data.name);
  assert.equal(parsed.runtime, data.runtime);
  assert.deepEqual(parsed.idRanges, data.idRanges);
  assert.deepEqual(parsed.dependencies, [{ id: 'dep-id', name: 'Base', publisher: 'Microsoft', version: '24.0.0.0' }]);
  assert.equal(parsed.unknown, undefined);
  assert.deepEqual(parseAppJson('{}'), {});
});

test('app.json rejects bad JSON, duplicate keys and invalid observed field types without repairing data', () => {
  for (const text of ['{', '[]', 'null', '{"name":"a","name":"b"}', '{"name":3}', '{"runtime":false}',
    '{"idRanges":[{"from":2,"to":1}]}', '{"idRanges":[{"from":1.2,"to":3}]}',
    '{"dependencies":{}}', '{"dependencies":[{"version":4}]}']) fails(() => parseAppJson(text));
});

test('Standard plan contains declared types, parent src and only leaf .gitkeep files', () => {
  const result = plan();
  assert.equal(result.operations.filter(item => item.kind === 'directory').length, 15);
  assert.equal(result.operations.filter(item => item.relativePath.endsWith('/.gitkeep')).length, 14);
  assert.ok(!result.operations.some(item => item.relativePath === 'src/.gitkeep'));
  assert.equal(result.operations.find(item => item.relativePath === '.gitignore').content, gitignore);
  assert.deepEqual(result, plan());
});

test('Configurable object type subset stays in manifest order and matches canonical spelling', () => {
  const result = plan(empty(), { profile: 'standard', objectTypes: ['tables', 'Codeunits', 'Tables'] });
  assert.deepEqual(result.operations.filter(item => item.kind === 'directory').map(item => item.relativePath), ['src', 'src/Codeunits', 'src/Tables']);
  fails(() => plan(empty(), { profile: 'standard', objectTypes: ['Invented'] }));
  fails(() => plan(empty(), { profile: 'standard', modules: ['Sales'] }));
  assert.equal(objectTypesFromManifest(standard).length, 14);
});

test('Modular plan validates and deduplicates explicit names without renaming them', () => {
  const result = plan(empty(), { profile: 'modular', modules: ['Sales', 'sales', 'Purchasing', 'Sales'], objectTypes: ['Tables'] });
  assert.deepEqual(result.operations.filter(item => item.kind === 'directory').map(item => item.relativePath), ['src', 'src/Sales', 'src/Sales/Tables', 'src/Purchasing', 'src/Purchasing/Tables']);
  assert.equal(result.operations.filter(item => item.relativePath.endsWith('/.gitkeep')).length, 2);
  assert.equal(plan(empty(), { profile: 'modular', modules: [] }).operations.length, 1);
  for (const name of ['../escape', 'CON', 'Sales/Other', ' name', 'C:other']) fails(() => normalizeModules([name]));
  fails(() => normalizeModules([1]));
});

test('Second plan over projected filesystem has no creates and does not mutate the first context', () => {
  const context = empty();
  const snapshot = JSON.stringify(context);
  const first = plan(context);
  const projected = { ...context, existingEntries: creates(first).map(item => item.kind === 'directory' ? directory(item.relativePath) : file(item.relativePath)) };
  assert.equal(creates(plan(projected)).length, 0);
  assert.equal(JSON.stringify(context), snapshot);
  assert.ok(first.operations.every(item => ['create', 'skip', 'conflict'].includes(item.action)));
});

test('Occupied folders get no new marker and existing Git rules are skipped without merge', () => {
  const context = { ...empty(), existingEntries: [directory('src'), directory('src/Tables'), file('src/Tables/Existing.Table.al'), file('.gitignore')] };
  const result = plan(context, { profile: 'standard', objectTypes: ['Tables'] });
  assert.ok(!result.operations.some(item => item.relativePath === 'src/Tables/.gitkeep'));
  const ignore = result.operations.find(item => item.relativePath === '.gitignore');
  assert.equal(ignore.action, 'skip');
  assert.equal(ignore.content, undefined);
  assert.ok(result.operations.every(item => item.action !== 'create'));
});

test('Existing empty directory receives one marker; existing markers remain untouched beside AL files', () => {
  const context = { ...empty(), existingEntries: [directory('src'), directory('src/Tables')] };
  let result = plan(context, { profile: 'standard', objectTypes: ['Tables'] });
  assert.equal(result.operations.find(item => item.relativePath.endsWith('/.gitkeep')).action, 'create');
  context.existingEntries.push(file('src/Tables/.gitkeep'));
  result = plan(context, { profile: 'standard', objectTypes: ['Tables'] });
  assert.equal(result.operations.find(item => item.relativePath.endsWith('/.gitkeep')).action, 'skip');
  context.existingEntries.push(file('src/Tables/Existing.Table.al'));
  result = plan(context, { profile: 'standard', objectTypes: ['Tables'] });
  assert.ok(!result.operations.some(item => item.relativePath.endsWith('/.gitkeep')));
  assert.ok(result.operations.every(item => !('delete' in item) && !('rename' in item)));
});

test('File ancestors, symlinks, case aliases and opaque directory descendants are conflicts', () => {
  for (const entry of [file('src'), { relativePath: 'src', kind: 'symlink' }, { ...directory('src'), childrenKnown: false }, directory('Src')]) {
    const result = plan({ ...empty(), existingEntries: [entry] }, { profile: 'standard', objectTypes: ['Tables'] });
    assert.equal(result.operations.find(item => item.relativePath === 'src/Tables').action, 'conflict');
    assert.equal(result.operations.find(item => item.relativePath === 'src/Tables/.gitkeep').action, 'conflict');
  }
  const ignore = plan({ ...empty(), existingEntries: [{ relativePath: '.gitignore', kind: 'symlink' }] }).operations.find(item => item.relativePath === '.gitignore');
  assert.equal(ignore.action, 'conflict');
});

test('Incomplete scans, unsafe/ambiguous snapshots and incompatible manifests block planning', () => {
  fails(() => plan({ ...empty(), scanComplete: false }));
  fails(() => plan({ ...empty(), existingEntries: [directory('src'), directory('Src')] }));
  fails(() => plan({ ...empty(), existingEntries: [file('../escape')] }));
  fails(() => planALStructure(empty(), standard, { profile: 'modular' }, gitignore));
  fails(() => objectTypesFromManifest({ ...standard, entries: [{ id: 'file', kind: 'file', target: 'src/Tables', content: '', fileType: 'text' }] }));
});

test('Gitignore snapshot protects local AL artifacts and keeps shared VS Code configuration trackable', () => {
  assert.equal(gitignore, `# AL build output and downloaded symbols
*.app
.alpackages/
.alcache/
.vscode/.alcache/

# Debugger snapshots and local logs
.snapshots/
*.log

# Personal configuration: shared .vscode files remain versionable
.vscode/*.local.json

# Local credentials, signing keys and licenses
.env
.env.*
!.env.example
*.pfx
*.p12
*.pem
*.key
*.snk
*.flf
*.bclicense

# OS metadata
.DS_Store
Thumbs.db
`);
  assert.ok(!gitignore.split('\n').some(line => ['.vscode', '.vscode/', '.vscode/**'].includes(line)));
});
