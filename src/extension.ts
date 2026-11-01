import * as vscode from 'vscode';
import { registerAnalyzeExistingProjectCommand } from './commands/analyzeExistingProject';
import { registerOpenProjectCommand } from './commands/openProject';
import { registerSetupCurrentProjectCommand } from './commands/setupCurrentProject';
import { registerCreateProjectCommand } from './commands/createProject';
import { createLogger } from './logging/logger';
import { registerTestALGoIntegrationCommand } from './commands/testALGoIntegration';
import { registerMicrosoftProjectResume } from './commands/microsoftProjectFlow';

export function activate(context: vscode.ExtensionContext): void {
  const logger = createLogger();
  context.subscriptions.push(logger);
  context.subscriptions.push(registerCreateProjectCommand(context, logger));
  context.subscriptions.push(registerAnalyzeExistingProjectCommand(context.extensionUri, logger));
  context.subscriptions.push(registerSetupCurrentProjectCommand(context.extensionUri, logger));
  context.subscriptions.push(registerOpenProjectCommand(logger));
  context.subscriptions.push(registerTestALGoIntegrationCommand(logger));
  // In a new workspace window, the extension must activate without an explicit command.
  if (context.globalState)
    context.subscriptions.push(registerMicrosoftProjectResume(context, logger));
  logger.info('Erweiterung aktiviert.');
}
