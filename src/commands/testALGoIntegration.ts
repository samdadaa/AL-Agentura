import * as vscode from 'vscode';
import { Logger } from '../logging/logger';

export const TEST_AL_GO_COMMAND = 'alAgentura.testALGoIntegration';
const AL_EXTENSION_ID = 'ms-dynamics-smb.al';

/** Diagnostic only: never writes project files or changes the existing Create Project workflow. */
export function registerTestALGoIntegrationCommand(logger: Logger): vscode.Disposable {
  return vscode.commands.registerCommand(TEST_AL_GO_COMMAND, async () => {
    const al = vscode.extensions.getExtension(AL_EXTENSION_ID);
    if (!al) {
      await vscode.window.showInformationMessage('AL Agentura: Microsoft AL Language ist in diesem VS-Code-Host nicht installiert. Der eigene Generator bleibt verfügbar.');
      return;
    }
    if (!al.isActive) {
      try { await al.activate(); }
      catch {
        logger.error('Microsoft AL Language konnte nicht aktiviert werden.');
        await vscode.window.showErrorMessage('AL Agentura: Microsoft AL Language konnte nicht aktiviert werden. Siehe AL Language-Ausgabe.');
        return;
      }
    }

    const manifestCommands = (al.packageJSON as { contributes?: { commands?: Array<{command?: string; title?: string | {value?: string}}> } }).contributes?.commands ?? [];
    const available = new Set(await vscode.commands.getCommands(true));
    const matches = manifestCommands
      .filter(c => typeof c.command === 'string' && available.has(c.command))
      .filter(c => /\bgo\b|project|initialize|create/i.test(`${typeof c.title === 'string' ? c.title : c.title?.value ?? ''} ${c.command}`))
      .map(c => ({ label: typeof c.title === 'string' ? c.title : c.title?.value ?? c.command!, description: c.command!, command: c.command! }));

    logger.info(`AL Language erkannt (Version ${al.packageJSON.version ?? 'unbekannt'}). ${matches.length} mögliche Projektbefehle im Manifest registriert.`);
    if (!matches.length) {
      await vscode.window.showWarningMessage('AL Agentura: Kein passender AL-Projektbefehl im Extension-Manifest gefunden. Eine automatische AL: Go!-Integration ist noch nicht bestätigt.');
      return;
    }
    const selected = await vscode.window.showQuickPick(matches, {
      title: 'AL Agentura – AL: Go! Integrationstest',
      placeHolder: 'Wähle den Microsoft-Befehl zum manuellen Test (Escape = abbrechen)',
      matchOnDescription: true
    });
    if (!selected) return;
    const confirmed = await vscode.window.showWarningMessage(
      `Microsoft-Befehl „${selected.label}“ (${selected.command}) jetzt starten? Die AL-Erweiterung kann eigene Dialoge öffnen und Dateien erstellen.`,
      { modal: true }, 'Starten');
    if (confirmed !== 'Starten') return;

    const before = vscode.workspace.workspaceFolders?.map(f => f.uri.toString()) ?? [];
    const start = Date.now();
    let workspaceChanged = false;
    const listener = vscode.workspace.onDidChangeWorkspaceFolders(() => { workspaceChanged = true; });
    logger.info(`AL-Go-Test gestartet: ${selected.command}; geöffnete Workspace-Ordner vorher: ${before.length}.`);
    try {
      await vscode.commands.executeCommand(selected.command);
      const after = vscode.workspace.workspaceFolders?.map(f => f.uri.toString()) ?? [];
      logger.info(`AL-Go-Test: Befehlspromise nach ${Date.now() - start} ms abgeschlossen. Workspace-Wechsel-Ereignis: ${workspaceChanged ? 'ja' : 'nein'}; Ordneranzahl danach: ${after.length}.`);
      // A folder change may restart the extension host. Do not infer completion or write into a project.
      await vscode.window.showInformationMessage('AL Agentura: Testaufruf beendet. Details unter Ausgabe → AL Agentura. Bitte prüfen, ob AL: Go! die Dialoge und das Projekt erstellt hat.');
    } catch {
      logger.error(`AL-Go-Test: Befehlsaufruf fehlgeschlagen (${selected.command}).`);
      await vscode.window.showErrorMessage('AL Agentura: Aufruf des Microsoft-Befehls fehlgeschlagen. Details in der AL Language-Ausgabe prüfen.');
    } finally {
      listener.dispose();
    }
  });
}
