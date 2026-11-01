const test = require('node:test');
const assert = require('node:assert/strict');
const { generateALAppJson, generateLaunchJson, validateExistingALAppJson } = require('../out/core/alConfiguration.js');
const valid = { appName: 'Demo', publisher: 'Demo Publisher', version: '1.0.0.0', runtime: '15.0', idFrom: 70000, idTo: 70099 };
test('app.json generated with explicit values, UUID and empty dependencies', () => {
  const data = JSON.parse(generateALAppJson(valid));
  assert.equal(data.name, 'Demo'); assert.equal(data.runtime, '15.0'); assert.deepEqual(data.idRanges, [{ from: 70000, to: 70099 }]);
  assert.deepEqual(data.dependencies, []); assert.deepEqual(validateExistingALAppJson(JSON.stringify(data)), []);
});
test('invalid ranges and versions are rejected', () => {
  assert.throws(() => generateALAppJson({ ...valid, idFrom: 70099, idTo: 70000 }));
  assert.throws(() => generateALAppJson({ ...valid, version: '1.0' }));
});
test('optional launch file contains only sandbox placeholder', () => {
  const data = JSON.parse(generateLaunchJson());
  assert.equal(data.configurations[0].environmentName, 'YOUR_SANDBOX_NAME');
  assert.equal(data.configurations[0].type, 'al');
});
