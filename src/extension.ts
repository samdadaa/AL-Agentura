import * as vscode from 'vscode';
import { registerInspectCommand } from './commands/inspectProject';
import { registerSetupCommand } from './commands/setupProject';
import { createLogger } from './logging/logger';

export function activate(context: vscode.ExtensionContext): void {
  const logger = createLogger();
  context.subscriptions.push(logger);
  context.subscriptions.push(registerSetupCommand(context, logger));
  context.subscriptions.push(registerInspectCommand(context.extensionUri, logger));
  logger.info('Erweiterung aktiviert.');
}
