const assert = require('node:assert/strict');
const vscode = require('vscode');
const fs = require('node:fs');

exports.run = async function () {
  const extension = vscode.extensions.getExtension('local-development.al-project-assistant');
  assert.ok(extension, 'Development extension is discoverable');
  assert.equal(extension.isActive, false, 'Extension activates lazily');
  const contributed = extension.packageJSON.contributes.commands;
  assert.ok(contributed.some(command => command.command === 'alProjectAssistant.setup' &&
    command.title === 'AL Project Assistant: Setup Project'));
  const messages = [];
  const original = vscode.window.showInformationMessage;
  vscode.window.showInformationMessage = async message => { messages.push(message); };
  try {
    await vscode.commands.executeCommand('alProjectAssistant.setup');
    assert.equal(extension.isActive, true, 'Command activates the extension');
    assert.ok((await vscode.commands.getCommands(true)).includes('alProjectAssistant.setup'));
    await vscode.commands.executeCommand('alProjectAssistant.setup');
    assert.equal(messages.length, 2);
    assert.ok(messages.every(message => message.includes('noch nicht implementiert')));
    console.log('EXT-001: Extension Host passed (activation, contribution, command, repeat invocation).');
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({ passed: true, version: vscode.version }));
  } finally {
    vscode.window.showInformationMessage = original;
  }
};
