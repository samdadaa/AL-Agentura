// Prepare a disposable, normal VSIX installation for visible manual testing.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {root}=require('./quality-evidence.cjs');
const manifest=require('../package.json');
function prepareSmokeProfile(options={}) {
  const vsix=path.resolve(options.vsix || path.join(root,`${manifest.name}-${manifest.version}.vsix`));
  if(!fs.existsSync(vsix)) throw new Error('VSIX fehlt; zuerst npm run verify ausführen.');
  const directory=path.resolve(options.directory || path.join(root,'artifacts'));
  fs.mkdirSync(directory,{recursive:true});
  const base=fs.mkdtempSync(path.join(directory,'manual-smoke-'));
  const user=path.join(base,'user'),extensions=path.join(base,'extensions'),project=path.join(base,'ExistingAL');
  for(const dir of [path.join(user,'User'),extensions,path.join(project,'src','Sales','Tables'),path.join(base,'NewProjects')])fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(user,'User','settings.json'),JSON.stringify({
    'workbench.startupEditor':'none','window.title':'AL Agentura — VSIX Smoke Test',
    'update.mode':'none','extensions.autoUpdate':false,'extensions.ignoreRecommendations':true,
    'telemetry.telemetryLevel':'off','window.dialogStyle':'custom',
    'files.simpleDialog.enable':true,'git.openRepositoryInParentFolders':'never'
  },null,2));
  fs.writeFileSync(path.join(project,'app.json'),JSON.stringify({id:'38295f8a-52b4-40db-a7d4-468b904976b4',name:'AL Agentura Demo',publisher:'Demo',version:'1.0.0.0',runtime:'13.0',idRanges:[{from:50100,to:50199}],dependencies:[]},null,2)+'\n');
  fs.writeFileSync(path.join(project,'src','Sales','Tables','Demo.Table.al'),'table 50100 "Demo"\n{\n    fields\n    {\n        field(1; Code; Code[20]) { }\n    }\n}\n');
  fs.writeFileSync(path.join(project,'README.md'),'# Demo für den VSIX-Smoke-Test\n\nDiese vorhandene Datei muss unverändert bleiben.\n');
  const workspace=path.join(base,'AL-Agentura-Smoke.code-workspace');
  fs.writeFileSync(workspace,JSON.stringify({folders:[{name:'AL Agentura Demo',path:'ExistingAL'}]},null,2)+'\n');
  return {base,user,extensions,project,workspace,vsix};
}
function openSmokeProfile(profile, options={}) {
  const mac='/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
  const win=process.platform==='win32'?[path.join(process.env.LOCALAPPDATA||'','Programs','Microsoft VS Code','Code.exe'),path.join(process.env.ProgramFiles||'','Microsoft VS Code','Code.exe')].find(fs.existsSync):undefined;
  const executable=options.executable || process.env.VSCODE_EXECUTABLE || win || (process.platform==='darwin'&&fs.existsSync(mac)?mac:'code');
  const winCli=process.platform==='win32'&&/\.exe$/i.test(executable)?path.join(path.dirname(executable),'resources','app','out','cli.js'):undefined;
  const common=['--user-data-dir',profile.user,'--extensions-dir',profile.extensions];
  const run=args=>{
    const result=spawnSync(executable,[...(winCli?[winCli]:[]),...args],{stdio:'inherit',timeout:120000,env:{...process.env,...(winCli?{ELECTRON_RUN_AS_NODE:'1'}:{})}});
    if(result.error||result.status!==0)throw new Error('VS Code konnte nicht erfolgreich ausgeführt werden. VSCODE_EXECUTABLE prüfen.');
  };
  run([...common,'--install-extension',profile.vsix,'--force']);
  if(!options.noOpen)run([...common,'--new-window','--skip-welcome','--skip-release-notes',profile.workspace]);
}
module.exports={prepareSmokeProfile,openSmokeProfile};
if(require.main===module){
  try{
    fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
    const profile=prepareSmokeProfile();
    fs.writeFileSync(path.join(root,'artifacts','manual-smoke-latest.json'),JSON.stringify(profile,null,2));
    openSmokeProfile(profile,{noOpen:process.argv.includes('--no-open')});
    console.log(`Isoliertes Testprofil vorbereitet: ${profile.base}`);
    console.log('Nur eigene Demo-Dateien. Neues Projekt unter NewProjects erstellen; Bestand unter ExistingAL prüfen. Keine persönlichen Profile verändert.');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
