const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadManifest, loadProfileCatalog } = require('../out/templates/catalog');
const { validateManifest, validateTemplateInputs } = require('../out/core/manifestValidation');
const { validateProfileCatalog, resolveProfile, validateProfileInputs } = require('../out/core/profileValidation');
const { TemplateValidationError, validateRelativePath } = require('../out/core/templateValidation');

const resources = path.resolve(__dirname, '../resources/templates');
const read = name => fs.readFileSync(path.join(resources, name), 'utf8');
const manifest = () => ({
  schemaVersion: 1, id: 'test-manifest', version: '1.0.0',
  variables: [{ name: 'MODULE', type: 'pathSegment', required: true }],
  entries: [{ id: 'tables', kind: 'directory', target: 'src/{{MODULE}}/Tables' }]
});
const rejection = (run, code) => assert.throws(run, error => error instanceof TemplateValidationError && error.code === code);
const textFile = (id, target, content = '') => ({ id, kind: 'file', target, fileType: 'markdown', content });
const catalog = loadProfileCatalog(read('profiles.json'));
const standard = loadManifest(read('al-standard/manifest.json'));
const modular = loadManifest(read('al-modular/manifest.json'));
const bundled = [standard, modular];

test('Bundled profiles load deterministically from versioned data and preserve order', () => {
  assert.deepEqual(loadManifest(read('al-standard/manifest.json')), standard);
  assert.deepEqual(catalog.profiles.map(profile => profile.id), ['standard', 'modular']);
  const selected = resolveProfile('standard', catalog, bundled);
  assert.deepEqual(selected.manifests.map(manifest => manifest.id), ['al-standard']);
  assert.deepEqual(standard.entries.map(entry => entry.target), [
    'src/Codeunits', 'src/Pages', 'src/PageExtensions', 'src/Tables', 'src/TableExtensions',
    'src/Enums', 'src/EnumExtensions', 'src/Reports', 'src/ReportExtensions', 'src/Queries',
    'src/XmlPorts', 'src/Interfaces', 'src/Permissions', 'src/Profiles'
  ]);
  assert.deepEqual(Object.keys(validateProfileInputs('standard', catalog, bundled, {})), []);
});

test('Modular profile validates zero, one and multiple explicit modules without implicit inheritance', () => {
  const selected = resolveProfile('modular', catalog, bundled);
  assert.deepEqual(selected.manifests.map(manifest => manifest.id), ['al-modular']);
  assert.equal(modular.entries.length, standard.entries.length);
  assert.deepEqual(modular.entries.map(entry => entry.target.replace('src/{{MODULES}}/', 'src/')),
    standard.entries.map(entry => entry.target));
  for (const entry of modular.entries) {
    assert.equal(entry.repeatFor, 'MODULES');
    assert.ok(entry.target.startsWith('src/{{MODULES}}/'));
  }
  for (const names of [[], ['Sales'], ['Sales', 'Purchasing', 'Lösung']]) {
    assert.deepEqual(validateProfileInputs('modular', catalog, bundled, { MODULES: names }).MODULES, names);
  }
  rejection(() => validateProfileInputs('modular', catalog, bundled, {}), 'input');
});

test('Malformed JSON, shapes, unknown fields and incompatible versions are rejected', () => {
  rejection(() => loadManifest('{'), 'schema');
  rejection(() => loadProfileCatalog('{'), 'schema');
  for (const value of [null, [], true, 'manifest']) rejection(() => validateManifest(value), 'schema');
  for (const schemaVersion of [undefined, 0, 2, '1', '1.0']) {
    rejection(() => validateManifest({ ...manifest(), schemaVersion }), 'version');
  }
  for (const version of ['1', '01.0.0', '1.0.0-beta', '2.0', 1]) {
    assert.throws(() => validateManifest({ ...manifest(), version }), TemplateValidationError);
  }
  rejection(() => validateManifest({ ...manifest(), inherit: 'something' }), 'schema');
  rejection(() => loadManifest(read('../../templates/al-standard/manifest.json')), 'version');
  rejection(() => validateManifest({ ...manifest(), variables: {} }), 'schema');
  rejection(() => validateManifest({ ...manifest(), entries: [{}] }), 'schema');
});

test('Manifest IDs and entry IDs use the explicit portable ID grammar', () => {
  for (const id of ['', '../escape', 'UPPER', 'a b', 'a--b', 'a'.repeat(65)]) {
    rejection(() => validateManifest({ ...manifest(), id }), 'schema');
    const data = manifest(); data.entries[0].id = id;
    rejection(() => validateManifest(data), 'schema');
  }
});

