const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {prepareSmokeProfile}=require('../scripts/prepare-smoke-profile.cjs');
test('Manual smoke profiles isolate repeated preparations and preserve existing demo files',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'al-smoke-helper-'));
  try{
    const vsix=path.join(directory,'fixture.vsix');fs.writeFileSync(vsix,'fixture');
    const first=prepareSmokeProfile({directory,vsix});
    const readme=path.join(first.project,'README.md');fs.writeFileSync(readme,'user content');
    const second=prepareSmokeProfile({directory,vsix});
    assert.notEqual(first.base,second.base);
    assert.equal(fs.readFileSync(readme,'utf8'),'user content');
    for(const profile of [first,second]){
      assert.equal(path.dirname(profile.base),directory);
      assert.equal(JSON.parse(fs.readFileSync(profile.workspace)).folders[0].path,'ExistingAL');
      assert.ok(fs.existsSync(path.join(profile.project,'src/Sales/Tables/Demo.Table.al')));
      assert.ok(fs.existsSync(path.join(profile.base,'NewProjects')));
      assert.ok(fs.existsSync(profile.extensions));
      assert.equal(JSON.parse(fs.readFileSync(path.join(profile.user,'User/settings.json')))['telemetry.telemetryLevel'],'off');
      assert.equal(JSON.parse(fs.readFileSync(path.join(profile.project,'app.json'))).name,'AL Agentura Demo');
    }
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('Missing VSIX fails before creating a smoke profile',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'al-smoke-missing-'));
  try{
    assert.throws(()=>prepareSmokeProfile({directory,vsix:path.join(directory,'missing.vsix')}),/VSIX fehlt/);
    assert.deepEqual(fs.readdirSync(directory),[]);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('README screenshots are actual packaged PNG assets referenced over HTTPS',()=>{
  const root=path.resolve(__dirname,'..');const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
  const files=fs.readdirSync(path.join(root,'assets/screenshots'));
  assert.equal(files.length,3);
  for(const file of files){
    const png=fs.readFileSync(path.join(root,'assets/screenshots',file));
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.ok(png.readUInt32BE(16)>=1000);assert.ok(png.readUInt32BE(20)>=600);
    assert.ok(readme.includes(`https://github.com/samdadaa/al-agentura/raw/HEAD/assets/screenshots/${file}`));
  }
});
