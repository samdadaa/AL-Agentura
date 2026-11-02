import * as vscode from 'vscode';
import { mkdtemp, mkdir, open } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { inspectProject } from '../analysis/inspectProject';
import { renderAgentDocs } from '../core/agentDocs';
import { renderNewModuleDocumentation } from '../core/moduleDocumentation';
import { objectTypesFromManifest } from '../core/alStructure';
import { NewProjectError } from '../core/newProject';
import { planALStructure } from '../core/structurePlan';
import { pathKey, validateRelativePath } from '../core/templateValidation';
import { loadBundledTemplates } from '../templates/bundled';
import { assertDirectoryChain, statIfPresent } from '../workspace/newProject';
import type { AgenturaProfile } from '../commands/setupCurrentProject';

/** Atomic across extension hosts. Node fs touches extension storage only, never the project.
 * Claims remain after completion/failure so stale globalState cannot replay a consumed job. */
export async function claimMicrosoftContinuation(storage: vscode.Uri, id: string): Promise<boolean> {
  // Desktop VS Code exposes local profile storage through its vscode-userdata
  // alias. Its fsPath is the native storage path; it is not a project URI.
  if (!['file', 'vscode-userdata'].includes(storage.scheme) || storage.authority || !/^[a-f0-9-]{36}$/.test(id))
    throw new NewProjectError('Fortsetzungssperre: lokaler Extension-Speicher oder Ablauf-ID ungültig.');
  const directory = join(storage.fsPath, 'microsoft-continuations');
  let directoryReady = false;
  try {
    await mkdir(directory, { recursive: true });
    directoryReady = true;
    const handle = await open(join(directory, `${id}.claim`), 'wx', 0o600);
    await handle.close();
    return true;
  } catch (error: unknown) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    if (directoryReady && code === 'EEXIST') return false;
    const reason = code === 'EACCES' || code === 'EPERM' ? 'Zugriff verweigert.' :
      code === 'ENOSPC' ? 'Speicherplatz erschöpft.' : code === 'EROFS' ? 'Speicher ist schreibgeschützt.' :
      'Lokaler Extension-Speicher konnte nicht beschrieben werden.';
    throw new NewProjectError(`Fortsetzungssperre: ${reason}`);
  }
}

export interface MicrosoftCompletionResult {
  readonly workspaceUri: vscode.Uri;
  readonly created: number;
  readonly skipped: number;
}

