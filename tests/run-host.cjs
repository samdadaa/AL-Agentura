const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'al-extension-host-'));
const executable = process.env.VSCODE_EXECUTABLE || 'code';
const report = path.join(temporary, 'result.json');
try {
  const result = spawnSync(executable, [
    '--wait', '--new-window', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust',
    '--user-data-dir', path.join(temporary, 'user'),
    '--extensions-dir', path.join(temporary, 'extensions'),
    `--extensionDevelopmentPath=${root}`,
    `--extensionTestsPath=${path.join(__dirname, 'host/index.cjs')}`
  ], { stdio: 'inherit', timeout: 120000, env: { ...process.env, AL_EXTENSION_HOST_REPORT: report } });
  if (result.error) console.error(`Extension-Host konnte nicht gestartet werden: ${result.error.message}`);
  const evidence = fs.existsSync(report) ? JSON.parse(fs.readFileSync(report, 'utf8')) : {};
  const passed = evidence.passed === true;
  if (evidence.error) console.error(evidence.error);
  console.log(passed ? 'Extension-Host-Prüfungen bestanden (Fundament, EXT-003, EXT-004, EXT-005).' : 'EXT-001: Kein erfolgreicher Host-Nachweis vorhanden.');
  process.exitCode = result.status === 0 && passed ? 0 : 1;
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
