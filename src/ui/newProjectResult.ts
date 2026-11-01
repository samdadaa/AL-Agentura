import * as vscode from 'vscode';
import { NewProjectResult } from '../generation/createNewProject';
import { openProjectWorkspace } from '../workspace/newProject';

export async function presentNewProjectResult(result: NewProjectResult): Promise<void> {
  if (result.status === 'cancelled') return;
  if (result.status !== 'created') {
    await vscode.window.showErrorMessage(
      result.status === 'partial' ? `AL Project Assistant: Anlage teilweise fehlgeschlagen (${result.createdPaths.length} angelegte Einträge). ` +
        `Bereits vorhandene Dateien wurden nicht zurückgerollt. Gestoppt bei ${result.failedPath}. ${result.message} Ziel: ${result.rootUri}` :
        `AL Project Assistant: Anlage blockiert; keine Projektdateien erstellt. ${result.message}`
    );
    return;
  }
  let guideShown = true;
  try {
    const guide = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.Uri.parse(result.rootUri), 'GETTING_STARTED.md'));
    await vscode.window.showTextDocument(guide, { preview: false });
  } catch { guideShown = false; }
  const choice = await vscode.window.showInformationMessage(
    `AL Project Assistant: Workspace und Struktur angelegt (${result.createdPaths.length} Einträge). ` +
    (result.hasAppJson ? 'app.json übernommen; AL-Konfiguration vor Nutzung prüfen. ' : 'AL-Konfiguration noch ausstehend; noch keine kompilierbare AL-App. ') +
    (!guideShown ? 'GETTING_STARTED.md bitte im Zielordner öffnen. ' : '') +
    (result.stagingCleanupFailed ? 'Temporäre Extension-Dateien konnten nicht vollständig bereinigt werden. ' : '') +
    `Workspace: ${result.workspaceUri}`, 'Workspace öffnen', 'Später');
  if (choice === 'Workspace öffnen') {
    try { await openProjectWorkspace(result.workspaceUri); }
    catch { await vscode.window.showWarningMessage(`Dateien wurden angelegt, der Workspace konnte aber nicht geöffnet werden. Bitte manuell öffnen: ${result.workspaceUri}`); }
  }
}
