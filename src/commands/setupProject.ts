import * as vscode from 'vscode';
import { Logger } from '../logging/logger';
import { runCommand } from './runCommand';

export const SETUP_COMMAND = 'alProjectAssistant.setup';

export function registerSetupCommand(logger: Logger): vscode.Disposable {
  return vscode.commands.registerCommand(SETUP_COMMAND, () => runCommand(logger, async () => {
    logger.info('Setup Project aufgerufen; Projektgenerator noch nicht implementiert.');
    await vscode.window.showInformationMessage(
      'AL Project Assistant: Projektgenerator noch nicht implementiert. ' +
      'Es wurden keine Dateien geändert. Entwicklungsstand siehe TODO.md im Extension-Repository.'
    );
  }));
}
