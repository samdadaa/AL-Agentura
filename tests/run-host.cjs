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
  const passed = fs.existsSync(report) && JSON.parse(fs.readFileSync(report, 'utf8')).passed === true;
  console.log(passed ? 'EXT-001: Extension-Host-Prüfungen bestanden.' : 'EXT-001: Kein erfolgreicher Host-Nachweis vorhanden.');
  process.exitCode = result.status === 0 && passed ? 0 : 1;
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
