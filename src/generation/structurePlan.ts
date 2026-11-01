import * as vscode from 'vscode';
import { ProjectContext } from '../core/projectModels';
import { StructureOptions } from '../core/alStructure';
import { planALStructure } from '../core/structurePlan';
import { GenerationPlan, TemplateManifest } from '../core/templateModels';
import { validateRootUri } from '../workspace/resolveWorkspace';

/** Materialize URI addresses only. No creation, preview approval or writes. */
export function createStructurePlan(context: ProjectContext, manifest: TemplateManifest, options: StructureOptions, gitignore: string): GenerationPlan {
  const root = vscode.Uri.parse(context.rootUri, true);
  validateRootUri(root);
  const draft = planALStructure(context, manifest, options, gitignore);
  return { ...draft, operations: draft.operations.map(operation => ({ ...operation,
    targetUri: vscode.Uri.joinPath(root, ...operation.relativePath.split('/')).toString() })) };
}
