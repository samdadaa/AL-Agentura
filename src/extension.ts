import * as vscode from 'vscode';
import { registerSetupCommand } from './commands/setupProject';
import { createLogger } from './logging/logger';

export function activate(context: vscode.ExtensionContext): void {
  const logger = createLogger();
  context.subscriptions.push(logger);
  context.subscriptions.push(registerSetupCommand(logger));
  logger.info('Erweiterung aktiviert.');
}
