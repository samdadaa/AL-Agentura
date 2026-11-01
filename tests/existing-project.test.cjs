const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { detectModuleCandidates, renderModuleDocumentation } = require('../out/core/moduleDocumentation');
const { planExistingProject } = require('../out/core/existingProject');
const { EXISTING_DOCUMENT_TOKENS, loadExistingDocumentationTemplates, renderExistingDocument } = require('../out/core/existingDocumentationTemplates');
const { loadManifest, loadProfileCatalog } = require('../out/templates/catalog');
const base = path.resolve(__dirname, '../resources/templates');
const docPaths = ['AGENTS.md', 'TODO.md', 'GETTING_STARTED.md', 'docs/PROJECT.md', 'docs/ARCHITECTURE.md', 'docs/CONVENTIONS.md', 'docs/SECURITY.md', 'docs/TESTS.md', 'docs/modules/INDEX.md'];
const existingDocs = loadExistingDocumentationTemplates(fs.readFileSync(path.join(base, 'existing-project/version.json'), 'utf8'),
  Object.fromEntries(Object.keys(EXISTING_DOCUMENT_TOKENS).map(id => [id, fs.readFileSync(path.join(base, 'existing-project', id + '.md'), 'utf8')])));
const bundle = { existingDocs,
  catalog: loadProfileCatalog(fs.readFileSync(path.join(base, 'profiles.json'), 'utf8')),
  manifests: ['al-standard', 'al-modular'].map(id => loadManifest(fs.readFileSync(path.join(base, id, 'manifest.json'), 'utf8'))),
  gitignore: fs.readFileSync(path.join(base, 'al.gitignore'), 'utf8'),
  agentDocs: Object.fromEntries(docPaths.map(file => [file, fs.readFileSync(path.join(base, 'agent-docs', file), 'utf8')]))
};
function context(files = ['src/Sales/Tables/Customer.al', 'src/Purchasing/Codeunits/Purchase.al', 'app.json']) {
  const entries = new Map();
  for (const file of files) {
    const parts = file.split('/');
    for (let n = 1; n < parts.length; n++) entries.set(parts.slice(0, n).join('/'), 'directory');
    entries.set(file, 'file');
  }
  return { rootUri: 'file:///project', state: 'existing', appJsonStatus: 'valid', appJson: { name: 'Observed', publisher: 'Fixture' },
    existingEntries: [...entries].map(([relativePath, kind]) => ({ relativePath, kind, ...(kind === 'directory' ? { childrenKnown: true } : {}) })),
    alFiles: files.filter(file => file.endsWith('.al')),
    objectFolders: [...entries].filter(([p, kind]) => kind === 'directory' && ['Tables', 'Codeunits'].includes(p.split('/').at(-1)))
      .map(([relativePath]) => ({ relativePath, objectType: relativePath.split('/').at(-1) })),
    detectedModules: [], issues: [], scanComplete: true };
}
const options = (extra = {}) => ({ structure: 'preserve', modules: [], selectedModules: [], ...extra });
const plan = (ctx = context(), extra = {}) => planExistingProject(ctx, bundle, options(extra));

test('EXT-008: candidates carry only observed paths, AL files and evidence', () => {
  const modules = detectModuleCandidates(context());
  assert.deepEqual(modules.map(m => m.relativePath), ['src/Purchasing', 'src/Sales']);
  assert.deepEqual(modules.find(m => m.name === 'Sales').sources, ['al-file-paths', 'directory-structure']);
  assert.deepEqual(modules.find(m => m.name === 'Sales').alFiles, ['src/Sales/Tables/Customer.al']);
  const index = renderModuleDocumentation(context(), [], existingDocs).find(doc => doc.path.endsWith('INDEX.md')).content;
  assert.match(index, /src\/Sales/);
  assert.match(index, /directory-structure/);
  assert.match(index, /fachliche Grenzen sind zu prüfen/);
});

