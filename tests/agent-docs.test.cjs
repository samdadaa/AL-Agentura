const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { renderAgentDocs } = require('../out/core/agentDocs');
const root = path.join(__dirname, '../resources/templates/agent-docs');
const files = ['AGENTS.md', 'TODO.md', 'GETTING_STARTED.md', 'README.md', 'docs/PROJECT.md', 'docs/ARCHITECTURE.md',
  'docs/CONVENTIONS.md', 'docs/SECURITY.md', 'docs/TESTS.md', 'docs/modules/INDEX.md'];
const templates = Object.fromEntries(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
test('EXT-007: Ten substantive files, all required documents and links, no unresolved variables', () => {
  const docs = renderAgentDocs(templates, 'WasserApp Test');
  assert.deepEqual(docs.map(item => item.path), files);
  for (const doc of docs) {
    assert.ok(doc.content.length > 400, `${doc.path} too short`);
    assert.doesNotMatch(doc.content, /\{\{[^{}]+\}\}/);
  }
  assert.match(docs[0].content, /WasserApp Test/);
  assert.match(docs[0].content, /TODO\.md/);
  assert.match(docs[0].content, /docs\/CONVENTIONS\.md/);
});
test('EXT-007: Pure renderer is deterministic and never alters the bundled originals', () => {
  const snapshot = JSON.stringify(templates);
  assert.deepEqual(renderAgentDocs(templates, 'Foo'), renderAgentDocs(templates, 'Foo'));
  assert.equal(JSON.stringify(templates), snapshot);
  assert.notEqual(renderAgentDocs(templates, 'Foo')[0].content, renderAgentDocs(templates, 'Bar')[0].content);
});
test('EXT-007: Missing, unexpected, empty and unrecognized placeholders fail closed', () => {
  assert.throws(() => renderAgentDocs({ ...templates, 'AGENTS.md': '' }, 'Test'));
  assert.throws(() => renderAgentDocs({ ...templates, 'AGENTS.md': '{{WRONG}}' }, 'Test'));
  assert.throws(() => renderAgentDocs(Object.fromEntries(Object.entries(templates).slice(1)), 'Test'));
  assert.throws(() => renderAgentDocs({ ...templates, 'extra.md': 'hello' }, 'Test'));
});
