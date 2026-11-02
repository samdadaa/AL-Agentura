import * as vscode from 'vscode';
import { Logger } from '../logging/logger';
import type { AgenturaProfile } from './setupCurrentProject';
import { randomUUID } from 'node:crypto';
import { parseModuleList, NewProjectError } from '../core/newProject';
import { readAppJsonSource, statIfPresent } from '../workspace/newProject';
import { claimMicrosoftContinuation, completeMicrosoftProject } from '../generation/completeMicrosoftProject';

const AL_ID = 'ms-dynamics-smb.al';
const KEY = 'alAgentura.pendingMicrosoftProject.v1';
const MAX_AGE_MS = 15 * 60 * 1000;
interface Pending { id: string; profile: AgenturaProfile; modules: string[]; createdAt: number; originalRoots: string[]; }
let continuation: Promise<void> | undefined;

/** Only commands declared by the actual installed Microsoft extension are candidates. */
export async function findMicrosoftProjectCommands(profile: AgenturaProfile): Promise<{ command: string; title: string }[]> {
  const al = vscode.extensions.getExtension(AL_ID);
  if (!al) return [];
  if (!al.isActive) await al.activate();
  const available = new Set(await vscode.commands.getCommands(true));
  const declared = (al.packageJSON as { contributes?: { commands?: Array<{command?: string; title?: string | {value?: string}}> } }).contributes?.commands ?? [];
  return declared.flatMap(value => {
    const command = value.command;
    const title = typeof value.title === 'string' ? value.title : value.title?.value ?? '';
    if (!command || !available.has(command)) return [];
    const identity = `${title} ${command}`.toLowerCase();
    const agent = /create.{0,20}project.{0,20}agent|project.{0,20}agent|agent.{0,20}project/.test(identity);
    if (profile === 'bc-agent' ? !agent : agent || !/\bgo\b|new.{0,12}project|create.{0,12}project/.test(identity)) return [];
    return [{ command, title: title || command }];
  });
}

function roots(): string[] { return (vscode.workspace.workspaceFolders ?? []).map(f => f.uri.toString()); }
function candidate(pending: Pending): vscode.Uri | undefined {
  const dirs = vscode.workspace.workspaceFolders ?? [];
  // Never guess in a multi-root workspace or silently target a pre-existing AL project.
  if (dirs.length !== 1) return undefined;
  const uri = dirs[0].uri;
  if (uri.scheme !== 'file' || pending.originalRoots.includes(uri.toString())) return undefined;
  return uri;
}
async function isALProject(root: vscode.Uri): Promise<boolean> {
  try { await readAppJsonSource(vscode.Uri.joinPath(root, 'app.json')); return true; }
  catch { return false; } // Missing/partially written JSON is retried on changes and by polling.
}

/** All entry points share one in-host guard; the storage claim also covers other windows. */
export async function offerMicrosoftProjectContinuation(context: vscode.ExtensionContext, logger: Logger): Promise<void> {
  if (continuation) return continuation;
  continuation = resumeMicrosoftProject(context, logger);
  try { await continuation; } finally { continuation = undefined; }
}

async function resumeMicrosoftProject(context: vscode.ExtensionContext, logger: Logger): Promise<void> {
  const pending = context.globalState.get<Pending>(KEY);
  if (!pending) return;
  if (!Number.isFinite(pending.createdAt) || pending.createdAt > Date.now() || Date.now() - pending.createdAt > MAX_AGE_MS ||
      !/^[a-f0-9-]{36}$/.test(pending.id) || !['standard', 'modular', 'bc-agent'].includes(pending.profile) ||
      !Array.isArray(pending.originalRoots) || !pending.originalRoots.every(root => typeof root === 'string') ||
      !Array.isArray(pending.modules) || !pending.modules.every(module => typeof module === 'string')) {
    await context.globalState.update(KEY, undefined);
    void vscode.window.showWarningMessage('AL Agentura: Microsoft-Fortsetzung abgelaufen oder ungültig. Falls das Projekt bereits erstellt wurde, Setup Current Project verwenden.');
    return;
  }
  const root = candidate(pending);
  if (!root || !(await isALProject(root))) return;
  let phase = 'Fortsetzungssperre';
  try {
    if (!(await claimMicrosoftContinuation(context.globalStorageUri, pending.id))) return;
    phase = 'Fortsetzungsstatus speichern';
    // Consume before writes and workspace opening. A crash must never replay the job.
    await context.globalState.update(KEY, undefined);
    logger.info('Microsoft-Projekt erkannt; automatische Agentura-Ergänzung wird gestartet.');
    phase = 'Projekt ergänzen';
    const result = await completeMicrosoftProject(context.extensionUri, root, pending.profile, pending.modules);
    // Reuse this window: opening the workspace must not leave a second continuation host.
    try { await vscode.commands.executeCommand('vscode.openFolder', result.workspaceUri, { forceReuseWindow: true }); }
    catch {
      void vscode.window.showErrorMessage(`AL Agentura: Dateien ergänzt, Workspace konnte nicht geöffnet werden. Bitte manuell öffnen: ${result.workspaceUri.toString()}`);
      return;
    }
    logger.info('Microsoft-Projekt ergänzt; Workspace-Öffnung angefordert.');
  } catch (error: unknown) {
    // Storage failures also stop the job instead of producing one error per polling tick.
    if (context.globalState.get<Pending>(KEY)?.id === pending.id) await context.globalState.update(KEY, undefined);
    logger.error('Automatische Microsoft-Fortsetzung fehlgeschlagen; keine automatische Wiederholung.');
    void vscode.window.showErrorMessage(`AL Agentura: Automatische Fertigstellung fehlgeschlagen (${phase}). ` +
      (error instanceof NewProjectError ? error.message + ' ' : '') +
      'Vorhandene Dateien bleiben erhalten. Projekt prüfen und Setup Current Project für die fehlenden Einträge verwenden.');
  }
}

