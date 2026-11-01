import * as vscode from 'vscode';
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NewProjectError } from '../core/newProject';
import { pathKey, unique, validateRelativePath } from '../core/templateValidation';
import { assertDirectoryChain, assertMissingChild } from '../workspace/newProject';
import { validateRootUri } from '../workspace/resolveWorkspace';
import { ExistingProjectPlan } from './existingProjectPlan';
import type { NewProjectFiles } from './createNewProject';

export interface ExistingProjectResult {
  readonly status: 'applied' | 'cancelled' | 'blocked' | 'stale' | 'partial';
  readonly createdPaths: readonly string[];
  readonly skippedPaths: readonly string[];
  readonly openIssues: readonly string[];
  readonly failedPath?: string;
  readonly message?: string;
  readonly stagingCleanupFailed?: boolean;
}
const applying = new Set<string>();

export function validateExistingProjectPlan(plan: ExistingProjectPlan): void {
  const root = vscode.Uri.parse(plan.rootUri, true);
  validateRootUri(root);
  unique(plan.operations.map(item => pathKey(item.relativePath)), 'Planziele');
  for (const item of plan.operations) {
    validateRelativePath(item.relativePath);
    if (!['create', 'skip', 'conflict'].includes(item.action) || !['file', 'directory'].includes(item.kind) ||
        item.targetUri !== vscode.Uri.joinPath(root, ...item.relativePath.split('/')).toString() ||
        (item.action === 'create' && item.kind === 'file' && (typeof item.content !== 'string' ||
          /\.al$/i.test(item.relativePath) || ['app.json', '.vscode/launch.json'].includes(pathKey(item.relativePath)))))
      throw new NewProjectError('Ungültiger Bestandsplan; keine AL- oder Konfigurationsdateien erzeugen.');
  }
}

/** Confirmation is explicit; refresh must rebuild from the live project and the same bundled data. */
export async function applyExistingProject(plan: ExistingProjectPlan, approved: boolean,
  refresh: () => Promise<ExistingProjectPlan>, files: NewProjectFiles = vscode.workspace.fs): Promise<ExistingProjectResult> {
  const createdPaths: string[] = [], skippedPaths = plan.operations.filter(item => item.action === 'skip').map(item => item.relativePath);
  const base = { createdPaths, skippedPaths, openIssues: plan.openIssues };
  if (approved !== true) return { ...base, status: 'cancelled' };
  const key = pathKey(plan.rootUri);
  if (applying.has(key)) return { ...base, status: 'blocked', message: 'Für dieses Projekt läuft bereits eine Ergänzung.' };
  applying.add(key);
  let staging: vscode.Uri | undefined, failedPath = '.';
  let cleanupFailed = false;
  let result: ExistingProjectResult;
  try {
    validateExistingProjectPlan(plan);
    const root = vscode.Uri.parse(plan.rootUri, true);
    if (root.scheme !== 'file' || root.authority || vscode.workspace.fs.isWritableFileSystem(root.scheme) === false)
      throw new NewProjectError('Sicheres Schreiben ist auf native lokale file-Ziele begrenzt; Analyse und Vorschau unterstützen weitere Provider.');
    await assertDirectoryChain(root);
    // No target writes or scratch allocation before the complete refreshed comparison.
    const current = await refresh();
    validateExistingProjectPlan(current);
    if (JSON.stringify(current) !== JSON.stringify(plan)) return { ...base, status: 'stale',
      message: 'Projektbestand oder Plan hat sich seit der Vorschau geändert. Vorschau erneut öffnen und prüfen.' };
    if (plan.operations.some(item => item.action === 'conflict')) return { ...base, status: 'blocked', message: 'Konflikte im Plan; keine Dateien angelegt.' };
    const creates = plan.operations.filter(item => item.action === 'create');
    if (creates.length) staging = vscode.Uri.file(await mkdtemp(join(tmpdir(), 'al-agentura-existing-')));
    for (const [index, item] of creates.entries()) {
      failedPath = item.relativePath;
      const target = vscode.Uri.parse(item.targetUri, true);
      const parent = vscode.Uri.joinPath(target, '..');
      await assertDirectoryChain(parent);
      await assertMissingChild(parent, item.relativePath.split('/').at(-1)!);
      if (item.kind === 'directory') {
        await files.createDirectory(target);
        createdPaths.push(item.relativePath);
        await assertDirectoryChain(target);
      } else {
        const source = vscode.Uri.joinPath(staging!, String(index));
        const bytes = new TextEncoder().encode(item.content!);
        await files.writeFile(source, bytes);
        // Native same-provider copy is required: VS Code's cross-provider fallback is unsafe.
        await files.copy(source, target, { overwrite: false });
        createdPaths.push(item.relativePath);
        const info = await files.stat(target);
        if (info.type !== vscode.FileType.File) throw new NewProjectError('Neue Datei wurde durch einen anderen Eintrag ersetzt.');
        const actual = await files.readFile(target);
        if (actual.length !== bytes.length || actual.some((value, offset) => value !== bytes[offset]))
          throw new NewProjectError('Neue Datei wurde nicht vollständig geschrieben oder zwischenzeitlich verändert.');
      }
    }
    result = { ...base, status: 'applied' };
  } catch (error: unknown) {
    result = { ...base, status: createdPaths.length ? 'partial' : 'blocked', failedPath,
      message: error instanceof NewProjectError ? error.message : 'Dateizugriff oder erneute Analyse fehlgeschlagen; Bestand und Berechtigungen prüfen.' };
  } finally {
    if (staging) {
      try { await files.delete(staging, { recursive: true, useTrash: false }); }
      catch { cleanupFailed = true; }
    }
    applying.delete(key);
  }
  return cleanupFailed ? { ...result, status: createdPaths.length ? 'partial' : 'blocked', stagingCleanupFailed: true,
    message: `${result.message ?? ''} Temporäre Extension-Dateien konnten nicht bereinigt werden.`.trim() } : result;
}
