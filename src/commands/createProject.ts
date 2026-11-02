import * as vscode from 'vscode';
import { NewProjectError } from '../core/newProject';
import { TemplateValidationError } from '../core/templateValidation';
import { createNewProject, NewProjectResult } from '../generation/createNewProject';
import { Logger } from '../logging/logger';
import { loadBundledTemplates } from '../templates/bundled';
import { confirmNewProject } from '../ui/newProjectPreview';
import { presentNewProjectResult } from '../ui/newProjectResult';
import { newProjectWizard } from '../ui/newProjectWizard';
import { NewProjectPlan, prepareNewProject, readAppJsonSource } from '../workspace/newProject';
import { runCommand } from './runCommand';

export const CREATE_PROJECT_COMMAND = 'alAgentura.createProject';

export function registerCreateProjectCommand(extensionUri: vscode.Uri, logger: Logger): vscode.Disposable {
  let running = false;
  return vscode.commands.registerCommand(CREATE_PROJECT_COMMAND, async (): Promise<NewProjectResult | undefined> => {
    if (running) { await vscode.window.showInformationMessage('AL Agentura: Ein Setup ist bereits geöffnet. Bitte zuerst diesen Ablauf abschließen.'); return undefined; }
    running = true;
    let result: NewProjectResult | undefined;
    try {
      await runCommand(logger, async () => {
        const selection = await newProjectWizard(true);
        if (!selection) { logger.info('Neuprojekt-Wizard abgebrochen; keine Änderungen vorgenommen.'); return; }
        let plan: NewProjectPlan;
        try {
          const bundle = await loadBundledTemplates(extensionUri);
          const guide = new TextDecoder('utf-8', { fatal: true }).decode(await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(extensionUri, 'resources', 'templates', 'new-project', 'GETTING_STARTED.md')));
          const appJsonContent = selection.appJsonSource ? await readAppJsonSource(selection.appJsonSource) : undefined;
          plan = await prepareNewProject(selection.parent, { ...selection.options, ...(appJsonContent !== undefined ? { appJsonContent } : {}) }, bundle, guide);
        } catch (error: unknown) {
          if (error instanceof NewProjectError || error instanceof TemplateValidationError) {
            await vscode.window.showErrorMessage(`AL Agentura: Keine Projektdateien erstellt. ${error.message}`);
            return;
          }
          throw error;
        }
        const approved = await confirmNewProject(plan);
        result = await createNewProject(plan, approved);
        logger.info(result.status === 'created' ? 'Neuprojektdateien angelegt; Ergebnis wird angezeigt.' :
          result.status === 'partial' ? 'Neuprojektanlage teilweise fehlgeschlagen; Ergebnis prüfen.' :
          result.status === 'cancelled' ? 'Neuprojektvorschau abgebrochen; keine Änderungen vorgenommen.' : 'Neuprojektanlage blockiert.');
        try { await presentNewProjectResult(result); }
        catch { logger.error('Ergebnisansicht fehlgeschlagen; Projektstatus aus der Neuprojektanlage bleibt maßgeblich.'); }
      });
      return result;
    } finally { running = false; }
  });
}
