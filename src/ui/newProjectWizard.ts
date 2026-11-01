import * as vscode from 'vscode';
import { NewProjectOptions, parseModuleList, validateProjectName } from '../core/newProject';
import { ALConfiguration, validateALConfiguration } from '../core/alConfiguration';
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

export async function newProjectWizard(structureOnly = false): Promise<NewProjectSelection | undefined> {
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
  // Without Microsoft AL Language: prepare only AL folder and agent documentation.
  if (structureOnly) return { parent, options: { name, profile: chosen.profile, modules, includeLaunchJson: false } };
  const config = await vscode.window.showQuickPick([
    { label: 'Vorhandene app.json übernehmen', description: 'Quelle bleibt unverändert; keine eigene AL-Konfiguration erfinden', copyApp: true },
    { label: 'Neue app.json erstellen', description: 'Publisher, Version, Runtime und Objekt-IDs bewusst festlegen', copyApp: false, createApp: true },
    { label: 'AL-Konfiguration später ergänzen', description: 'Nur Workspace/Struktur vorbereiten; noch keine kompilierbare AL-App', copyApp: false, createApp: false }
  ], { title: 'Neues AL-Projekt: AL-Konfiguration' });
  if (!config) return undefined;
  let appJsonSource: vscode.Uri | undefined;
  if (config.copyApp) {
    appJsonSource = (await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
      title: 'app.json-Quelldatei auswählen', filters: { JSON: ['json'] }, openLabel: 'app.json übernehmen' }))?.[0];
    if (!appJsonSource) return undefined;
  }
  let alConfiguration: ALConfiguration | undefined;
  if ('createApp' in config && config.createApp) {
    async function ask(title: string, value: string, check: (v: string) => string | undefined): Promise<string | undefined> {
      return vscode.window.showInputBox({ title, value, validateInput: check });
    }
    const publisher = await ask('AL Publisher', '', v => v.trim() ? undefined : 'Publisher eingeben.');
    if (publisher === undefined) return undefined;
    const version = await ask('AL App-Version', '1.0.0.0', v => /^\d+\.\d+\.\d+\.\d+$/.test(v) ? undefined : 'Vier Zahlen, z. B. 1.0.0.0');
    if (version === undefined) return undefined;
    const runtime = await ask('AL Runtime (an BC-Version anpassen)', '', v => /^\d+\.\d+$/.test(v) ? undefined : 'Runtime als Major.Minor eingeben.');
    if (runtime === undefined) return undefined;
    const from = await ask('AL Objekt-ID von', '70000', v => /^\d+$/.test(v) && Number(v) > 0 ? undefined : 'Positive Objekt-ID eingeben.');
    if (from === undefined) return undefined;
    const to = await ask('AL Objekt-ID bis', '70099', v => /^\d+$/.test(v) && Number(v) >= Number(from) ? undefined : 'Ende muss mindestens Start sein.');
    if (to === undefined) return undefined;
    alConfiguration = { appName: name, publisher, version, runtime, idFrom: Number(from), idTo: Number(to) };
    try { validateALConfiguration(alConfiguration); } catch (error) { await vscode.window.showErrorMessage(String(error)); return undefined; }
  }
  const launch = await vscode.window.showQuickPick([
    { label: 'Ohne launch.json', include: false, description: 'Keine Umgebungsdaten erzeugen' },
    { label: 'Sandbox launch.json als Vorlage', include: true, description: 'Platzhalter statt echter Tenant- oder Zugangsdaten' }
  ], { title: 'Optionale AL-Debug-Konfiguration' });
  if (!launch) return undefined;
  return { parent, options: { name, profile: chosen.profile, modules, ...(alConfiguration ? { alConfiguration } : {}), includeLaunchJson: launch.include }, ...(appJsonSource ? { appJsonSource } : {}) };
}
