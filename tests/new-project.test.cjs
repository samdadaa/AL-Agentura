const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createNewProjectDraft, validateProjectName, parseModuleList } = require('../out/core/newProject');
const { loadManifest } = require('../out/templates/catalog');
const { TemplateValidationError } = require('../out/core/templateValidation');
const base = path.resolve(__dirname, '../resources/templates');
const standard = loadManifest(fs.readFileSync(path.join(base, 'al-standard/manifest.json'), 'utf8'));
const modular = loadManifest(fs.readFileSync(path.join(base, 'al-modular/manifest.json'), 'utf8'));
const ignore = fs.readFileSync(path.join(base, 'al.gitignore'), 'utf8');
const guide = fs.readFileSync(path.join(base, 'new-project/GETTING_STARTED.md'), 'utf8');
const options = () => ({ name: 'My Project', profile: 'standard', modules: [] });
const draft = data => createNewProjectDraft(data ?? options(), (data?.profile ?? 'standard') === 'standard' ? standard : modular, ignore, guide);

test('New-project name validation rejects traversal, aliases, reserved and problematic names', () => {
  for (const name of ['', '.', '..', '../escape', '/absolute', 'CON', 'Name.', ' Name', 'Name ', '.git', 'a/b', 'a\\b', 'C:name', 'a?b', '{{NAME}}', 'a'.repeat(129)]) {
    assert.throws(() => validateProjectName(name), TemplateValidationError);
  }
  for (const name of ['My Project', 'Sales-2026', 'Lösung_1.0']) assert.doesNotThrow(() => validateProjectName(name));
});

test('Module form parses separators and deduplicates while rejecting invalid or excessive entries', () => {
  assert.deepEqual(parseModuleList('Sales, Purchasing, sales'), ['Sales', 'Purchasing']);
  assert.deepEqual(parseModuleList(''), []);
  for (const text of ['Sales,', ',Sales', 'Sales,,Purchasing', '../escape', Array.from({ length: 51 }, (_, index) => `M${index}`).join(',')]) {
    assert.throws(() => parseModuleList(text), TemplateValidationError);
  }
});

test('Workspace uses a relative project reference and deterministic JSON without environment values', () => {
  const first = draft();
  assert.deepEqual(first, draft());
  const workspace = first.operations.find(operation => operation.relativePath === 'My Project.code-workspace');
  assert.deepEqual(JSON.parse(workspace.content), { folders: [{ path: '.' }], extensions: { recommendations: ['ms-dynamics-smb.al'] } });
  assert.equal(first.workspaceFile, 'My Project.code-workspace');
  assert.ok(first.operations.every(operation => operation.action === 'create'));
});

test('Without selected AL configuration, draft prepares structure and guide without fabricated app or launch', () => {
  const result = draft();
  assert.ok(result.operations.some(operation => operation.relativePath === 'src/Tables/.gitkeep'));
  assert.ok(!result.operations.some(operation => ['app.json', '.vscode/launch.json'].includes(operation.relativePath)));
  assert.equal(result.operations.find(operation => operation.relativePath === 'GETTING_STARTED.md').content, guide);
  assert.match(guide, /noch keine kompilierbare AL-App/);
  assert.match(guide, /neuen leeren Ordner/);
});

test('Selected app.json is structurally checked but copied literally including BOM and whitespace', () => {
  const content = '\uFEFF{\n  "name": "Observed", "publisher":"P", "runtime":"13.0", "extra": [1, 2]\n}\n';
  const data = { ...options(), appJsonContent: content };
  const before = JSON.stringify(data);
  assert.equal(draft(data).operations.find(operation => operation.relativePath === 'app.json').content, content);
  assert.equal(JSON.stringify(data), before);
  for (const appJsonContent of ['{', '{"runtime":3}', '{"name":"a","name":"b"}']) {
    assert.throws(() => draft({ ...options(), appJsonContent }), TemplateValidationError);
  }
});

test('Modular new-project draft uses explicit modules and has no unnecessary parent markers', () => {
  const result = draft({ ...options(), profile: 'modular', modules: ['Sales', 'sales', 'Purchasing'] });
  assert.equal(result.operations.filter(operation => operation.relativePath.endsWith('/.gitkeep')).length, 28);
  assert.ok(!result.operations.some(operation => ['src/.gitkeep', 'src/Sales/.gitkeep'].includes(operation.relativePath)));
  assert.ok(result.operations.some(operation => operation.relativePath === 'src/Purchasing/Profiles'));
});

test('Mismatched profile and invalid configuration fail before filesystem work', () => {
  assert.throws(() => createNewProjectDraft({ ...options(), profile: 'modular' }, standard, ignore, guide), TemplateValidationError);
  assert.throws(() => draft({ ...options(), modules: ['Sales'] }), TemplateValidationError);
  assert.throws(() => draft({ ...options(), profile: 'modular', modules: ['../escape'] }), TemplateValidationError);
});

test('V1: every generated documentation and launch file has parents earlier in the plan', () => {
  const paths = ['AGENTS.md','TODO.md','GETTING_STARTED.md','docs/PROJECT.md','docs/ARCHITECTURE.md','docs/CONVENTIONS.md','docs/SECURITY.md','docs/TESTS.md','docs/modules/INDEX.md'];
  const agentDocs = Object.fromEntries(paths.map(file => [file, fs.readFileSync(path.join(base, 'agent-docs', file), 'utf8')]));
  const result = createNewProjectDraft({ ...options(), includeLaunchJson: true }, standard, ignore, guide, agentDocs);
  for (const [index, item] of result.operations.entries()) {
    const parent = item.relativePath.split('/').slice(0, -1).join('/');
    if (parent) assert.ok(result.operations.slice(0, index).some(op => op.relativePath === parent && op.kind === 'directory'), item.relativePath);
  }
  for (const directory of ['docs', 'docs/modules', '.vscode']) assert.equal(result.operations.filter(op => op.relativePath === directory).length, 1);
});
