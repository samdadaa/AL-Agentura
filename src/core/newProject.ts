import { parseAppJson } from '../analysis/appJson';
import { normalizeModules, StructureOptions } from './alStructure';
import { planALStructure, StructureDraft } from './structurePlan';
import { TemplateManifest } from './templateModels';
import { fail, validatePathSegment } from './templateValidation';

export interface NewProjectOptions {
  readonly name: string;
  readonly profile: StructureOptions['profile'];
  readonly modules: readonly string[];
  readonly appJsonContent?: string;
}
export interface NewProjectDraft extends StructureDraft {
  readonly name: string;
  readonly workspaceFile: string;
}

export function validateProjectName(name: string): void {
  if (typeof name !== 'string') fail('input', 'Projektname muss Text sein.');
  validatePathSegment(name);
  if (name.length > 128 || !/^[\p{L}\p{N}][\p{L}\p{N}\p{M} ._-]*$/u.test(name)) {
    fail('input', 'Projektname: maximal 128 Zeichen, Beginn mit Buchstabe/Ziffer; danach Buchstaben, Ziffern, Leerzeichen, Punkt, Unterstrich oder Bindestrich.');
  }
}

export function parseModuleList(text: string): readonly string[] {
  if (!text.trim()) return [];
  const names = text.split(',').map(name => name.trim());
  if (names.length > 50) fail('input', 'Höchstens 50 Module pro Neuprojekt auswählen.');
  return normalizeModules(names);
}

export function createNewProjectDraft(options: NewProjectOptions, manifest: TemplateManifest, gitignore: string, guide: string): NewProjectDraft {
  validateProjectName(options.name);
  if (options.modules.length > 50) fail('input', 'Höchstens 50 Module pro Neuprojekt auswählen.');
  const context = { rootUri: '', state: 'new' as const, appJsonStatus: 'missing' as const,
    existingEntries: [], alFiles: [], objectFolders: [], detectedModules: [], issues: [], scanComplete: true };
  const structure = planALStructure(context, manifest, { profile: options.profile, modules: options.modules }, gitignore);
  if (options.appJsonContent !== undefined) parseAppJson(options.appJsonContent);
  const workspaceFile = `${options.name}.code-workspace`;
  const files = [
    { path: workspaceFile, content: JSON.stringify({ folders: [{ path: '.' }], extensions: { recommendations: ['ms-dynamics-smb.al'] } }, null, 2) + '\n' },
    { path: 'GETTING_STARTED.md', content: guide },
    ...(options.appJsonContent !== undefined ? [{ path: 'app.json', content: options.appJsonContent }] : [])
  ];
  return { ...structure, name: options.name, workspaceFile, operations: [...structure.operations, ...files.map(file => ({
    entryId: file.path, relativePath: file.path, kind: 'file' as const, action: 'create' as const,
    reason: 'Neue Projektdatei im bestätigten Zielroot.', content: file.content
  }))] };
}

/** Fixed operational errors only; never wrap raw provider/credential messages. */
export class NewProjectError extends Error {
  constructor(message: string) { super(message); this.name = 'NewProjectError'; }
}
