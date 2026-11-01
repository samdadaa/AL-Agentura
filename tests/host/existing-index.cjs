const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
exports.run = async function() {
  try {
    const extension = vscode.extensions.getExtension('local-development.al-agentura');
    assert.ok(extension); await extension.activate();
    await require('./existing-project.cjs').run(extension);
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: true, version: vscode.version }));
  } catch (error) {
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: false, error: error.stack || String(error) }));
    throw error;
  }
};