/** Bounded additive writer for the explicitly selected Microsoft creation flow. */
export async function completeMicrosoftProject(extensionUri: vscode.Uri, root: vscode.Uri,
  profile: AgenturaProfile, modules: readonly string[],
  files: Pick<typeof vscode.workspace.fs, 'writeFile' | 'copy' | 'readFile' | 'delete'> = vscode.workspace.fs): Promise<MicrosoftCompletionResult> {
  if (root.scheme !== 'file' || root.authority || vscode.workspace.fs.isWritableFileSystem('file') === false)
    throw new NewProjectError('Automatische Ergänzung benötigt einen lokalen, beschreibbaren Projektordner.');
  await assertDirectoryChain(root);
  const bundle = await loadBundledTemplates(extensionUri);
  const manifest = bundle.manifests.find(item => item.id === `al-${profile === 'bc-agent' ? 'standard' : profile}`);
  if (!manifest) throw new NewProjectError('Profilmanifest fehlt.');
  const context = await inspectProject(root, { objectTypes: objectTypesFromManifest(manifest) });
  if (!context.scanComplete || !context.appJson) throw new NewProjectError('Projektanalyse unvollständig oder app.json ungültig.');
  const structure = profile === 'bc-agent' ? [] : planALStructure(context, manifest, { profile, modules }, bundle.gitignore).operations;
  const name = root.path.split('/').filter(Boolean).at(-1) ?? 'AL-Projekt';
  const workspaceFile = `${name}.code-workspace`;
  validateRelativePath(workspaceFile);
  const workspaceUri = vscode.Uri.joinPath(root, workspaceFile);
  // A workspace with this name may contain unrelated folders/settings. Preserve it and
  // refuse to open it unless it actually includes this project via the generated contract.
  await validateWorkspaceIfPresent(workspaceUri);
  const moduleDocs = profile === 'modular' ? renderNewModuleDocumentation(modules, bundle.existingDocs) : [];
  const modulePaths = new Set(moduleDocs.map(doc => doc.path));
  const renderedFiles = [...renderAgentDocs(bundle.agentDocs, context.appJson.name ?? name).filter(doc => !modulePaths.has(doc.path)), ...moduleDocs, {
    path: workspaceFile,
    content: JSON.stringify({ folders: [{ path: '.' }], extensions: { recommendations: ['ms-dynamics-smb.al'] } }, null, 2) + '\n'
  }];
  const operations = [...structure, ...renderedFiles.map(file => ({ relativePath: file.path, kind: 'file' as const,
    action: 'create' as const, content: file.content }))];
  for (const item of operations) {
    validateRelativePath(item.relativePath);
    if (item.action === 'conflict') throw new NewProjectError('Dateikonflikte erkannt; Projektstruktur prüfen.');
  }
  let staging: vscode.Uri | undefined;
  let created = 0, skipped = 0;
  let failedPath = '.';
  let failure: unknown;
  try {
    staging = vscode.Uri.file(await mkdtemp(join(tmpdir(), 'al-agentura-microsoft-')));
    for (const [index, item] of operations.entries()) {
      failedPath = item.relativePath;
      if (item.action === 'skip') { skipped++; continue; }
      const segments = item.relativePath.split('/');
      let parent = root;
      // Validate all existing parents before writing; never traverse a reported symlink.
      for (const segment of segments.slice(0, -1)) {
        await ensureDirectory(parent, segment);
        parent = vscode.Uri.joinPath(parent, segment);
      }
      await assertDirectoryChain(parent);
      const target = vscode.Uri.joinPath(root, ...segments);
      const matches = (await vscode.workspace.fs.readDirectory(parent)).filter(([child]) => pathKey(child) === pathKey(segments.at(-1)!));
      if (matches.length) {
        if (matches.length !== 1 || matches[0][0] !== segments.at(-1) ||
            matches[0][1] !== (item.kind === 'directory' ? vscode.FileType.Directory : vscode.FileType.File))
          throw new NewProjectError('Zieltyp, Schreibweise oder Symlink kollidiert.');
        skipped++;
        continue;
      }
      if (item.kind === 'directory') await ensureDirectory(parent, segments.at(-1)!);
      else {
        const source = vscode.Uri.joinPath(staging, String(index));
        const bytes = new TextEncoder().encode(item.content ?? '');
        await files.writeFile(source, bytes);
        await files.copy(source, target, { overwrite: false });
        const actual = await files.readFile(target);
        if (actual.length !== bytes.length || actual.some((byte, offset) => byte !== bytes[offset]))
          throw new NewProjectError('Datei wurde nicht vollständig geschrieben oder zwischenzeitlich verändert.');
      }
      created++;
    }
    await validateWorkspaceIfPresent(workspaceUri, true);
  } catch (error: unknown) { failure = error; }
  finally {
    if (staging) {
      try { await files.delete(staging, { recursive: true, useTrash: false }); }
      catch { failure ??= new NewProjectError('Temporäre Dateien konnten nicht bereinigt werden.'); }
    }
  }
  if (failure) throw new NewProjectError(`Ergänzung nicht vollständig (${created} Einträge angelegt, ${skipped} bewahrt; gestoppt bei ${failedPath}). ` +
    (failure instanceof NewProjectError ? failure.message : 'Dateizugriff fehlgeschlagen; Berechtigungen und zwischenzeitliche Änderungen prüfen.'));
  return { workspaceUri, created, skipped };
}

async function ensureDirectory(parent: vscode.Uri, name: string): Promise<void> {
  await assertDirectoryChain(parent);
  const matches = (await vscode.workspace.fs.readDirectory(parent)).filter(([child]) => pathKey(child) === pathKey(name));
  if (matches.length && (matches.length !== 1 || matches[0][0] !== name || matches[0][1] !== vscode.FileType.Directory))
    throw new NewProjectError('Elternverzeichnis kollidiert mit Datei, Schreibweise oder Symlink.');
  const uri = vscode.Uri.joinPath(parent, name);
  if (!matches.length) await vscode.workspace.fs.createDirectory(uri);
  await assertDirectoryChain(uri);
}

async function validateWorkspaceIfPresent(uri: vscode.Uri, required = false): Promise<void> {
  const existing = await statIfPresent(uri);
  if (!existing) {
    if (required) throw new NewProjectError('Workspace-Datei fehlt nach der Ergänzung.');
    return;
  }
  if (existing.type !== vscode.FileType.File) throw new NewProjectError('Workspace-Datei ist kein regulärer Dateieintrag.');
  const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await vscode.workspace.fs.readFile(uri))) as { folders?: { path?: string }[] };
  if (!Array.isArray(data?.folders) || !data.folders.some(folder => folder?.path === '.'))
    throw new NewProjectError('Vorhandener Workspace referenziert das Projekt nicht mit „.“; bitte manuell prüfen.');
}