test('EXT-008: root and standard object folders never become fabricated business modules', () => {
  const ctx = context(['Hello.al', 'src/Tables/Customer.al', 'Codeunits/Worker.al']);
  assert.deepEqual(detectModuleCandidates(ctx), []);
  const docs = renderModuleDocumentation(ctx, [], existingDocs);
  assert.equal(docs.length, 4);
  assert.match(docs[0].content, /Keine Modulkandidaten/);
  assert.match(docs.find(d => d.path === 'AGENT_INITIALIZATION.md').content, /kein TODO-Ticket ohne meine ausdrückliche Auswahl/);
});

test('EXT-008: only confirmed modules get substantive skeletons; same names remain distinct by path', () => {
  const ctx = context(['src/Sales/Tables/A.al', 'app/Sales/Tables/B.al']);
  const docs = renderModuleDocumentation(ctx, ['src/Sales'], existingDocs);
  const module = docs.find(d => d.path === 'docs/modules/details/src/Sales.md');
  assert.ok(module);
  assert.ok(!docs.some(d => d.path.endsWith('app/Sales.md')));
  for (const heading of ['Zweck', 'Objekte', 'Datenfluss', 'Abhängigkeiten', 'Tests', 'Offene Fragen']) assert.match(module.content, new RegExp(heading));
  assert.match(module.content, /Zu prüfen/);
  assert.match(module.content, /src\/Sales\/Tables\/A.al/);
});

test('EXT-008: directory-only evidence is explicit and never claims AL objects exist', () => {
  const ctx = context([]);
  ctx.objectFolders = [{ relativePath: 'src/Empty/Tables', objectType: 'Tables' }];
  const docs = renderModuleDocumentation(ctx, ['src/Empty'], existingDocs);
  assert.match(docs.at(-1).content, /Keine AL-Dateien erkannt/);
  assert.deepEqual(detectModuleCandidates(ctx)[0].sources, ['directory-structure']);
});

test('EXT-008: module selection and candidate paths reject unknown, repeated and unsafe values', () => {
  for (const paths of [['src/Unknown'], ['src/Sales', 'src/Sales'], ['../escape']])
    assert.throws(() => renderModuleDocumentation(context(), paths, existingDocs));
  const ctx = context(); ctx.alFiles = ['../escape.al'];
  assert.throws(() => detectModuleCandidates(ctx));
});

test('EXT-009: pure plan is deterministic, ordered, includes reasons and leaves its inputs unchanged', () => {
  const ctx = context(); const before = JSON.stringify({ ctx, bundle });
  const first = plan(ctx, { selectedModules: ['src/Sales'] });
  assert.deepEqual(first, plan(ctx, { selectedModules: ['src/Sales'] }));
  assert.equal(JSON.stringify({ ctx, bundle }), before);
  for (const op of first.operations) {
    assert.ok(op.reason);
    if (op.action === 'create' && op.kind === 'file') assert.equal(typeof op.content, 'string');
    const parent = op.relativePath.split('/').slice(0, -1).join('/');
    if (parent) assert.ok(first.operations.findIndex(p => p.relativePath === parent) < first.operations.indexOf(op));
  }
});

test('EXT-009: known type, case and symlink conflicts are surfaced for preview', () => {
  for (const [relativePath, kind] of [['docs', 'file'], ['DOCS', 'directory'], ['docs', 'symlink'], ['AGENTS.md', 'directory'], ['agents.md', 'file']]) {
    const ctx = context();
    ctx.existingEntries.push({ relativePath, kind, childrenKnown: true });
    assert.ok(plan(ctx).operations.some(op => op.action === 'conflict'), `${kind}: ${relativePath}`);
  }
});

test('EXT-009: incomplete scans, invalid JSON status and ambiguous paths block planning', () => {
  for (const ctx of [{ ...context(), scanComplete: false }, { ...context(), appJsonStatus: 'invalid' }]) assert.throws(() => plan(ctx));
  const ctx = context(); ctx.existingEntries.push({ relativePath: 'APP.JSON', kind: 'file' });
  assert.throws(() => plan(ctx));
});

