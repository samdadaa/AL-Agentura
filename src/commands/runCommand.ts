import * as vscode from 'vscode';
import { Logger } from '../logging/logger';

export async function runCommand(logger: Logger, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    if (error instanceof vscode.CancellationError) {
      logger.info('Befehl abgebrochen; keine Änderungen vorgenommen.');
      return;
    }
    // Deliberately omit exception text: it may contain paths or credentials.
    logger.error('Setup Project konnte nicht ausgeführt werden.');
    await vscode.window.showErrorMessage(
      'AL Project Assistant: Setup Project konnte nicht ausgeführt werden. ' +
      'Bitte erneut versuchen. Bei Wiederholung den Fehler mit den Schritten zur Reproduktion melden.'
    );
  }
}
