import * as vscode from 'vscode';
import { inspectProject } from '../analysis/inspectProject';
import { objectTypesFromManifest } from '../core/alStructure';
import { ExistingProjectDraft, ExistingProjectOptions, planExistingProject } from '../core/existingProject';
import { GenerationPlan } from '../core/templateModels';
import { BundledTemplates } from '../templates/bundled';
import { validateRootUri } from '../workspace/resolveWorkspace';

export interface ExistingProjectPlan extends Omit<ExistingProjectDraft, 'operations'>, GenerationPlan {}

export async function prepareExistingProject(root: vscode.Uri, options: ExistingProjectOptions, bundle: BundledTemplates): Promise<ExistingProjectPlan> {
  validateRootUri(root);
  const manifest = bundle.manifests.find(item => item.id === 'al-standard');
  if (!manifest) throw new Error('Standardmanifest fehlt.');
  const context = await inspectProject(root, { objectTypes: objectTypesFromManifest(manifest) });
  const draft = planExistingProject(context, bundle, options);
  return { ...draft, rootUri: root.toString(), operations: draft.operations.map(item => ({ ...item,
    targetUri: vscode.Uri.joinPath(root, ...item.relativePath.split('/')).toString() })) };
}
