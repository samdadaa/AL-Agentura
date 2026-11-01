const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
exports.run = async function () {
  try {
    const extension = vscode.extensions.getExtension('local-development.al-agentura');
    assert.ok(extension);
    const flow = require('../../out/commands/microsoftProjectFlow');
    const register = flow.registerMicrosoftProjectResume;
    let actualContext;
    flow.registerMicrosoftProjectResume = (context, logger) => {
      actualContext = context;
      return register(context, logger);
    };
    try { await extension.activate(); } finally { flow.registerMicrosoftProjectResume = register; }
    assert.ok(actualContext, 'Activation context captured');
    const { claimMicrosoftContinuation } = require('../../out/generation/completeMicrosoftProject');
    try {
      const id = require('node:crypto').randomUUID();
      assert.equal(await claimMicrosoftContinuation(actualContext.globalStorageUri, id), true);
      assert.equal(await claimMicrosoftContinuation(actualContext.globalStorageUri, id), false);
      await assert.rejects(() => claimMicrosoftContinuation(actualContext.globalStorageUri.with({ scheme: 'https' }), id), /Speicher/);
      await assert.rejects(() => claimMicrosoftContinuation(actualContext.globalStorageUri.with({ authority: 'remote' }), id), /Speicher/);
    } catch (error) {
      throw new Error(`Real storage claim failed (scheme=${actualContext.globalStorageUri.scheme}): ${error.message}`);
    }
    await require('./microsoft-project.cjs').run(extension);
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: true, version: vscode.version }));
  } catch (error) {
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: false, error: error.stack || String(error) }));
    throw error;
  }
};
