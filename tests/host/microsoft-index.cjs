const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
exports.run = async function () {
  try {
    const extension = vscode.extensions.getExtension(`${require('../../package.json').publisher}.al-agentura`);
    assert.ok(extension);
    await extension.activate();
    const driver = vscode.extensions.getExtension('al-agentura-tests.al-agentura-test-driver');
    assert.ok(driver, 'Test-only API context driver is discoverable');
    const actualContext = await driver.activate();
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
