const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {manifestErrors}=require('../scripts/check-release.cjs');
const {readZip}=require('../scripts/check-vsix.cjs');
const manifest=require('../package.json'), lock=require('../package-lock.json');
test('V1 manifest and lockfile satisfy public release prerequisites',()=>{
  assert.deepEqual(manifestErrors(manifest,lock),[]);
  assert.match(manifest.version,/^1\.\d+\.\d+$/); assert.equal(manifest.publisher,'SamerDadah'); assert.equal(manifest.license,'MIT');
});
test('Release checks reject placeholder publishers, missing licenses, private builds and divergent lock versions',()=>{
  for(const patch of [{publisher:'local-development'},{license:undefined},{private:true},{version:'0.0.1'}])
    assert.ok(manifestErrors({...manifest,...patch},lock).length);
  assert.ok(manifestErrors(manifest,{...lock,version:'0.0.0'}).length);
  assert.ok(manifestErrors(manifest,lock,()=>false).length);
});
test('Package verifier rejects truncated or non-ZIP artifacts',()=>{
  for(const data of [Buffer.alloc(0),Buffer.from('not a VSIX'),Buffer.alloc(200)]) assert.throws(()=>readZip(data));
});
test('Runtime remains offline, declarative and has no command/UI filesystem writers',()=>{
  function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.ts')?[path.join(dir,e.name)]:[]);}
  for(const file of walk(path.resolve(__dirname,'../src'))) {
    const text=fs.readFileSync(file,'utf8');
    assert.doesNotMatch(text,/from ['"](?:node:)?(?:child_process|http|https|net|tls)['"]|\bfetch\s*\(|\beval\s*\(|new Function\s*\(/,file);
    if(/\/(commands|ui)\//.test(file.split(path.sep).join('/'))) assert.doesNotMatch(text,/workspace\.fs\.(?:writeFile|copy|rename|delete|createDirectory)\s*\(/,file);
  }
});


test('Compile removes stale generated outputs while preserving current outputs, source and other files',()=>{
  const os=require('node:os');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'al-build-test-'));
  const src=path.join(dir,'src'),out=path.join(dir,'out');fs.mkdirSync(src);fs.mkdirSync(out);
  try{
    fs.writeFileSync(path.join(src,'current.ts'),'source');
    for(const name of ['current.js','current.js.map','old.js','old.js.map','notes.txt']) fs.writeFileSync(path.join(out,name),name);
    require('../scripts/compile.cjs').pruneBuildOutput(src,out);
    assert.deepEqual(fs.readdirSync(out).sort(),['current.js','current.js.map','notes.txt']);
    assert.equal(fs.readFileSync(path.join(src,'current.ts'),'utf8'),'source');
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});


test('Release gate accepts only boolean success and complete current test evidence',()=>{
  const {evidenceErrors}=require('../scripts/check-release.cjs');
  const complete={passed:true,sourceHash:'current',tests:2,passedTests:2,failedTests:0,skippedTests:0};
  assert.deepEqual(evidenceErrors('unit',complete,'current'),[]);
  for(const patch of [{passed:2},{passed:'true'},{passed:false},{failedTests:1},{skippedTests:1},{passedTests:1},{sourceHash:'old'}])
    assert.ok(evidenceErrors('unit',{...complete,...patch},'current').length);
  assert.ok(evidenceErrors('audit',{passed:true,sourceHash:'current',vulnerabilities:{total:1}},'current').length);
});


test('VSIX icon dimensions allow 1024 boundaries and reject oversized, empty or malformed headers',()=>{
  const {iconDimensions}=require('../scripts/check-vsix.cjs');
  const original=fs.readFileSync(path.resolve(__dirname,'../assets/Logo.png'));
  assert.deepEqual(iconDimensions(original),{width:1024,height:1024});
  for(const [width,height] of [[1,1],[256,512],[1024,1024]]){
    const bytes=Buffer.from(original);bytes.writeUInt32BE(width,16);bytes.writeUInt32BE(height,20);
    assert.deepEqual(iconDimensions(bytes),{width,height});
  }
  for(const [width,height] of [[1025,1024],[1024,1025],[1254,1254],[0,1024],[1024,0]]){
    const bytes=Buffer.from(original);bytes.writeUInt32BE(width,16);bytes.writeUInt32BE(height,20);
    assert.throws(()=>iconDimensions(bytes),/maximal 1024/);
  }
  for(const bytes of [undefined,Buffer.alloc(0),original.subarray(0,24),Buffer.alloc(33)])
    assert.throws(()=>iconDimensions(bytes),/PNG-IHDR/);
});
