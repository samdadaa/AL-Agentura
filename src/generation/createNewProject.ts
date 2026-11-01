import * as vscode from 'vscode';
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NewProjectError } from '../core/newProject';
import { assertDirectoryChain, assertMissingChild, NewProjectPlan, preflightNewProject } from '../workspace/newProject';

export interface NewProjectResult {
  readonly status: 'created' | 'cancelled' | 'blocked' | 'partial';
  readonly rootUri: string;
  readonly workspaceUri: string;
  readonly hasAppJson: boolean;
  readonly createdPaths: readonly string[];
  readonly failedPath?: string;
  readonly message?: string;
  readonly stagingCleanupFailed?: boolean;
}

/** Allows tests to inject I/O failures while the default uses the actual VS Code API. */
export type NewProjectFiles = Pick<typeof vscode.workspace.fs,
  'createDirectory' | 'writeFile' | 'copy' | 'stat' | 'readDirectory' | 'readFile' | 'delete'>;

/** Narrow new-root-only writer. Existing projects and arbitrary apply plans are unsupported. */
export async function createNewProject(plan: NewProjectPlan, confirmed: boolean, files: NewProjectFiles = vscode.workspace.fs): Promise<NewProjectResult> {
  const createdPaths: string[] = [];
  const base = { rootUri: plan.rootUri, workspaceUri: plan.workspaceUri, hasAppJson: plan.hasAppJson, createdPaths };
  if (confirmed !== true) return { ...base, status: 'cancelled' };
  let staging: vscode.Uri | undefined;
  let stagingCleanupFailed = false;
  let failedPath = '.';
  let result: NewProjectResult;
  try {
    await preflightNewProject(plan);
    const root = vscode.Uri.parse(plan.rootUri, true);
    await files.createDirectory(root);
    createdPaths.push('.');
    await assertDirectoryChain(root);
    if ((await files.readDirectory(root)).length !== 0) throw new NewProjectError('Ziel wurde zwischenzeitlich befüllt; Anlage gestoppt.');
    // Node fs is used ONLY for an exclusive private OS scratch directory (0700).
    // Every target-project operation stays on workspace.fs. Native file -> file
    // copy avoids VS Code's unsafe cross-provider copy fallback.
    staging = vscode.Uri.file(await mkdtemp(join(tmpdir(), 'al-project-assistant-')));
    let fileIndex = 0;
    for (const operation of plan.operations) {
      failedPath = operation.relativePath;
      const segments = operation.relativePath.split('/');
      const parent = vscode.Uri.joinPath(root, ...segments.slice(0, -1));
      await assertDirectoryChain(parent);
      await assertMissingChild(parent, segments.at(-1)!);
      const target = vscode.Uri.joinPath(root, ...segments);
      if (operation.kind === 'directory') {
        await files.createDirectory(target);
        await assertDirectoryChain(target);
        if ((await files.readDirectory(target)).length !== 0) throw new NewProjectError('Ein neues Verzeichnis wurde zwischenzeitlich befüllt.');
      } else {
        const source = vscode.Uri.joinPath(staging, `file-${fileIndex++}`);
        const bytes = new TextEncoder().encode(operation.content!);
        await files.writeFile(source, bytes);
        // API has no exclusive writeFile; copy explicitly refuses an existing destination.
        await files.copy(source, target, { overwrite: false });
        const stat = await files.stat(target);
        if (!(stat.type & vscode.FileType.File) || (stat.type & vscode.FileType.SymbolicLink)) throw new NewProjectError('Neue Zieldatei ist kein sicher lesbarer regulärer Dateieintrag.');
        const actual = await files.readFile(target);
        if (actual.length !== bytes.length || actual.some((byte, index) => byte !== bytes[index])) throw new NewProjectError('Neue Datei wurde nicht vollständig oder zwischenzeitlich verändert.');
      }
      createdPaths.push(operation.relativePath);
    }
    result = { ...base, status: 'created' };
  } catch (error: unknown) {
    result = { ...base, status: createdPaths.length ? 'partial' : 'blocked', failedPath,
      message: error instanceof NewProjectError ? error.message : 'Dateianlage fehlgeschlagen; Provider, Berechtigungen und zwischenzeitliche Zieländerungen prüfen.' };
  } finally {
    if (staging) {
      try { await files.delete(staging, { recursive: true, useTrash: false }); }
      catch { stagingCleanupFailed = true; }
    }
  }
  return { ...result, ...(stagingCleanupFailed ? { stagingCleanupFailed } : {}) };
}
