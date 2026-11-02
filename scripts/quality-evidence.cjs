const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
}
function fingerprint() {
  const files = ['src','resources','assets','tests','scripts'].flatMap(dir => walk(path.join(root,dir)));
  files.push(...['package.json','package-lock.json','tsconfig.json','.vscodeignore','README.md','CHANGELOG.md','LICENSE'].map(file=>path.join(root,file)).filter(fs.existsSync));
  const hash = createHash('sha256');
  for (const file of files.sort()) hash.update(path.relative(root,file).split(path.sep).join('/')).update('\0').update(fs.readFileSync(file)).update('\0');
  return hash.digest('hex');
}
function save(name, evidence) {
  const dir = path.join(root,'artifacts','quality'); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify({...evidence,timestamp:new Date().toISOString()},null,2));
}
module.exports = {root,walk,fingerprint,save};
