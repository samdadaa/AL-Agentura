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
import { startMicrosoftProjectFlow } from './microsoftProjectFlow';
import { AgenturaProfile } from './setupCurrentProject';

export const CREATE_PROJECT_COMMAND = 'alAgentura.createProject';

export function registerCreateProjectCommand(context: vscode.ExtensionContext, logger: Logger): vscode.Disposable {
  let running = false;
  return vscode.commands.registerCommand(CREATE_PROJECT_COMMAND, async (): Promise<NewProjectResult | undefined> => {
    if (running) { await vscode.window.showInformationMessage('AL Agentura: Ein Setup ist bereits geöffnet. Bitte zuerst diesen Ablauf abschließen.'); return undefined; }
    running = true;
    let result: NewProjectResult | undefined;
    try {
      await runCommand(logger, async () => {
        const al = vscode.extensions?.getExtension('ms-dynamics-smb.al');
        if (al) {
          const mode = await vscode.window.showQuickPick([
            { label: 'Standard AL', description: 'Microsoft AL: Go! + Agentura-Standardstruktur', profile: 'standard' as AgenturaProfile },
            { label: 'Modular AL', description: 'Microsoft AL: Go! + Agentura-Modulstruktur', profile: 'modular' as AgenturaProfile },
            { label: 'BC AI Agent', description: 'Microsoft-Agent-Projekt + Agentura-Dokumentation', profile: 'bc-agent' as AgenturaProfile },
            { label: 'Agentura allein (ohne Microsoft)', description: 'Bestehender unabhängiger Generator', profile: 'fallback' as const }
          ], { title: 'AL Agent: Create Project – Projektmodus' });
          if (!mode) return;
          if (mode.profile !== 'fallback') {
            await startMicrosoftProjectFlow(context, logger, mode.profile);
            return;
          }
        }
        const selection = await newProjectWizard(!al);
        if (!selection) { logger.info('Neuprojekt-Wizard abgebrochen; keine Änderungen vorgenommen.'); return; }
        let plan: NewProjectPlan;
        try {
          const bundle = await loadBundledTemplates(context.extensionUri);
          const guide = new TextDecoder('utf-8', { fatal: true }).decode(await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(context.extensionUri, 'resources', 'templates', 'new-project', 'GETTING_STARTED.md')));
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