test('EXT-010: preserve mode never invents src folders and protects all AL/configuration/MD contents', () => {
  const ctx = context(['Legacy/Service.al', 'app.json', '.vscode/launch.json', 'AGENTS.md', 'TODO.md', '.gitignore', 'docs/modules/INDEX.md', 'docs/modules/details/Legacy.md']);
  const result = plan(ctx, { selectedModules: ['Legacy'] });
  assert.ok(!result.operations.some(op => op.action === 'create' && op.relativePath.startsWith('src/')));
  for (const file of ['Legacy/Service.al', 'app.json', '.vscode/launch.json', 'AGENTS.md', 'TODO.md', '.gitignore', 'docs/modules/INDEX.md', 'docs/modules/details/Legacy.md'])
    assert.equal(result.operations.find(op => op.relativePath === file).action, 'skip', file);
});

test('EXT-010: standard/modular folders require explicit choice and preserve existing conventions', () => {
  const standard = plan(context(), { structure: 'standard' });
  assert.ok(standard.operations.some(op => op.relativePath === 'src/Tables' && op.action === 'create'));
  const modular = plan(context(), { structure: 'modular', modules: ['New'] });
  assert.ok(modular.operations.some(op => op.relativePath === 'src/New/Codeunits'));
  assert.ok(modular.operations.every(op => !/rename|delete|move/.test(op.action)));
  assert.throws(() => plan(context(), { structure: 'modular', modules: ['../escape'] }));
});

test('EXT-010: applying projected creates makes the next plan idempotent without changing templates', () => {
  const ctx = context(); const first = plan(ctx, { selectedModules: ['src/Sales'] });
  for (const item of first.operations.filter(op => op.action === 'create')) ctx.existingEntries.push({ relativePath: item.relativePath, kind: item.kind,
    ...(item.kind === 'directory' ? { childrenKnown: true } : {}) });
  const second = plan(ctx, { selectedModules: ['src/Sales'] });
  assert.equal(second.operations.filter(op => op.action === 'create').length, 0);
});

test('Missing metadata remains explicit; only observed app.json facts appear in PROJECT', () => {
  const ctx = { ...context([]), appJsonStatus: 'missing', appJson: undefined };
  const result = plan(ctx);
  assert.ok(result.openIssues.some(issue => issue.includes('app.json fehlt')));
  const facts = plan().operations.find(op => op.relativePath === 'docs/PROJECT.md').content;
  assert.match(facts, /Observed/); assert.match(facts, /Fixture/); assert.doesNotMatch(facts, /serverInstance/);
});


test('Versioned existing templates reject unsupported versions, missing resources and invalid tokens', () => {
  const version = JSON.stringify({schemaVersion: 1, version: '1.0.0'});
  assert.throws(() => loadExistingDocumentationTemplates('{"schemaVersion":1,"version":"2.0.0"}', existingDocs.contents));
  assert.throws(() => loadExistingDocumentationTemplates(version, {}));
  assert.throws(() => loadExistingDocumentationTemplates(version, { ...existingDocs.contents, module: '{{UNKNOWN}}' }));
  assert.throws(() => renderExistingDocument(existingDocs, 'module', {}));
  const value = '{{UNKNOWN}}';
  assert.ok(renderExistingDocument(existingDocs, 'project', { OBSERVED_APP_JSON: value }).includes(value), 'Metadata remains literal, never recursively expanded');
});


test('Nested structural candidates receive disjoint file lists at the closest observed module', () => {
  const ctx = context(['src/Sales/Direct.al', 'src/Sales/Details/Tables/Nested.al']);
  const modules = detectModuleCandidates(ctx);
  assert.deepEqual(modules.find(m => m.relativePath === 'src/Sales').alFiles, ['src/Sales/Direct.al']);
  assert.deepEqual(modules.find(m => m.relativePath === 'src/Sales/Details').alFiles, ['src/Sales/Details/Tables/Nested.al']);
});
