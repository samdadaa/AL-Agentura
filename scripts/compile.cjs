const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {root,walk}=require('./quality-evidence.cjs');
function pruneBuildOutput(sourceDirectory, outputDirectory) {
  const expected=new Set(walk(sourceDirectory).filter(file=>file.endsWith('.ts')).flatMap(file=>{
    const relative=path.relative(sourceDirectory,file).replace(/\.ts$/,'.js');
    return [relative,relative+'.map'];
  }));
  const removed=[];
  for(const file of walk(outputDirectory)) if(/\.js(?:\.map)?$/.test(file)&&!expected.has(path.relative(outputDirectory,file))) {
    fs.rmSync(file);removed.push(file);
  }
  return removed;
}
module.exports={pruneBuildOutput};
if(require.main===module) {
  const result=spawnSync(process.execPath,[require.resolve('typescript/bin/tsc'),'-p',root],{stdio:'inherit'});
  if(result.status!==0) process.exitCode=result.status||1;
  else for(const file of pruneBuildOutput(path.join(root,'src'),path.join(root,'out')))
    console.log('Entfernte veraltete Build-Datei: '+path.relative(root,file));
}
