import * as vscode from 'vscode';
import { inspectProject } from '../analysis/inspectProject';
import { objectTypesFromManifest } from '../core/alStructure';
import { ExistingProjectOptions } from '../core/existingProject';
import { detectModuleCandidates } from '../core/moduleDocumentation';
import { parseModuleList } from '../core/newProject';
import { TemplateValidationError } from '../core/templateValidation';
import { applyExistingProject, ExistingProjectResult } from '../generation/applyExistingProject';
import { prepareExistingProject } from '../generation/existingProjectPlan';
import { Logger } from '../logging/logger';
import { loadBundledTemplates } from '../templates/bundled';
import { confirmExistingProject, presentExistingProjectResult } from '../ui/existingProjectPreview';
import { resolveWorkspaceRoot } from '../workspace/resolveWorkspace';
import { runCommand } from './runCommand';

export const SETUP_CURRENT_PROJECT_COMMAND = 'alAgentura.setupCurrentProject';
export type AgenturaProfile = 'standard' | 'modular' | 'bc-agent';
export interface SetupRequest { readonly rootUri?: string; readonly profile?: AgenturaProfile; }

export function registerSetupCurrentProjectCommand(extensionUri: vscode.Uri, logger: Logger): vscode.Disposable {
  let running = false;
  return vscode.commands.registerCommand(SETUP_CURRENT_PROJECT_COMMAND, async (request?: SetupRequest): Promise<ExistingProjectResult | undefined> => {
    if (running) { void vscode.window.showInformationMessage('AL Agentura: Eine Bestandsvorschau ist bereits geöffnet.'); return; }
    running = true;
    let result: ExistingProjectResult | undefined;
    try {
      await runCommand(logger, async () => {
        const root = request?.rootUri ? vscode.Uri.parse(request.rootUri, true) : await resolveWorkspaceRoot();
        if (!root) return;
        const bundle = await loadBundledTemplates(extensionUri);
        const manifest = bundle.manifests.find(item => item.id === 'al-standard');
        if (!manifest) throw new Error('Standardmanifest fehlt.');
        const context = await inspectProject(root, { objectTypes: objectTypesFromManifest(manifest) });
        if (!context.scanComplete || ['invalid', 'unknown'].includes(context.appJsonStatus)) {
          void vscode.window.showWarningMessage('AL Agentura: Analyse unvollständig oder app.json ungültig. Keine Dateien angelegt; Projekt zuerst prüfen.');
          return;
        }
        const mode = request?.profile ? { id: request.profile } : await vscode.window.showQuickPick([
          { label: 'Bestehende Struktur bewahren', id: 'preserve' as const, description: 'Nur fehlende Dokumentation und Gitignore; AL-Ordner unverändert' },
          { label: 'Standard', id: 'standard' as const, description: 'Standard-src-Ordner zusätzlich ergänzen' },
          { label: 'Modular', id: 'modular' as const, description: 'Explizit eingegebene src-Module zusätzlich ergänzen' },
          { label: 'BC AI Agent', id: 'bc-agent' as const, description: 'Nur fehlende Agentura-Dokumentation' }
        ], { title: 'AL Agent: Bestandsprojekt ergänzen' });
        if (!mode) return;
        let modules: readonly string[] = [];
        if (mode.id === 'modular') {
          const input = await vscode.window.showInputBox({ title: 'Zusätzliche Modulordner', prompt: 'Module kommagetrennt; leer = keine neuen AL-Ordner',
            validateInput: value => { try { parseModuleList(value); return undefined; } catch { return 'Gültige Modulnamen kommagetrennt angeben.'; } } });
          if (input === undefined) return;
          modules = parseModuleList(input);
        }
        const candidates = detectModuleCandidates(context);
        const selected = candidates.length ? await vscode.window.showQuickPick(candidates.map(module => ({ label: module.name,
          description: module.relativePath, detail: `${module.alFiles.length} AL-Dateien; ${module.sources.join(', ')}`, module })),
          { title: 'Modulgerüste auswählen', placeHolder: 'Nur geprüfte Kandidaten auswählen; leere Auswahl erzeugt nur den Index', canPickMany: true }) : [];
        if (!selected) return;
        const options: ExistingProjectOptions = { structure: mode.id, modules, selectedModules: selected.map(item => item.module.relativePath) };
        try {
          const refresh = () => prepareExistingProject(root, options, bundle);
          const plan = await refresh();
          const approved = await confirmExistingProject(plan);
          result = await applyExistingProject(plan, approved, refresh);
          await presentExistingProjectResult(result);
        } catch (error: unknown) {
          if (!(error instanceof TemplateValidationError)) throw error;
          void vscode.window.showWarningMessage(`AL Agentura: Keine Dateien angelegt. ${error.message}`);
        }
      }, 'Bestandsprojekt ergänzen');
      return result;
    } finally { running = false; }
  });
}
