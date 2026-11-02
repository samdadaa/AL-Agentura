const fs = require('node:fs');
const path = require('node:path');
const {root,fingerprint} = require('./quality-evidence.cjs');
function manifestErrors(manifest, lock, exists = file => fs.existsSync(path.join(root,file))) {
  const errors=[];
  if (!/^[1-9]\d*\.\d+\.\d+$/.test(manifest.version)) errors.push('Eine stabile Version ab 1.0.0 ist erforderlich.');
  if (!manifest.publisher || /^(local-development|publisher|your-publisher)$/i.test(manifest.publisher)) errors.push('Registrierte Publisher-ID fehlt.');
  if (manifest.private) errors.push('Entwicklungsmarkierung private entfernen.');
  if (!manifest.license || !exists('LICENSE')) errors.push('Bewusst gewählte Lizenz samt LICENSE fehlt.');
  if (lock.version!==manifest.version || lock.packages?.['']?.version!==manifest.version) errors.push('Versionen in Manifest/Lockfile stimmen nicht überein.');
  for (const file of ['README.md','CHANGELOG.md',manifest.icon,manifest.main]) if (!file || !exists(file)) errors.push(`Benötigte Ressource fehlt: ${file}`);
  if (manifest.main!=='./out/extension.js') errors.push('Unerwarteter Extension-Einstieg.');
  if (manifest.dependencies && Object.keys(manifest.dependencies).length) errors.push('Runtime-Abhängigkeiten benötigen eine neue Paketprüfung.');
  if (manifest.capabilities?.untrustedWorkspaces?.supported!=='limited') errors.push('Restricted-Mode-Vertrag fehlt.');
  if (!manifest.repository?.url?.startsWith('https://github.com/') || !manifest.bugs?.url?.startsWith('https://')) errors.push('Repository-/Support-Metadaten fehlen.');
  return errors;
}
function evidenceErrors(name, evidence, sourceHash) {
  const errors=[];
  if(evidence.passed!==true || evidence.sourceHash!==sourceHash) errors.push(`Testnachweis fehlgeschlagen oder veraltet: ${name}`);
  if(name==='unit' && (!(evidence.tests>0) || evidence.passedTests!==evidence.tests || evidence.failedTests!==0 || evidence.skippedTests!==0))
    errors.push('Unit-Testzähler sind unvollständig oder enthalten Fehler/Skips.');
  if(name==='audit' && evidence.vulnerabilities?.total!==0) errors.push('Audit-Nachweis enthält Schwachstellen oder ist unvollständig.');
  return errors;
}
function checkRelease() {
  const manifest=require('../package.json'); const lock=require('../package-lock.json');
  const errors=manifestErrors(manifest,lock);
  const sourceHash=fingerprint();
  let packageHash, installedHash;
  for (const name of ['unit','audit','host-all','host-microsoft','host-restricted','host-installed','package']) {
    const file=path.join(root,'artifacts','quality',name+'.json');
    let evidence; try {evidence=JSON.parse(fs.readFileSync(file,'utf8'));} catch {errors.push(`Testnachweis fehlt: ${name}`);continue;}
    if (name==='package') packageHash=evidence.sha256;
    if (name==='host-installed') installedHash=evidence.vsixSha256;
    errors.push(...evidenceErrors(name,evidence,sourceHash));
  }
  const vsix=path.join(root,`${manifest.name}-${manifest.version}.vsix`);
  const actual=fs.existsSync(vsix) ? require('node:crypto').createHash('sha256').update(fs.readFileSync(vsix)).digest('hex') : undefined;
  if(!packageHash || actual!==packageHash || installedHash!==packageHash) errors.push('VSIX fehlt, wurde verändert oder entspricht nicht dem installierten Testpaket.');
  return errors;
}
module.exports={manifestErrors,evidenceErrors,checkRelease};
if(require.main===module) {
  const errors=checkRelease();
  if(errors.length) {console.error(errors.map(e=>'Release blockiert: '+e).join('\n'));process.exitCode=1;}
  else console.log('Technischer V1-Release-Check bestanden. Manuelle Plattform-/Microsoft-Abnahme und Marketplace-Upload bleiben beim Herausgeber.');
}
