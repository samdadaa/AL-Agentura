const fs=require('node:fs');
const path=require('node:path');
const {inflateRawSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const {root,walk,fingerprint,save}=require('./quality-evidence.cjs');
function readZip(buffer) {
  let end=-1;
  for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--) if(buffer.readUInt32LE(i)===0x06054b50 && i+22+buffer.readUInt16LE(i+20)===buffer.length) {end=i;break;}
  if(end<0) throw new Error('Kein gültiges ZIP32-Ende.');
  const entries=new Map(); let offset=buffer.readUInt32LE(end+16);
  const count=buffer.readUInt16LE(end+10);
  for(let i=0;i<count;i++) {
    if(buffer.readUInt32LE(offset)!==0x02014b50) throw new Error('Ungültiges ZIP-Verzeichnis.');
    const method=buffer.readUInt16LE(offset+10), size=buffer.readUInt32LE(offset+20), uncompressed=buffer.readUInt32LE(offset+24);
    const nameSize=buffer.readUInt16LE(offset+28), extra=buffer.readUInt16LE(offset+30), comment=buffer.readUInt16LE(offset+32);
    const name=buffer.subarray(offset+46,offset+46+nameSize).toString('utf8');
    if(entries.has(name)||name.startsWith('/')||name.split('/').some(p=>p==='..')||name.includes('\\')) throw new Error('Unsicherer oder doppelter ZIP-Pfad.');
    if(uncompressed>50*1024*1024) throw new Error('Zu großer Paketinhalt.');
    const local=buffer.readUInt32LE(offset+42);
    if(buffer.readUInt32LE(local)!==0x04034b50) throw new Error('Ungültiger lokaler ZIP-Eintrag.');
    const start=local+30+buffer.readUInt16LE(local+26)+buffer.readUInt16LE(local+28);
    if(start+size>buffer.length) throw new Error('Abgeschnittener ZIP-Inhalt.');
    const content=buffer.subarray(start,start+size);
    const data=method===0?content:method===8?inflateRawSync(content,{maxOutputLength:50*1024*1024}):undefined;
    if(!data||data.length!==uncompressed) throw new Error('Nicht unterstützte Komprimierung oder falsche ZIP-Größe.');
    entries.set(name,data); offset+=46+nameSize+extra+comment;
  }
  return entries;
}
function iconDimensions(bytes) {
  if(!bytes || bytes.length<33 || bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a' ||
    bytes.readUInt32BE(8)!==13 || bytes.subarray(12,16).toString('ascii')!=='IHDR')
    throw new Error('Extension-Icon muss einen gültigen PNG-IHDR-Header besitzen.');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width<1 || height<1 || width>1024 || height>1024)
    throw new Error(`Extension-Icon ist ${width} × ${height} Pixel; maximal 1024 × 1024 Pixel erlaubt.`);
  return {width,height};
}
function checkVsix(file) {
  const manifest=require('../package.json'); const bytes=fs.readFileSync(file); const entries=readZip(bytes);
  const allowed=name=>name==='[Content_Types].xml'||name==='extension.vsixmanifest'||
    /^extension\/(?:package\.json|readme\.md|changelog\.md|license(?:\.txt)?|assets\/Logo\.png)$/i.test(name)||
    /^extension\/assets\/screenshots\/[a-z0-9-]+\.png$/.test(name)||
    /^extension\/out\/[\w/.-]+\.js$/.test(name)||/^extension\/resources\/templates\/[\w/.-]+\.(?:json|md|gitignore)$/.test(name);
  for(const name of entries.keys()) if(!allowed(name)) throw new Error(`Unerwartete Datei im VSIX: ${name}`);
  const find=name=>[...entries.keys()].find(key=>key.toLowerCase()===name.toLowerCase());
  for(const file of ['README.md','CHANGELOG.md','LICENSE',...walk(path.join(root,'assets')).filter(file=>!path.basename(file).startsWith('.')).map(file=>path.relative(root,file)),...walk(path.join(root,'out')).filter(file=>file.endsWith('.js')).map(file=>path.relative(root,file)),
    ...walk(path.join(root,'resources')).filter(file=>!path.basename(file).startsWith('.')).map(file=>path.relative(root,file))]) {
    const key=find('extension/'+file.split(path.sep).join('/')) || (file==='LICENSE' ? find('extension/LICENSE.txt') : undefined);
    if(!key||!entries.get(key).equals(fs.readFileSync(path.join(root,file)))) throw new Error(`Fehlende/veraltete Paketdatei: ${file}`);
  }
  const sourceOutputs=new Set(walk(path.join(root,'src')).filter(file=>file.endsWith('.ts')).map(file=>'extension/out/'+path.relative(path.join(root,'src'),file).split(path.sep).join('/').replace(/\.ts$/,'.js')));
  for(const name of entries.keys()) if(name.startsWith('extension/out/') && !sourceOutputs.has(name)) throw new Error('Veraltete/unbekannte Runtime-Datei: '+name);
  const icon=iconDimensions(entries.get('extension/'+manifest.icon));
  const packaged=JSON.parse(entries.get('extension/package.json'));
  for(const field of ['name','version','publisher','license','icon','main']) if(packaged[field]!==manifest[field]) throw new Error('Paketmetadaten stimmen nicht: '+field);
  const xml=entries.get('extension.vsixmanifest').toString('utf8');
  if(!xml.includes('extension/assets/Logo.png')||!xml.includes(`Version="${manifest.version}"`)||!xml.includes(`Publisher="${manifest.publisher}"`)) throw new Error('VSIX-Metadaten oder Logo fehlen.');
  return {passed:true,sourceHash:fingerprint(),version:manifest.version,icon,sha256:createHash('sha256').update(bytes).digest('hex'),files:entries.size};
}
module.exports={readZip,checkVsix,iconDimensions};
if(require.main===module) {
  try {
    const manifest=require('../package.json');
    const evidence=checkVsix(path.resolve(process.argv[2]||`${manifest.name}-${manifest.version}.vsix`));
    save('package',evidence); console.log(`VSIX geprüft: ${evidence.files} Dateien, SHA-256 ${evidence.sha256}`);
  } catch(error) {save('package',{passed:false,sourceHash:fingerprint(),error:error.message});console.error(error.message);process.exitCode=1;}
}
