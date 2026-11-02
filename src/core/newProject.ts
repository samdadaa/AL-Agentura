import { ExistingDocumentationTemplates } from './existingDocumentationTemplates';
import { renderNewModuleDocumentation } from './moduleDocumentation';
import { renderAgentDocs } from './agentDocs';
import { parseAppJson } from '../analysis/appJson';
import { ALConfiguration, generateALAppJson, generateLaunchJson, validateExistingALAppJson } from './alConfiguration';
import { normalizeModules, StructureOptions } from './alStructure';
import { planALStructure, StructureDraft } from './structurePlan';
import { TemplateManifest } from './templateModels';
import { fail, validatePathSegment } from './templateValidation';

export interface NewProjectOptions {
  readonly name: string;
  readonly profile: StructureOptions['profile'];
  readonly modules: readonly string[];
  readonly appJsonContent?: string;
  readonly alConfiguration?: ALConfiguration;
  readonly includeLaunchJson?: boolean;
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

export function createNewProjectDraft(options: NewProjectOptions, manifest: TemplateManifest, gitignore: string, guide: string, agentDocs?: Readonly<Record<string, string>>, moduleTemplates?: ExistingDocumentationTemplates): NewProjectDraft {
  validateProjectName(options.name);
  if (options.modules.length > 50) fail('input', 'Höchstens 50 Module pro Neuprojekt auswählen.');
  const context = { rootUri: '', state: 'new' as const, appJsonStatus: 'missing' as const,
    existingEntries: [], alFiles: [], objectFolders: [], detectedModules: [], issues: [], scanComplete: true };
  const structure = planALStructure(context, manifest, { profile: options.profile, modules: options.modules }, gitignore);
  if (options.appJsonContent !== undefined && options.alConfiguration !== undefined) throw new NewProjectError('Konfiguration kann nicht gleichzeitig übernommen und generiert werden.');
  const appJsonContent = options.alConfiguration ? generateALAppJson(options.alConfiguration) : options.appJsonContent;
  if (appJsonContent !== undefined) {
    parseAppJson(appJsonContent);
    // Bestehende Quelle bleibt inhaltstreu: Diagnose separat, nicht automatisch korrigieren.
    if (options.alConfiguration) {
      const issues = validateExistingALAppJson(appJsonContent);
      if (issues.length) throw new NewProjectError('app.json: ' + issues.join(' '));
    }
  }
  const workspaceFile = `${options.name}.code-workspace`;
  const moduleDocs = options.profile === 'modular' && moduleTemplates ? renderNewModuleDocumentation(options.modules, moduleTemplates) : [];
  const modulePaths = new Set(moduleDocs.map(doc => doc.path));
  const files = [
    { path: workspaceFile, content: JSON.stringify({ folders: [{ path: '.' }], extensions: { recommendations: ['ms-dynamics-smb.al'] } }, null, 2) + '\n' },
    ...(agentDocs ? renderAgentDocs(agentDocs, options.name).filter(doc => !modulePaths.has(doc.path)) : [{ path: 'GETTING_STARTED.md', content: guide }]),
    ...moduleDocs,
    ...(appJsonContent !== undefined ? [{ path: 'app.json', content: appJsonContent }] : []),
    ...(options.includeLaunchJson ? [{ path: '.vscode/launch.json', content: generateLaunchJson() }] : [])
  ];
  const operations = [...structure.operations];
  const directories = new Set(operations.filter(item => item.kind === 'directory').map(item => item.relativePath));
  for (const file of files) {
    const parts = file.path.split('/');
    for (let index = 1; index < parts.length; index++) {
      const parent = parts.slice(0, index).join('/');
      if (!directories.has(parent)) {
        directories.add(parent);
        operations.push({ entryId: parent, relativePath: parent, kind: 'directory', action: 'create', reason: 'Elternverzeichnis einer neuen Projektdatei.' });
      }
    }
    operations.push({ entryId: file.path, relativePath: file.path, kind: 'file', action: 'create',
      reason: 'Neue Projektdatei im bestätigten Zielroot.', content: file.content });
  }
  return { ...structure, name: options.name, workspaceFile, operations };
}

/** Fixed operational errors only; never wrap raw provider/credential messages. */
export class NewProjectError extends Error {
  constructor(message: string) { super(message); this.name = 'NewProjectError'; }
}
