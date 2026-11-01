import * as vscode from 'vscode';
import { parseAppJson } from '../analysis/appJson';
import { createNewProjectDraft, NewProjectError, NewProjectOptions, validateProjectName } from '../core/newProject';
import { GenerationPlan } from '../core/templateModels';
import { pathKey, unique, validateRelativePath } from '../core/templateValidation';
import { BundledTemplates } from '../templates/bundled';
import { validateRootUri } from './resolveWorkspace';

export interface NewProjectPlan extends GenerationPlan {
  readonly parentUri: string;
  readonly name: string;
  readonly workspaceUri: string;
  readonly hasAppJson: boolean;
}

export async function statIfPresent(uri: vscode.Uri): Promise<vscode.FileStat | undefined> {
  try { return await vscode.workspace.fs.stat(uri); }
  catch (error: unknown) {
    if (error instanceof vscode.FileSystemError && error.code === 'FileNotFound') return undefined;
    throw new NewProjectError('Dateisystemstatus konnte nicht sicher gelesen werden; Berechtigungen und Provider prüfen.');
  }
}

/** Check every provider-reported ancestor instead of following an unseen parent link. */
export async function assertDirectoryChain(uri: vscode.Uri): Promise<void> {
  validateRootUri(uri);
  const parts = uri.path.split('/').filter(Boolean);
  const drive = parts[0] && /^[A-Za-z]:$/.test(parts[0]) ? parts.shift() : undefined;
  let current = uri.with({ path: drive ? `/${drive}/` : '/' });
  const chain = [current];
  for (const part of parts) { current = vscode.Uri.joinPath(current, part); chain.push(current); }
  for (const item of chain) {
    const stat = await statIfPresent(item);
    if (!stat || !(stat.type & vscode.FileType.Directory) || (stat.type & vscode.FileType.SymbolicLink)) {
      throw new NewProjectError('Ziel und Eltern müssen vorhandene Verzeichnisse ohne gemeldete Symlinks sein.');
    }
  }
}

export async function assertMissingChild(parent: vscode.Uri, name: string): Promise<void> {
  const children = await vscode.workspace.fs.readDirectory(parent);
  if (children.some(([child]) => pathKey(child) === pathKey(name)) || await statIfPresent(vscode.Uri.joinPath(parent, name))) {
    throw new NewProjectError('Das Ziel existiert bereits oder kollidiert in der Schreibweise. Bitte einen neuen Namen wählen; nichts wird ersetzt.');
  }
}

export function validateNewProjectPlan(plan: NewProjectPlan): void {
  validateProjectName(plan.name);
  const parent = vscode.Uri.parse(plan.parentUri, true);
  validateRootUri(parent);
  const root = vscode.Uri.joinPath(parent, plan.name);
  if (root.toString() !== plan.rootUri || vscode.Uri.joinPath(root, `${plan.name}.code-workspace`).toString() !== plan.workspaceUri) {
    throw new NewProjectError('Neuprojektplan enthält abweichende Ziel-URIs.');
  }
  unique(plan.operations.map(operation => pathKey(operation.relativePath)), 'Neuprojektziele');
  for (const operation of plan.operations) {
    validateRelativePath(operation.relativePath);
    if (operation.action !== 'create' || !['file', 'directory'].includes(operation.kind) ||
        (operation.kind === 'file' && typeof operation.content !== 'string') ||
        operation.targetUri !== vscode.Uri.joinPath(root, ...operation.relativePath.split('/')).toString()) {
      throw new NewProjectError('Neuprojektplan enthält eine ungültige Operation.');
    }
  }
}

export async function preflightNewProject(plan: NewProjectPlan): Promise<void> {
  validateNewProjectPlan(plan);
  const parent = vscode.Uri.parse(plan.parentUri, true);
  if (parent.scheme !== 'file' || parent.authority) {
    throw new NewProjectError('Sichere Neuanlage unterstützt derzeit nur lokale file-Ziele. Remote-/Virtual-Projekte können weiterhin analysiert und geplant werden.');
  }
  if (vscode.workspace.fs.isWritableFileSystem(parent.scheme) === false) throw new NewProjectError('Gewählter Provider ist schreibgeschützt.');
  await assertDirectoryChain(parent);
  await assertMissingChild(parent, plan.name);
}

export async function readAppJsonSource(uri: vscode.Uri): Promise<string> {
  validateRootUri(uri);
  await assertDirectoryChain(vscode.Uri.joinPath(uri, '..'));
  const stat = await statIfPresent(uri);
  if (!stat || !(stat.type & vscode.FileType.File) || (stat.type & vscode.FileType.SymbolicLink) || stat.size > 1024 * 1024) {
    throw new NewProjectError('app.json-Quelle muss eine lesbare Datei ohne gemeldeten Symlink mit höchstens 1 MiB sein.');
  }
  const bytes = await vscode.workspace.fs.readFile(uri);
  if (bytes.length > 1024 * 1024) throw new NewProjectError('app.json-Quelle überschreitet 1 MiB.');
  // Preserve a UTF-8 BOM in the copied content; parser handles it explicitly.
  const content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  const metadata = parseAppJson(content);
  if (!metadata.name && !metadata.id && !metadata.runtime) throw new NewProjectError('Die Quelle enthält keine identifizierenden AL-Metadaten.');
  return content;
}

export async function prepareNewProject(parent: vscode.Uri, options: NewProjectOptions, bundle: BundledTemplates, guide: string): Promise<NewProjectPlan> {
  validateRootUri(parent);
  const manifest = bundle.manifests.find(item => item.id === `al-${options.profile}`);
  if (!manifest) throw new NewProjectError('Das gewählte Strukturprofil fehlt.');
  const draft = createNewProjectDraft(options, manifest, bundle.gitignore, guide);
  const root = vscode.Uri.joinPath(parent, draft.name);
  const plan: NewProjectPlan = { ...draft, parentUri: parent.toString(), rootUri: root.toString(),
    workspaceUri: vscode.Uri.joinPath(root, draft.workspaceFile).toString(), hasAppJson: options.appJsonContent !== undefined,
    operations: draft.operations.map(operation => ({ ...operation, targetUri: vscode.Uri.joinPath(root, ...operation.relativePath.split('/')).toString() })) };
  await preflightNewProject(plan);
  return plan;
}

export async function openProjectWorkspace(workspaceUri: string): Promise<void> {
  await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(workspaceUri, true), true);
}
