import * as vscode from 'vscode';
import { registerAnalyzeExistingProjectCommand } from './commands/analyzeExistingProject';
import { registerCreateProjectCommand } from './commands/createProject';
import { createLogger } from './logging/logger';

export function activate(context: vscode.ExtensionContext): void {
  const logger = createLogger();
  context.subscriptions.push(logger);
  context.subscriptions.push(registerCreateProjectCommand(context, logger));
  context.subscriptions.push(registerAnalyzeExistingProjectCommand(context.extensionUri, logger));
  logger.info('Erweiterung aktiviert.');
}
