import { renderExistingDocument } from './existingDocumentationTemplates';
import { renderAgentDocs } from './agentDocs';
import { renderModuleDocumentation } from './moduleDocumentation';
import { planALStructure } from './structurePlan';
import { ProjectContext } from './projectModels';
import { GenerationPlan } from './templateModels';
import { fail, pathKey, unique, validateRelativePath } from './templateValidation';
import type { BundledTemplates } from '../templates/bundled';

export interface ExistingProjectOptions {
  readonly structure: 'preserve' | 'standard' | 'modular' | 'bc-agent';
  readonly modules: readonly string[];
  readonly selectedModules: readonly string[];
}
export type ExistingOperation = Omit<GenerationPlan['operations'][number], 'targetUri'>;
export interface ExistingProjectDraft {
  readonly profileId: string;
  readonly manifests: GenerationPlan['manifests'];
  readonly operations: readonly ExistingOperation[];
  readonly snapshot: string;
  readonly options: ExistingProjectOptions;
  readonly openIssues: readonly string[];
}
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;

/** Pure deterministic additive plan. Existing contents never need normalization or merging. */
export function planExistingProject(context: ProjectContext, bundle: BundledTemplates, options: ExistingProjectOptions): ExistingProjectDraft {
  if (!context.scanComplete || ['invalid', 'unknown'].includes(context.appJsonStatus))
    fail('input', 'Vollständige Analyse und eine lesbare app.json (sofern vorhanden) erforderlich.');
  if (!['preserve', 'standard', 'modular', 'bc-agent'].includes(options.structure)) fail('input', 'Unbekanntes Ergänzungsprofil.');
  if (options.structure !== 'modular' && options.modules.length) fail('input', 'Module für neue Ordner sind nur im Modularprofil erlaubt.');
  const manifest = bundle.manifests.find(item => item.id === `al-${options.structure === 'modular' ? 'modular' : 'standard'}`);
  if (!manifest) fail('input', 'Profilmanifest fehlt.');
  const entries = new Map(context.existingEntries.map(entry => [pathKey(entry.relativePath), entry]));
  unique(context.existingEntries.map(entry => pathKey(entry.relativePath)), 'Bestandspfade');
  context.existingEntries.forEach(entry => validateRelativePath(entry.relativePath));
  const desired = new Map<string, { kind: 'file' | 'directory'; content?: string }>();
  const desiredKeys = new Set<string>();
  const add = (path: string, kind: 'file' | 'directory', content?: string) => {
    validateRelativePath(path);
    const parts = path.split('/');
    for (let index = 1; index < parts.length; index++) {
      const parent = parts.slice(0, index).join('/');
      if (desired.get(parent)?.kind === 'file') fail('path', 'Datei als geplanter Elternpfad.');
      desired.set(parent, { kind: 'directory' });
      desiredKeys.add(pathKey(parent));
    }
    if (desired.has(path) && desired.get(path)?.kind !== kind) fail('path', 'Widersprüchliche Zielarten.');
    desired.set(path, { kind, ...(content !== undefined ? { content } : {}) });
    desiredKeys.add(pathKey(path));
  };
  if (options.structure === 'standard' || options.structure === 'modular') {
    for (const item of planALStructure(context, manifest, { profile: options.structure, modules: options.modules }, bundle.gitignore).operations) {
      // A skipped file has no template payload; it must remain skipped even if deleted later.
      add(item.relativePath, item.kind, item.content);
    }
  } else if (options.structure !== 'bc-agent') add('.gitignore', 'file', bundle.gitignore);
  const name = context.appJson?.name ?? 'Zu prüfen';
  for (const doc of renderAgentDocs(bundle.agentDocs, name)) add(doc.path, 'file', doc.content +
    (doc.path === 'GETTING_STARTED.md' ? renderExistingDocument(bundle.existingDocs, 'getting-started') : ''));
  for (const doc of renderModuleDocumentation(context, [...options.selectedModules].sort(compare), bundle.existingDocs)) add(doc.path, 'file', doc.content);
  add('docs/PROJECT.md', 'file', renderExistingDocument(bundle.existingDocs, 'project', { OBSERVED_APP_JSON: JSON.stringify(context.appJson ?? {}, null, 2) }));
  // Surface protected AL/configuration/Markdown files too; no .al file is ever created here.
  for (const entry of context.existingEntries) {
    if (entry.kind === 'file' && !desiredKeys.has(pathKey(entry.relativePath)) &&
        (/\.(?:al|md)$/i.test(entry.relativePath) || entry.relativePath === 'app.json' || entry.relativePath.startsWith('.vscode/')))
      add(entry.relativePath, 'file');
  }
  unique([...desired.keys()].map(pathKey), 'Planziele');
  const operations: ExistingOperation[] = [...desired].map(([relativePath, item]) => {
    const base = { entryId: relativePath, relativePath, ...item };
    const parts = relativePath.split('/');
    for (let index = 1; index < parts.length; index++) {
      const parent = parts.slice(0, index).join('/');
      const existing = entries.get(pathKey(parent));
      if (existing && (existing.kind !== 'directory' || existing.relativePath !== parent || !existing.childrenKnown))
        return { ...base, action: 'conflict', reason: 'Elternpfad ist Datei, Symlink, unvollständig gelesen oder kollidiert in der Schreibweise.' };
    }
    const existing = entries.get(pathKey(relativePath));
    if (existing) return { ...base, action: existing.kind === item.kind && existing.relativePath === relativePath ? 'skip' : 'conflict',
      reason: existing.kind === item.kind && existing.relativePath === relativePath ? 'Vorhanden; Inhalt bleibt unverändert (kein Merge/Überschreiben).' :
        'Bestand kollidiert mit Zielart, Schreibweise oder Symlink.' };
    if (item.kind === 'file' && item.content === undefined) fail('input', 'Neue Datei ohne Vorlageninhalt.');
    return { ...base, action: 'create', reason: 'Fehlt; wird ausschließlich neu angelegt.' };
  });
  operations.sort((a, b) => a.relativePath.split('/').length - b.relativePath.split('/').length ||
    (a.kind === b.kind ? 0 : a.kind === 'directory' ? -1 : 1) || compare(a.relativePath, b.relativePath));
  return { profileId: options.structure, manifests: [{ id: manifest.id, version: manifest.version }, { id: 'existing-documentation', version: bundle.existingDocs.version }], operations,
    snapshot: JSON.stringify({ appJsonStatus: context.appJsonStatus, appJson: context.appJson,
      entries: [...context.existingEntries].sort((a, b) => compare(a.relativePath, b.relativePath)) }),
    options: { ...options, modules: [...options.modules], selectedModules: [...options.selectedModules].sort(compare) },
    openIssues: [...context.issues.map(issue => issue.message), ...(context.appJsonStatus === 'missing' ? ['app.json fehlt; AL-Konfiguration bleibt offen.'] : []),
      'Fachliche Modulgrenzen, Abhängigkeiten und Tests sind durch einen externen Agenten zu prüfen.',
      'Vorhandene Dokumente werden bewahrt; neue Erkenntnisse nicht automatisch in diese Dateien gemischt.'] };
}
