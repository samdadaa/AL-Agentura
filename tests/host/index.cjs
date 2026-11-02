const assert = require('node:assert/strict');
const vscode = require('vscode');
const fs = require('node:fs');

exports.run = async function () {
  const extension = vscode.extensions.getExtension(`${require('../../package.json').publisher}.al-agentura`);
  assert.ok(extension, 'Extension is discoverable');
  if (process.env.AL_EXPECT_INSTALLED) {
    const path = require('node:path');
    const relative = path.relative(process.env.AL_EXPECT_INSTALLED, extension.extensionUri.fsPath);
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Product must load from the installed VSIX, not repository source');
  }
  // onStartupFinished can activate before tests on slower hosts; both paths are valid.
  const contributed = extension.packageJSON.contributes.commands;
  assert.ok(contributed.some(command => command.command === 'alAgentura.createProject' &&
    command.title === 'AL Agent: Create Standalone Scaffold'));
  const messages = [];
  const original = vscode.window.showInformationMessage;
  const originalDialog = vscode.window.showOpenDialog;
  vscode.window.showOpenDialog = async () => undefined;
  vscode.window.showInformationMessage = async message => { messages.push(message); };
  try {
    await vscode.commands.executeCommand('alAgentura.createProject');
    assert.equal(extension.isActive, true, 'Command activates the extension');
    assert.ok((await vscode.commands.getCommands(true)).includes('alAgentura.createProject'));
    await vscode.commands.executeCommand('alAgentura.createProject');
    assert.equal(messages.length, 0);
    vscode.window.showOpenDialog = originalDialog;
    console.log('EXT-001: Extension Host passed (activation, contribution, command, repeat invocation).');
    await require('./project.cjs').run(extension);
    await require('./existing-project.cjs').run(extension);
    await require('./new-project.cjs').run(extension);
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: true, version: vscode.version }));
  } catch (error) {
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: false, error: error.stack || String(error) }));
    throw error;
  } finally {
    vscode.window.showOpenDialog = originalDialog;
    vscode.window.showInformationMessage = original;
  }
};
