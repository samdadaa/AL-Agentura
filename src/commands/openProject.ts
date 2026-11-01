import * as vscode from 'vscode';
import { Logger } from '../logging/logger';
import { runCommand } from './runCommand';

export const OPEN_PROJECT_COMMAND = 'alAgentura.openProject';
/** VS Code performs the actual folder switch; never writes or modifies files. */
export function registerOpenProjectCommand(logger: Logger): vscode.Disposable {
  return vscode.commands.registerCommand(OPEN_PROJECT_COMMAND, async () => {
    await runCommand(logger, async () => {
      const chosen = (await vscode.window.showOpenDialog({
        canSelectFolders: true, canSelectFiles: false, canSelectMany: false,
        openLabel: 'AL-Projekt öffnen', title: 'AL Agentura: AL-Projektordner auswählen'
      }))?.[0];
      if (!chosen) return;
      await vscode.commands.executeCommand('vscode.openFolder', chosen, true);
    }, 'Projekt öffnen');
  });
}
