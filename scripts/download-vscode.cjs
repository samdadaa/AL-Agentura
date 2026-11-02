// CI-only download from Microsoft's official stable update service. No product runtime dependency.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {Readable}=require('node:stream');
const {pipeline}=require('node:stream/promises');
(async()=>{
  const version=process.argv[2]||'stable';
  if(!/^(stable|\d+\.\d+\.\d+)$/.test(version)) throw new Error('Unsupported VS Code version');
  const platform=process.platform, arch=process.arch==='arm64'?'arm64':'x64';
  const target=platform==='darwin'?`darwin-${arch}`:platform==='win32'?`win32-${arch}-archive`:`linux-${arch}`;
  const dir=path.resolve('artifacts','vscode',`${target}-${version}`);fs.mkdirSync(dir,{recursive:true});
  const archive=path.join(dir,platform==='win32'?'download.zip':'download.tgz');
  const response=await fetch(`https://update.code.visualstudio.com/${version}/${target}/stable`);
  if(!response.ok||!response.body||!response.url.startsWith('https://')) throw new Error('VS Code download failed');
  await pipeline(Readable.fromWeb(response.body),fs.createWriteStream(archive));
  const extracted=spawnSync('tar',[platform==='win32'?'-xf':'-xzf',archive,'-C',dir],{stdio:'inherit'});
  if(extracted.status!==0) throw new Error('VS Code extraction failed');
  const executable=platform==='darwin'?path.join(dir,'Visual Studio Code.app','Contents','Resources','app','bin','code'):
    platform==='win32'?path.join(dir,'Code.exe'):path.join(dir,`VSCode-linux-${arch}`,'bin','code');
  if(!fs.existsSync(executable)) throw new Error('Downloaded VS Code executable not found');
  fs.rmSync(archive);
  if(process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV,`VSCODE_EXECUTABLE=${executable}\n`);
  console.log(`VS Code ${version} downloaded for ${target}: ${executable}`);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