/** One entry point; no command IDs are guessed and nothing is copied from Microsoft. */
export async function startMicrosoftProjectFlow(context: vscode.ExtensionContext, logger: Logger, profile: AgenturaProfile): Promise<boolean> {
  if (vscode.workspace.isTrusted === false) {
    void vscode.window.showWarningMessage('AL Agentura: Microsoft-Projektbefehle sind im nicht vertrauenswürdigen Workspace deaktiviert. Der lokale Generator und die lesende Analyse bleiben verfügbar.');
    return false;
  }
  const matches = await findMicrosoftProjectCommands(profile);
  if (!matches.length) {
    await vscode.window.showWarningMessage('Der benötigte Microsoft-Projektbefehl ist nicht verfügbar. AL Language aktualisieren oder den eigenen Agentura-Generator nutzen.');
    return false;
  }
  const selected = matches.length === 1 ? matches[0] : await vscode.window.showQuickPick(
    matches.map(item => ({ label: item.title, description: item.command, ...item })),
    { title: 'Microsoft-Projektvorlage auswählen', placeHolder: profile === 'bc-agent' ? 'BC AI Agent-Vorlage' : 'AL: Go!' });
  if (!selected) return false;
  const previous = context.globalState.get<Pending>(KEY);
  if (previous && Date.now() - previous.createdAt < MAX_AGE_MS) {
    void vscode.window.showInformationMessage('AL Agentura: Ein Microsoft-Projektablauf ist bereits offen. Diesen zuerst abschließen.');
    return false;
  }
  let modules: string[] = [];
  if (profile === 'modular') {
    const input = await vscode.window.showInputBox({ title: 'Modulare Projektstruktur',
      prompt: 'Module kommagetrennt angeben (z. B. Sales, Finance)',
      validateInput: value => { try { parseModuleList(value); return undefined; } catch { return 'Gültige Modulnamen kommagetrennt angeben.'; } } });
    if (input === undefined) return false;
    modules = [...parseModuleList(input)];
  }
  // AL: Go! can populate an already open empty folder. Protect pre-existing AL
  // projects, while allowing a newly created app.json in the same empty root.
  const existingALRoots = await Promise.all(roots().map(async value =>
    await statIfPresent(vscode.Uri.joinPath(vscode.Uri.parse(value, true), 'app.json')) ? value : undefined));
  const pending: Pending = { id: randomUUID(), profile, modules, createdAt: Date.now(),
    originalRoots: existingALRoots.filter((value): value is string => value !== undefined) };
  await context.globalState.update(KEY, pending);
  logger.info(`Microsoft-Projektassistent gestartet (${selected.command}).`);
  try {
    await vscode.commands.executeCommand(selected.command);
    // Promise completion does not prove file creation; the continuation checks app.json.
    await offerMicrosoftProjectContinuation(context, logger);
    return true;
  } catch {
    if (context.globalState.get<Pending>(KEY)?.id === pending.id) await context.globalState.update(KEY, undefined);
    logger.error('Microsoft-Projektassistent konnte nicht erfolgreich gestartet werden.');
    await vscode.window.showErrorMessage('Microsoft-Projektassistent fehlgeschlagen. AL Language-Ausgabe prüfen.');
    return false;
  }
}

export function registerMicrosoftProjectResume(context: vscode.ExtensionContext, logger: Logger): vscode.Disposable {
  const resume = () => { void offerMicrosoftProjectContinuation(context, logger).catch(() => {
    logger.error('Automatische Fortsetzung konnte nicht geprüft werden.');
  }); };
  const workspace = vscode.workspace.onDidChangeWorkspaceFolders(resume);
  const watcher = vscode.workspace.createFileSystemWatcher('**/app.json');
  const created = watcher.onDidCreate(resume);
  const changed = watcher.onDidChange(resume);
  // Also covers missed events and app.json written in multiple chunks at startup.
  const timer = setInterval(resume, 1000);
  timer.unref();
  resume();
  return { dispose() { clearInterval(timer); workspace.dispose(); created.dispose(); changed.dispose(); watcher.dispose(); } };
}
