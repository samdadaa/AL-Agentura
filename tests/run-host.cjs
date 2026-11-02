const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {fingerprint} = require('../scripts/quality-evidence.cjs');
const sourceHash = fingerprint();
const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const temporary = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'al-agentura-host-')));
const macCode = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
const winCode = process.platform==='win32' ? [
  path.join(process.env.LOCALAPPDATA || '', 'Programs','Microsoft VS Code','Code.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft VS Code','Code.exe')
].find(fs.existsSync) : undefined;
const executable = process.env.VSCODE_EXECUTABLE || winCode || (process.platform === 'darwin' && fs.existsSync(macCode) ? macCode : 'code');
const winCli = process.platform==='win32' && /\.exe$/i.test(executable) ? path.join(path.dirname(executable),'resources','app','out','cli.js') : undefined;
const suite = process.env.AL_EXTENSION_HOST_SUITE || 'all';
const report = path.join(temporary, 'result.json');
const common = ['--user-data-dir', path.join(temporary, 'user'), '--extensions-dir', path.join(temporary, 'extensions')];
const sandbox = process.platform === 'linux' && process.getuid?.() === 0 ? ['--no-sandbox'] : [];
function run(args) {
  const result = spawnSync(executable, [...(winCli ? [winCli] : []), ...sandbox, ...args], { stdio: 'inherit', timeout: 180000, env: {
    ...process.env, ...(winCli ? {ELECTRON_RUN_AS_NODE:'1'} : {}), AL_EXTENSION_HOST_REPORT: report,
    AL_INSTALLED_TEST_ENTRY: installedEntry || '',
    AL_EXPECT_INSTALLED: suite === 'installed' ? path.join(temporary, 'extensions') : ''
  } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`VS Code exited with ${result.status}`);
}
let evidence = { passed: false, suite };
let vsixSha256;
let installedEntry;
try {
  const driver = path.join(temporary, 'extensions', 'al-agentura-tests.al-agentura-test-driver-1.0.0');
  fs.mkdirSync(driver, {recursive:true});
  for (const file of ['package.json','extension.cjs']) fs.copyFileSync(path.join(__dirname,'driver',file),path.join(driver,file));
  const restricted = suite === 'restricted';
  let workspace = [];
  if (restricted) {
    const folder = path.join(temporary, 'untrusted-project'); fs.mkdirSync(folder);
    fs.writeFileSync(path.join(folder, 'app.json'), '{"name":"Untrusted fixture","runtime":"13.0"}');
    fs.writeFileSync(path.join(folder, 'Untrusted.al'), 'codeunit 50100 UntrustedFixture {}');
    const settings = path.join(temporary, 'user', 'User'); fs.mkdirSync(settings, { recursive: true });
    fs.writeFileSync(path.join(settings, 'settings.json'), JSON.stringify({
      'security.workspace.trust.enabled': true, 'security.workspace.trust.startupPrompt': 'never',
      'security.workspace.trust.emptyWindow': false
    }));
    workspace = [folder];
  }
  if (suite === 'installed') {
    const vsix = path.resolve(process.env.AL_EXTENSION_VSIX || path.join(root, `${manifest.name}-${manifest.version}.vsix`));
    if (!fs.existsSync(vsix)) throw new Error('VSIX fehlt; zuerst npm run package ausführen.');
    vsixSha256 = require('node:crypto').createHash('sha256').update(fs.readFileSync(vsix)).digest('hex');
    run([...common, '--install-extension', vsix, '--force']);
    const installedRoot = fs.readdirSync(path.join(temporary,'extensions')).map(name=>path.join(temporary,'extensions',name)).find(dir=>{
      try { const value=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
        return value.name===manifest.name && value.publisher.toLowerCase()===manifest.publisher.toLowerCase() && value.version===manifest.version;
      } catch {return false;}
    });
    if(!installedRoot) throw new Error('Installiertes Produkt nicht gefunden.');
    // Test-only overlay: keep shipped runtime bytes unchanged, but load tests with
    // the product's own VS Code API facade. Their ../../out imports now test the VSIX code.
    const testDir=path.join(installedRoot,'tests','host'); fs.mkdirSync(testDir,{recursive:true});
    for(const file of fs.readdirSync(path.join(__dirname,'host')).filter(name=>name.endsWith('.cjs')))
      fs.copyFileSync(path.join(__dirname,'host',file),path.join(testDir,file));
    installedEntry=path.join(testDir,'index.cjs');
  }
  const entry = { microsoft: 'microsoft-index.cjs', existing: 'existing-index.cjs', restricted: 'restricted-index.cjs' }[suite] || 'index.cjs';
  run(['--wait', '--new-window', '--skip-welcome', '--skip-release-notes', ...common,
    ...(restricted ? [] : ['--disable-workspace-trust']),
    `--extensionDevelopmentPath=${suite === 'installed' ? path.join(__dirname, 'driver') : root}`,
    `--extensionTestsPath=${suite === 'installed' ? path.join(__dirname,'driver','runner.cjs') : path.join(__dirname, 'host', entry)}`, ...workspace]);
  evidence = fs.existsSync(report) ? { ...JSON.parse(fs.readFileSync(report, 'utf8')), suite } : { passed: false, suite, error: 'Kein Ergebnisnachweis aus dem Host.' };
  if (!evidence.passed) throw new Error(evidence.error);
  console.log(`Extension-Host bestanden: ${suite}, VS Code ${evidence.version}.`);
} catch (error) {
  if (fs.existsSync(report)) evidence = { ...JSON.parse(fs.readFileSync(report, 'utf8')), suite };
  evidence.passed = false;
  evidence.error ||= error.message;
  console.error(evidence.error);
  process.exitCode = 1;
} finally {
  const output = path.join(root, 'artifacts', 'quality'); fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, `host-${suite}.json`), JSON.stringify({ ...evidence, sourceHash, ...(vsixSha256 ? {vsixSha256} : {}), timestamp: new Date().toISOString(), platform: process.platform, extensionVersion: manifest.version }, null, 2));
  fs.rmSync(temporary, { recursive: true, force: true });
}
