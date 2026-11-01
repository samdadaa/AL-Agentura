import * as vscode from 'vscode';
import { NewProjectPlan } from '../workspace/newProject';

export function newProjectPreviewText(plan: NewProjectPlan): string {
  return [
    'AL Project Assistant — Neuprojekt-Vorschau', `Ziel: ${plan.rootUri}`, `Profil: ${plan.profileId}`,
    'Nur neuer Zielordner; vorhandene Ziele werden abgewiesen.',
    plan.hasAppJson ? 'app.json: bewusst ausgewählte Quelle wird inhaltstreu kopiert; keine AL-Konformitätsgarantie.' :
      'app.json fehlt: nur Workspace-/Strukturvorbereitung, noch keine kompilierbare AL-App.',
    'Kein automatischer Aufruf von AL: Go!, keine launch.json und keine Zugangsdaten.', '',
    ...plan.operations.map(operation => `NEU ${operation.kind === 'directory' ? 'Ordner' : 'Datei'} ${operation.relativePath}`), '',
    'Abbrechen oder Schließen der Bestätigung legt keine Projektdateien an.'
  ].join('\n');
}

export async function confirmNewProject(plan: NewProjectPlan): Promise<boolean> {
  const text = newProjectPreviewText(plan);
  const document = await vscode.workspace.openTextDocument({ content: text, language: 'plaintext' });
  await vscode.window.showTextDocument(document, { preview: true });
  return await vscode.window.showWarningMessage('Neuen AL-Workspace mit der angezeigten Struktur anlegen?',
    { modal: true, detail: `Ziel: ${plan.rootUri}\n${plan.operations.length} neue Einträge. Bestand wird nicht ersetzt.\n` +
      (plan.hasAppJson ? 'Ausgewählte app.json wird übernommen.' : 'AL-Konfiguration ist noch ausstehend.') }, 'Projekt anlegen') === 'Projekt anlegen';
}
