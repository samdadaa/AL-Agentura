const {spawnSync}=require('node:child_process');
const path=require('node:path');
const {root}=require('./quality-evidence.cjs');
const npm=process.env.npm_execpath;
for(const script of ['test','audit','test:host','test:host:microsoft','test:restricted','package','test:package','test:installed','release:check']) {
  console.log(`\nV1-Prüfung: ${script}`);
  const result=spawnSync(process.execPath,[npm,'run',script],{cwd:root,stdio:'inherit',env:{...process.env,AL_EXTENSION_HOST_SUITE:''}});
  if(result.status!==0) {process.exitCode=result.status||1;break;}
}
