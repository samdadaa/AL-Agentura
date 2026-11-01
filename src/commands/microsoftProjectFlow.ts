import * as vscode from 'vscode';
import { Logger } from '../logging/logger';
import { AgenturaProfile, SETUP_CURRENT_PROJECT_COMMAND } from './setupCurrentProject';

const AL_ID = 'ms-dynamics-smb.al';
const KEY = 'alAgentura.pendingMicrosoftProject.v1';
const MAX_AGE_MS = 15 * 60 * 1000;
interface Pending { profile: AgenturaProfile; createdAt: number; originalRoots: string[]; }

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
  // Never guess in a multi-root workspace or silently target the previous project.
  if (dirs.length !== 1) return undefined;
  const uri = dirs[0].uri;
  if (uri.scheme !== 'file' || pending.originalRoots.includes(uri.toString())) return undefined;
  return uri;
}
async function isALProject(root: vscode.Uri): Promise<boolean> {
  try {
    const info = await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, 'app.json'));
    return Boolean(info.type & vscode.FileType.File) && !(info.type & vscode.FileType.SymbolicLink);
  } catch { return false; }
}

/** Called when a new VS Code window is activated OR when the current workspace changes. */
export async function offerMicrosoftProjectContinuation(context: vscode.ExtensionContext, logger: Logger): Promise<void> {
  const pending = context.globalState?.get<Pending>(KEY);
  if (!pending) return;
  if (!Number.isFinite(pending.createdAt) || Date.now() - pending.createdAt > MAX_AGE_MS ||
      !['standard', 'modular', 'bc-agent'].includes(pending.profile) || !Array.isArray(pending.originalRoots)) {
    await context.globalState.update(KEY, undefined);
    return;
  }
  const root = candidate(pending);
  if (!root || !(await isALProject(root))) return; // Microsoft may not have finished creating the project.
  // Consume before prompts: never run twice if multiple windows/events race.
  await context.globalState.update(KEY, undefined);
  const selection = await vscode.window.showInformationMessage(
    'AL Agentura: Microsofts AL-Projekt wurde erkannt. Jetzt Projektstruktur und Agenten-Dokumentation ergänzen?',
    'AL Agentura ergänzen', 'Nicht jetzt');
  if (selection !== 'AL Agentura ergänzen') { logger.info('Microsoft-Fortsetzung vom Benutzer übersprungen.'); return; }
  logger.info('Microsoft-Projekt erkannt; bestätigte Agentura-Ergänzung wird gestartet.');
  await vscode.commands.executeCommand(SETUP_CURRENT_PROJECT_COMMAND, { rootUri: root.toString(), profile: pending.profile });
}

/** One entry point; no command IDs are guessed and nothing is copied from Microsoft. */
export async function startMicrosoftProjectFlow(context: vscode.ExtensionContext, logger: Logger, profile: AgenturaProfile): Promise<boolean> {
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
    const replace = await vscode.window.showWarningMessage('Ein früherer Microsoft-Projektablauf ist noch offen. Neuen starten?', { modal: true }, 'Neuen starten');
    if (replace !== 'Neuen starten') return false;
  }
  await context.globalState.update(KEY, { profile, createdAt: Date.now(), originalRoots: roots() } satisfies Pending);
  logger.info(`Microsoft-Projektassistent gestartet (${selected.command}).`);
  try {
    await vscode.commands.executeCommand(selected.command);
    // Promise completion does not prove file creation; the continuation checks app.json.
    await offerMicrosoftProjectContinuation(context, logger);
    return true;
  } catch {
    await context.globalState.update(KEY, undefined);
    logger.error('Microsoft-Projektassistent konnte nicht erfolgreich gestartet werden.');
    await vscode.window.showErrorMessage('Microsoft-Projektassistent fehlgeschlagen. AL Language-Ausgabe prüfen.');
    return false;
  }
}

export function registerMicrosoftProjectResume(context: vscode.ExtensionContext, logger: Logger): vscode.Disposable {
  let inProgress = false;
  const resume = async () => {
    if (inProgress) return;
    inProgress = true;
    try { await offerMicrosoftProjectContinuation(context, logger); }
    catch { logger.error('Automatische Fortsetzung fehlgeschlagen. Setup Current Project bleibt verfügbar.'); }
    finally { inProgress = false; }
  };
  // Initial activation in a newly opened project window.
  void resume();
  const workspace = vscode.workspace.onDidChangeWorkspaceFolders(() => { void resume(); });
  const watcher = vscode.workspace.createFileSystemWatcher('**/app.json');
  watcher.onDidCreate(() => { void resume(); });
  return { dispose() { workspace.dispose(); watcher.dispose(); } };
}
