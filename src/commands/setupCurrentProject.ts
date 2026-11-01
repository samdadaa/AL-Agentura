import * as vscode from 'vscode';
import { inspectProject } from '../analysis/inspectProject';
import { renderAgentDocs } from '../core/agentDocs';
import { objectTypesFromManifest } from '../core/alStructure';
import { pathKey } from '../core/templateValidation';
import { planALStructure } from '../core/structurePlan';
import { Logger } from '../logging/logger';
import { loadBundledTemplates } from '../templates/bundled';
import { resolveWorkspaceRoot } from '../workspace/resolveWorkspace';
import { assertDirectoryChain, assertMissingChild } from '../workspace/newProject';
import { runCommand } from './runCommand';

export const SETUP_CURRENT_PROJECT_COMMAND = 'alAgentura.setupCurrentProject';
export type AgenturaProfile = 'standard' | 'modular' | 'bc-agent';
export interface SetupRequest { readonly rootUri?: string; readonly profile?: AgenturaProfile; }


export function registerSetupCurrentProjectCommand(extensionUri: vscode.Uri, logger: Logger): vscode.Disposable {
  return vscode.commands.registerCommand(SETUP_CURRENT_PROJECT_COMMAND, async (request?: SetupRequest) => {
    await runCommand(logger, async () => {
      const root = request?.rootUri ? vscode.Uri.parse(request.rootUri, true) : await resolveWorkspaceRoot();
      if (!root) return;
      if (root.scheme !== 'file' || root.authority || vscode.workspace.fs.isWritableFileSystem(root.scheme) === false) {
        await vscode.window.showWarningMessage('AL Agentura: Sichere Ergänzung ist momentan nur in lokalen, beschreibbaren Ordnern möglich.');
        return;
      }
      const bundle = await loadBundledTemplates(extensionUri);
      const profile = request?.profile ? { id: request.profile } : await vscode.window.showQuickPick([
        { label: 'Standard', id: 'standard' as const },
        { label: 'Modular', id: 'modular' as const },
        { label: 'BC AI Agent', id: 'bc-agent' as const, description: 'Microsofts Agent-Vorlage bewahren; nur Agentura-Dokumentation ergänzen' }
      ], { title: 'AL Agent: Struktur im geöffneten Projekt ergänzen' });
      if (!profile) return;
      const manifest = bundle.manifests.find(item => item.id === `al-${profile.id === 'bc-agent' ? 'standard' : profile.id}`);
      if (!manifest) throw new Error('Profilmanifest fehlt.');
      const context = await inspectProject(root, { objectTypes: objectTypesFromManifest(manifest) });
      if (!context.scanComplete) {
        await vscode.window.showWarningMessage('AL Agentura: Projektanalyse unvollständig. Aus Sicherheitsgründen keine Dateien angelegt.');
        return;
      }
      let modules: readonly string[] = [];
      if (profile.id === 'modular') {
        // Only explicitly entered, validated modules; no speculative module names.
        const input = await vscode.window.showInputBox({ prompt: 'Module kommagetrennt angeben (z. B. Sales, Finance)', title: 'Modulare Projektstruktur' });
        if (input === undefined) return;
        const { parseModuleList } = await import('../core/newProject');
        modules = parseModuleList(input);
      }
      const structure = profile.id === 'bc-agent'
        ? { operations: [] as ReturnType<typeof planALStructure>['operations'] }
        : planALStructure(context, manifest, { profile: profile.id, modules }, bundle.gitignore);
      const name = context.appJson?.name ?? root.path.split('/').filter(Boolean).at(-1) ?? 'AL-Projekt';
      const docs = renderAgentDocs(bundle.agentDocs, name);
      const operations = [...structure.operations, ...docs.map(doc => {
        const found = context.existingEntries.find(item => pathKey(item.relativePath) === pathKey(doc.path));
        return { relativePath: doc.path, kind: 'file' as const, action: found ? 'skip' as const : 'create' as const,
          content: doc.content, reason: found ? 'Existiert; bleibt unverändert' : 'Fehlende Agenten-Dokumentation' };
      })];
      const conflicts = operations.filter(item => item.action === 'conflict');
      // Case-insensitive conflicts among docs are always unsafe, too.
      const docConflicts = docs.filter(doc => context.existingEntries.some(entry =>
        pathKey(entry.relativePath) === pathKey(doc.path) && entry.relativePath !== doc.path));
      if (conflicts.length || docConflicts.length) {
        await vscode.window.showWarningMessage('AL Agentura: Dateikonflikte erkannt; keine Änderungen. Bitte Projektstruktur prüfen.');
        return;
      }
      const create = operations.filter(item => item.action === 'create');
      const preview = await vscode.workspace.openTextDocument({ language: 'plaintext', content:
        `AL Agentura – Ergänzung ohne Überschreiben\nZiel: ${root.toString()}\n\n` +
        operations.map(item => `${item.action === 'create' ? 'NEU' : 'BLEIBT'} ${item.relativePath}`).join('\n') });
      await vscode.window.showTextDocument(preview, { preview: true });
      const choice = await vscode.window.showWarningMessage(`${create.length} fehlende Einträge anlegen? Bestehende Dateien bleiben unverändert.`,
        { modal: true }, 'Fehlende Dateien anlegen');
      if (choice !== 'Fehlende Dateien anlegen') return;
      await assertDirectoryChain(root);
      let made = 0;
      for (const item of create) {
        const dest = vscode.Uri.joinPath(root, ...item.relativePath.split('/'));
        const parent = vscode.Uri.joinPath(dest, '..');
        // Explicitly add new parents for nested documentation; no overwrites.
        const parts = item.relativePath.split('/').slice(0, -1);
        let ancestor = root;
        for (const segment of parts) {
          const next = vscode.Uri.joinPath(ancestor, segment);
          try { await vscode.workspace.fs.stat(next); }
          catch (error) {
            if (!(error instanceof vscode.FileSystemError) || error.code !== 'FileNotFound') throw error;
            await assertMissingChild(ancestor, segment);
            await vscode.workspace.fs.createDirectory(next);
          }
          await assertDirectoryChain(next);
          ancestor = next;
        }
        await assertDirectoryChain(parent);
        await assertMissingChild(parent, item.relativePath.split('/').at(-1)!);
        if (item.kind === 'directory') await vscode.workspace.fs.createDirectory(dest);
        else {
          const data = new TextEncoder().encode(item.content ?? '');
          // VS Code API does not offer an exclusive write; use copy(overwrite:false).
          const stage = vscode.Uri.joinPath(root, `.al-agentura-stage-${Date.now()}-${made}`);
          try {
            await assertMissingChild(root, stage.path.split('/').at(-1)!);
            await vscode.workspace.fs.writeFile(stage, data);
            await vscode.workspace.fs.copy(stage, dest, { overwrite: false });
          } finally { try { await vscode.workspace.fs.delete(stage); } catch { /* report remaining stage in status */ } }
        }
        made++;
      }
      await vscode.window.showInformationMessage(`AL Agentura: ${made} fehlende Einträge ergänzt. Bestehende Dateien blieben unverändert.`);
    }, 'Projektstruktur ergänzen');
  });
}
