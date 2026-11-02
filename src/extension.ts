import * as vscode from 'vscode';
import { registerAnalyzeExistingProjectCommand } from './commands/analyzeExistingProject';
import { registerOpenProjectCommand } from './commands/openProject';
import { registerSetupCurrentProjectCommand } from './commands/setupCurrentProject';
import { registerCreateProjectCommand } from './commands/createProject';
import { createLogger } from './logging/logger';

export function activate(context: vscode.ExtensionContext): void {
  const logger = createLogger();
  context.subscriptions.push(logger);
  context.subscriptions.push(registerCreateProjectCommand(context.extensionUri, logger));
  context.subscriptions.push(registerAnalyzeExistingProjectCommand(context.extensionUri, logger));
  context.subscriptions.push(registerSetupCurrentProjectCommand(context.extensionUri, logger));
  context.subscriptions.push(registerOpenProjectCommand(logger));
  logger.info('Erweiterung aktiviert.');
}