test('Duplicate entry IDs, variables and portable target aliases are rejected', () => {
  const data = manifest();
  rejection(() => validateManifest({ ...data, entries: [...data.entries, { ...data.entries[0], target: 'other' }] }), 'duplicate');
  rejection(() => validateManifest({ ...data, variables: [...data.variables, data.variables[0]] }), 'duplicate');
  rejection(() => validateManifest({ ...data, entries: [...data.entries, { ...data.entries[0], id: 'alias', target: 'src/{{MODULE}}/tables' }] }), 'duplicate');
  const entries = [textFile('file', 'src'), { id: 'child', kind: 'directory', target: 'src/Tables' }];
  rejection(() => validateManifest({ ...data, entries }), 'duplicate');
  rejection(() => validateManifest({ ...data, entries: entries.toReversed() }), 'duplicate');
});

test('Traversal, absolute paths, URI schemes, encoded paths and problematic portable names fail', () => {
  for (const target of ['../escape', 'src/../escape', '/absolute', '//host/share', 'C:/absolute', 'C:\\absolute',
    'file:///tmp/test', 'vscode-remote://host/file', 'src/%2e%2e/file', 'src/%252e%252e/file',
    'src//Tables', 'src/', './src', 'src/CON', 'src/COM1.txt', 'src/LPT².log', 'src/NUL.md',
    'src/name.', 'src/name ', 'src/ name', 'src/a*b', 'src/a?b', 'src/a|b', 'src/a:b', 'src/a\u0000b',
    'src/a\nb', 'src/Cafe\u0301', 'src/{module}', 'src/' + 'a'.repeat(256)]) {
    rejection(() => validateRelativePath(target), 'path');
    rejection(() => validateManifest({ ...manifest(), entries: [{ id: 'bad', kind: 'directory', target }] }), 'path');
  }
  for (const target of ['src/Tables', 'src/Lösung', '.gitignore', 'docs/modules/INDEX.md', 'src/.gitkeep']) {
    assert.doesNotThrow(() => validateRelativePath(target));
  }
});

test('Unknown and malformed placeholders and unsafe path variable types fail before expansion', () => {
  for (const target of ['src/{{UNKNOWN}}', 'src/{{ MODULE }}', 'src/{{MODULE}', 'src/MODULE}}', 'src/{{}}']) {
    rejection(() => validateManifest({ ...manifest(), entries: [{ id: 'bad', kind: 'directory', target }] }), 'token');
  }
  const data = manifest();
  for (const type of ['text', 'boolean']) {
    rejection(() => validateManifest({ ...data, variables: [{ name: 'MODULE', type, required: true }] }), 'token');
  }
  rejection(() => validateManifest({ ...data, entries: [textFile('doc', 'README.md', '{{UNKNOWN}}')] }), 'token');
  for (const content of ['{{{MODULE}}}', '{{bad name}}', '{{{MODULE}}} {{UNKNOWN}}', '{{MODULE}} {{']) {
    rejection(() => validateManifest({ ...data, entries: [textFile('doc', 'README.md', content)] }), 'token');
  }
});

test('Files support declared content tokens and fixed file types; payload stays literal', () => {
  const data = { ...manifest(), variables: [{ name: 'PROJECT_NAME', type: 'text', required: true }],
    entries: [textFile('doc', 'README.md', '# {{PROJECT_NAME}}\n${process.exit()}')] };
  assert.equal(validateManifest(data).entries[0].content, data.entries[0].content);
  assert.equal(validateTemplateInputs(data, { PROJECT_NAME: 'My App' }).PROJECT_NAME, 'My App');
  for (const fileType of ['text', 'markdown', 'json', 'al']) {
    assert.equal(validateManifest({ ...data, entries: [{ ...data.entries[0], fileType }] }).entries[0].fileType, fileType);
  }
  rejection(() => validateManifest({ ...data, entries: [{ ...data.entries[0], fileType: 'javascript' }] }), 'schema');
  rejection(() => validateManifest({ ...data, entries: [{ ...data.entries[0], content: 42 }] }), 'schema');
});

