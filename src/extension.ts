import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(vscode.commands.registerCommand('alProjectAssistant.setup', async () => {
    await vscode.window.showInformationMessage('AL Project Assistant: Projektgenerator noch nicht implementiert. Siehe TODO.md.');
  }));
}
export function deactivate(): void {}
