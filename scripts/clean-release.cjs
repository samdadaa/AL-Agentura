// Remove only disposable build/release artifacts in this checkout.
// Never remove source, templates, user projects, documentation, or Git history.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const allowedDirectories = ['out', 'artifacts', '.vscode-test'];
for (const name of allowedDirectories) {
  const target = path.join(root, name);
  if (fs.existsSync(target)) { fs.rmSync(target, { recursive: true, force: true }); console.log('Deleted generated directory:', name); }
}
for (const name of fs.readdirSync(root)) {
  if (/^al-(?:agentura|project-assistant)-[0-9]+(?:\.[0-9]+){2}\.vsix$/i.test(name)) {
    fs.rmSync(path.join(root, name)); console.log('Deleted old package:', name);
  }
}
// Exact names from the retired experimental Microsoft integration. Never use wildcards here.
const retiredIntegrationFiles = [
  'src/commands/microsoftProjectFlow.ts',
  'src/commands/testALGoIntegration.ts',
  'src/generation/completeMicrosoftProject.ts',
  'tests/microsoft-flow.test.cjs',
  'tests/host/microsoft-index.cjs',
  'tests/host/microsoft-project.cjs',
  'docs/quality/AL-GO-INTEGRATION-TEST.md',
  'docs/quality/MICROSOFT-AL-WORKFLOW.md',
  'docs/architecture/adr/0004-automatic-microsoft-completion.md',
  'docs/architecture/adr/0007-bound-project-completion.md'
];
for (const relative of retiredIntegrationFiles) {
  const target = path.join(root, relative);
  if (fs.existsSync(target)) { fs.rmSync(target); console.log('Deleted retired integration file:', relative); }
}
console.log('Cleanup complete. Active sources, tests, templates, Git history and node_modules were preserved.');