test('Conditions only compare declared booleans and optional entries remain explicit', () => {
  const data = manifest();
  data.variables.push({ name: 'INCLUDE_DOCS', type: 'boolean', required: false, default: false });
  data.entries.push({ ...textFile('doc', 'README.md'), optional: true, condition: { variable: 'INCLUDE_DOCS', equals: true } });
  const validated = validateManifest(data);
  assert.equal(validated.entries[1].optional, true);
  assert.equal(validateTemplateInputs(validated, { MODULE: 'Sales' }).INCLUDE_DOCS, false);
  for (const condition of [{ variable: 'UNKNOWN', equals: true }, { variable: 'MODULE', equals: true },
    { variable: 'INCLUDE_DOCS', equals: 'true' }, { variable: 'INCLUDE_DOCS', equals: true, script: 'run' }]) {
    rejection(() => validateManifest({ ...data, entries: [{ ...data.entries[1], condition }] }), 'schema');
  }
  rejection(() => validateManifest({ ...data, entries: [{ ...data.entries[1], optional: 'yes' }] }), 'schema');
});

test('Repeat declarations require a pathSegments variable and a matching target token', () => {
  const data = manifest();
  for (const repeatFor of ['UNKNOWN', 'MODULE']) {
    rejection(() => validateManifest({ ...data, entries: [{ ...data.entries[0], repeatFor }] }), 'schema');
  }
  rejection(() => validateManifest({ ...data, variables: [{ name: 'MODULE', type: 'pathSegments', required: true }] }), 'token');
  const repeated = { id: 'repeated', kind: 'directory', target: 'src', repeatFor: 'MODULE' };
  rejection(() => validateManifest({ ...data, variables: [{ name: 'MODULE', type: 'pathSegments', required: true }], entries: [repeated] }), 'token');
});

test('Inputs reject missing, unknown, wrongly typed, nested-token and unsafe values', () => {
  const data = validateManifest(manifest());
  rejection(() => validateTemplateInputs(data, {}), 'input');
  rejection(() => validateTemplateInputs(data, { MODULE: 'Sales', EXTRA: 'x' }), 'input');
  for (const value of [false, [], null]) rejection(() => validateTemplateInputs(data, { MODULE: value }), 'schema');
  for (const value of ['../escape', '/escape', 'CON', '{{OTHER}}', 'Sales/Other', ' Sales', 'Sales.']) {
    rejection(() => validateTemplateInputs(data, { MODULE: value }), 'path');
  }
  const text = { ...manifest(), variables: [{ name: 'NAME', type: 'text', required: true }], entries: [textFile('doc', 'README.md', '{{NAME}}')] };
  for (const value of ['', ' ', '\n']) assert.throws(() => validateTemplateInputs(text, { NAME: value }), TemplateValidationError);
  rejection(() => validateTemplateInputs(text, { NAME: '{{OTHER}}' }), 'token');
  rejection(() => validateTemplateInputs(manifest(), JSON.parse('{"MODULE":"Sales","__proto__":"bad"}')), 'input');
});

test('Defaults are validated, copied and applied without mutating input data', () => {
  const data = manifest(); data.variables[0].default = 'Sales';
  const snapshot = JSON.stringify(data);
  assert.equal(validateTemplateInputs(data, {}).MODULE, 'Sales');
  assert.equal(validateTemplateInputs(data, { MODULE: 'Purchasing' }).MODULE, 'Purchasing');
  assert.equal(JSON.stringify(data), snapshot);
  data.variables[0].default = '../escape';
  rejection(() => validateManifest(data), 'path');
  const original = { ...modular, variables: [{ ...modular.variables[0], required: false, default: ['Sales'] }] };
  const copy = validateTemplateInputs(original, {});
  assert.notEqual(copy.MODULES, original.variables[0].default);
  const unused = { ...manifest(), variables: [{ name: 'UNUSED', type: 'text', required: false }], entries: [] };
  assert.deepEqual(Object.keys(validateTemplateInputs(unused, {})), []);
});

test('Unknown variable types, invalid names and invalid defaults are rejected', () => {
  for (const name of ['constructor', 'prototype', '__proto__', 'a-b', '1name', '']) {
    rejection(() => validateManifest({ ...manifest(), variables: [{ name, type: 'text', required: false }], entries: [] }), 'schema');
  }
  rejection(() => validateManifest({ ...manifest(), variables: [{ name: 'NAME', type: 'code', required: false }], entries: [] }), 'schema');
  rejection(() => validateManifest({ ...manifest(), variables: [{ name: 'NAME', type: 'boolean', required: false, default: 'false' }], entries: [] }), 'schema');
});

