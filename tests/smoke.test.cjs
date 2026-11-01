const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('Projektmanifest und Dokumentation vorhanden', () => {
  const root = path.resolve(__dirname, '..');
  for (const f of ['AGENTS.md','TODO.md','KONZEPT.md','templates/al-standard/manifest.json']) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
});
