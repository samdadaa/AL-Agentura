import * as vscode from 'vscode';
import { inspectProject } from '../analysis/inspectProject';
import { objectTypesFromManifest } from '../core/alStructure';
import { ProjectContext } from '../core/projectModels';
import { Logger } from '../logging/logger';
import { loadBundledTemplates } from '../templates/bundled';
import { resolveWorkspaceRoot } from '../workspace/resolveWorkspace';
import { runCommand } from './runCommand';

export const INSPECT_COMMAND = 'alProjectAssistant.inspect';

export function registerInspectCommand(extensionUri: vscode.Uri, logger: Logger): vscode.Disposable {
  return vscode.commands.registerCommand(INSPECT_COMMAND, async (): Promise<ProjectContext | undefined> => {
    let context: ProjectContext | undefined;
    await runCommand(logger, async () => {
      const root = await resolveWorkspaceRoot();
      if (!root) { logger.info('Projektanalyse abgebrochen; keine Änderungen vorgenommen.'); return; }
      const bundle = await loadBundledTemplates(extensionUri);
      const standard = bundle.manifests.find(manifest => manifest.id === 'al-standard');
      if (!standard) throw new Error('Standardmanifest fehlt.');
      context = await inspectProject(root, { objectTypes: objectTypesFromManifest(standard) });
      const labels = { new: 'leerer Zielordner', existing: 'bestehendes Projekt mit app.json', incomplete: 'unvollständiges oder nicht eindeutig erkanntes AL-Projekt' };
      const summary = `AL Project Assistant: ${labels[context.state]}; ${context.alFiles.length} AL-Dateien, ` +
        `${context.detectedModules.length} Strukturkandidaten. Es wurden keine Dateien geändert.`;
      logger.info('Lesende Projektanalyse beendet.');
      if (context.issues.length) await vscode.window.showWarningMessage(`${summary} ${context.issues.map(issue => issue.message).slice(0, 3).join(' ')}`);
      else await vscode.window.showInformationMessage(summary);
    }, 'Projektanalyse');
    return context;
  });
}