test('Expanded target collisions, file ancestors and duplicate module names are rejected', () => {
  for (const MODULES of [['Sales', 'sales'], ['Sales', 'Sales']]) {
    rejection(() => validateTemplateInputs(modular, { MODULES }), 'duplicate');
  }
  const data = manifest();
  data.entries.push({ id: 'fixed', kind: 'directory', target: 'src/Sales/Tables' });
  rejection(() => validateTemplateInputs(data, { MODULE: 'Sales' }), 'duplicate');
  assert.doesNotThrow(() => validateTemplateInputs(data, { MODULE: 'Purchasing' }));
  const parent = { ...manifest(), entries: [textFile('parent', 'src/{{MODULE}}'), { id: 'child', kind: 'directory', target: 'src/Sales/child' }] };
  rejection(() => validateTemplateInputs(parent, { MODULE: 'Sales' }), 'duplicate');
  // Substitution must recheck static prefixes that create a reserved name.
  const prefixed = { ...manifest(), entries: [{ id: 'prefix', kind: 'directory', target: 'CO{{MODULE}}' }] };
  rejection(() => validateTemplateInputs(prefixed, { MODULE: 'N' }), 'path');
});

test('Optional variables referenced by a template still need an explicit value or default', () => {
  const data = manifest(); data.variables[0].required = false;
  rejection(() => validateTemplateInputs(data, {}), 'input');
  const files = { ...data, variables: [{ name: 'TITLE', type: 'text', required: false }], entries: [textFile('doc', 'README.md', '{{TITLE}}')] };
  rejection(() => validateTemplateInputs(files, {}), 'input');
});

test('Catalogs reject unknown fields, versions, duplicate IDs and references', () => {
  rejection(() => validateProfileCatalog({ ...catalog, schemaVersion: 2 }), 'version');
  rejection(() => validateProfileCatalog({ ...catalog, inherit: 'standard' }), 'schema');
  rejection(() => validateProfileCatalog({ ...catalog, profiles: [catalog.profiles[0], catalog.profiles[0]] }), 'duplicate');
  rejection(() => validateProfileCatalog({ ...catalog, profiles: [{ ...catalog.profiles[0], manifestIds: [] }] }), 'schema');
  rejection(() => validateProfileCatalog({ ...catalog, profiles: [{ ...catalog.profiles[0], manifestIds: ['al-standard', 'al-standard'] }] }), 'duplicate');
  rejection(() => resolveProfile('missing', catalog, bundled), 'input');
  rejection(() => resolveProfile('standard', catalog, [standard]), 'schema');
  rejection(() => resolveProfile('standard', catalog, [...bundled, standard]), 'duplicate');
});

test('Composition preserves manifest order and rejects cross-manifest conflicts without overrides', () => {
  const first = validateManifest({ ...manifest(), id: 'first', variables: [], entries: [textFile('readme', 'README.md')] });
  const second = validateManifest({ ...manifest(), id: 'second', variables: [], entries: [textFile('todo', 'TODO.md')] });
  const combined = { schemaVersion: 1, profiles: [{ id: 'combined', name: 'Combined', manifestIds: ['second', 'first'] }] };
  assert.deepEqual(resolveProfile('combined', combined, [first, second]).manifests.map(item => item.id), ['second', 'first']);
  assert.deepEqual(Object.keys(validateProfileInputs('combined', combined, [first, second], {})), []);
  rejection(() => resolveProfile('combined', combined, [first, { ...second, entries: [textFile('other', 'readme.md')] }]), 'duplicate');
  rejection(() => resolveProfile('combined', combined, [first, { ...second, entries: [textFile('readme', 'other.md')] }]), 'duplicate');
  const withVariable = source => ({ ...source, variables: [{ name: 'TITLE', type: 'text', required: true }] });
  assert.equal(validateProfileInputs('combined', combined, [withVariable(first), withVariable(second)], { TITLE: 'App' }).TITLE, 'App');
  const conflicting = { ...second, variables: [{ name: 'TITLE', type: 'text', required: false }] };
  rejection(() => resolveProfile('combined', combined, [withVariable(first), conflicting]), 'duplicate');
});

test('Duplicate JSON properties including escaped aliases cannot silently override declarations', () => {
  for (const text of [
    '{"schemaVersion":1,"schemaVersion":2}',
    '{"id":"first","\\u0069d":"second"}',
    '{"entries":[{"id":"first","id":"second"}]}'
  ]) {
    rejection(() => loadManifest(text), 'duplicate');
  }
  rejection(() => loadProfileCatalog('{"schemaVersion":1,"schemaVersion":1}'), 'duplicate');
  const data = { ...manifest(), variables: [], entries: [textFile('literal', 'README.md', '{"a":"b","a":"c"} quote " slash \\')] };
  assert.deepEqual(loadManifest(JSON.stringify(data)), validateManifest(data));
});

test('Invisible formatting characters in path variables are rejected', () => {
  for (const MODULE of ['Sales\u202e', 'Sa\u200bles']) {
    rejection(() => validateTemplateInputs(manifest(), { MODULE }), 'path');
  }
});
