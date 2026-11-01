import * as vscode from 'vscode';
import { NewProjectOptions, parseModuleList, validateProjectName } from '../core/newProject';
import { TemplateValidationError } from '../core/templateValidation';

export interface NewProjectSelection {
  readonly parent: vscode.Uri;
  readonly options: NewProjectOptions;
  readonly appJsonSource?: vscode.Uri;
}
function validation(action: () => void): string | undefined {
  try { action(); return undefined; }
  catch (error: unknown) { return error instanceof TemplateValidationError ? error.message : 'Ungültige Eingabe.'; }
}

export async function newProjectWizard(): Promise<NewProjectSelection | undefined> {
  const parent = (await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false,
    title: 'Neues AL-Projekt: übergeordneten Ordner auswählen', openLabel: 'Übergeordneten Ordner wählen' }))?.[0];
  if (!parent) return undefined;
  const name = await vscode.window.showInputBox({ title: 'Neues AL-Projekt: Name', prompt: 'Ein neuer Unterordner mit diesem Namen wird vorbereitet.',
    validateInput: value => validation(() => validateProjectName(value)) });
  if (name === undefined) return undefined;
  validateProjectName(name);
  const chosen = await vscode.window.showQuickPick([
    { label: 'Standard', description: 'Gemeinsame AL-Objektordner unter src', profile: 'standard' as const },
    { label: 'Modular', description: 'Eigene AL-Objektordner je Modul', profile: 'modular' as const }
  ], { title: 'Neues AL-Projekt: Profil', placeHolder: 'Strukturprofil wählen' });
  if (!chosen) return undefined;
  let modules: readonly string[] = [];
  if (chosen.profile === 'modular') {
    const text = await vscode.window.showInputBox({ title: 'Neues AL-Projekt: Module', prompt: 'Kommagetrennt, z. B. Sales, Purchasing; leer ist erlaubt.',
      validateInput: value => validation(() => { parseModuleList(value); }) });
    if (text === undefined) return undefined;
    modules = parseModuleList(text);
  }
  const config = await vscode.window.showQuickPick([
    { label: 'Vorhandene app.json übernehmen', description: 'Quelle bleibt unverändert; keine eigene AL-Konfiguration erfinden', copyApp: true },
    { label: 'AL-Konfiguration später ergänzen', description: 'Nur Workspace/Struktur vorbereiten; noch keine kompilierbare AL-App', copyApp: false }
  ], { title: 'Neues AL-Projekt: AL-Konfiguration' });
  if (!config) return undefined;
  let appJsonSource: vscode.Uri | undefined;
  if (config.copyApp) {
    appJsonSource = (await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
      title: 'app.json-Quelldatei auswählen', filters: { JSON: ['json'] }, openLabel: 'app.json übernehmen' }))?.[0];
    if (!appJsonSource) return undefined;
  }
  return { parent, options: { name, profile: chosen.profile, modules }, ...(appJsonSource ? { appJsonSource } : {}) };
}
