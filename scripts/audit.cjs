const {spawnSync}=require('node:child_process');
const {fingerprint,save}=require('./quality-evidence.cjs');
const sourceHash=fingerprint();
const run=spawnSync(process.execPath,[process.env.npm_execpath,'audit','--json'],{encoding:'utf8',maxBuffer:5*1024*1024});
let vulnerabilities;
try{vulnerabilities=JSON.parse(run.stdout).metadata?.vulnerabilities;}catch{}
const passed=run.status===0&&vulnerabilities?.total===0;
save('audit',{passed,sourceHash,vulnerabilities});
console.log(passed?'npm audit: keine bekannten Schwachstellen in Runtime- oder Entwicklungsabhängigkeiten.':'npm audit fehlgeschlagen oder bekannte Schwachstellen vorhanden. Registry-Verbindung und npm audit prüfen.');
process.exitCode=passed?0:1;
