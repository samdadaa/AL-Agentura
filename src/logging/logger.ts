import * as vscode from 'vscode';

export interface Logger extends vscode.Disposable {
  info(message: string): void;
  error(message: string): void;
}

// Only fixed operational messages belong here, never workspace content or errors.
export function createLogger(): Logger {
  const channel = vscode.window.createOutputChannel('AL Agentura');
  return {
    info: message => channel.appendLine(`[Info] ${message}`),
    error: message => channel.appendLine(`[Fehler] ${message}`),
    dispose: () => channel.dispose()
  };
}
