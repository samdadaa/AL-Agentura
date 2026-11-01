import { ProjectContext, ProjectEntry } from './projectModels';
import { GenerationPlan, TemplateManifest } from './templateModels';
import { validateManifest, validateTemplateInputs } from './manifestValidation';
import { normalizeModules, objectTypesFromManifest, StructureOptions } from './alStructure';
import { fail, pathKey, unique, validateRelativePath } from './templateValidation';

type DraftOperation = Omit<GenerationPlan['operations'][number], 'targetUri'>;
export interface StructureDraft extends Omit<GenerationPlan, 'operations'> {
  readonly operations: readonly DraftOperation[];
}

/** Read-only projection. No filesystem or URI dependencies, no approval, no writing. */
export function planALStructure(context: ProjectContext, value: TemplateManifest, options: StructureOptions, gitignore: string): StructureDraft {
  if (!context.scanComplete) fail('input', 'Strukturplanung benötigt einen vollständigen Scan; Analysefehler zuerst beheben.');
  const manifest = validateManifest(value);
  if (manifest.id !== `al-${options.profile}`) fail('input', 'Profil und Manifest stimmen nicht überein.');
  const available = objectTypesFromManifest(manifest);
  const requested = options.objectTypes ?? available;
  const selected = normalizeModules(requested).map(type => {
    const canonical = available.find(item => pathKey(item) === pathKey(type));
    if (!canonical) fail('input', 'Unbekannter Objekttyp; Typ aus dem Profil auswählen.');
    return canonical;
  });
  if (options.profile === 'standard' && options.modules?.length) fail('input', 'Standardprofil unterstützt keine Module.');
  const modules = normalizeModules(options.modules ?? []);
  const inputs = options.profile === 'modular' ? { MODULES: modules } : {};
  validateTemplateInputs(manifest, inputs);
  const existing = new Map<string, ProjectEntry>();
  for (const entry of context.existingEntries) {
    validateRelativePath(entry.relativePath);
    const key = pathKey(entry.relativePath);
    if (existing.has(key)) fail('duplicate', 'Bestand enthält mehrdeutige Pfade (Groß-/Kleinschreibung).');
    existing.set(key, entry);
  }
  const directories: string[] = [];
  const seen = new Set<string>();
  for (const entry of manifest.entries) {
    if (!selected.includes(entry.target.split('/').at(-1)!)) continue;
    for (const module of options.profile === 'modular' ? modules : ['']) {
      const target = entry.target.replace(/\{\{MODULES\}\}/g, () => module);
      validateRelativePath(target);
      const segments = target.split('/');
      for (let i = 1; i <= segments.length; i++) {
        const directory = segments.slice(0, i).join('/');
        if (!seen.has(directory)) { seen.add(directory); directories.push(directory); }
      }
    }
  }
  const operations: DraftOperation[] = [];
  function operation(relativePath: string, kind: 'file' | 'directory', content?: string): DraftOperation {
    validateRelativePath(relativePath);
    const parts = relativePath.split('/');
    for (let i = 1; i < parts.length; i++) {
      const parent = parts.slice(0, i).join('/');
      const found = existing.get(pathKey(parent));
      if (found && (found.kind !== 'directory' || found.relativePath !== parent || !found.childrenKnown)) {
        return { entryId: relativePath, relativePath, kind, action: 'conflict', reason: 'Übergeordnetes Ziel ist mehrdeutig, kein Verzeichnis, ein Symlink oder nicht vollständig gelesen.' };
      }
    }
    const found = existing.get(pathKey(relativePath));
    if (found) {
      const safe = found.kind === kind && found.relativePath === relativePath;
      return { entryId: relativePath, relativePath, kind, action: safe ? 'skip' : 'conflict',
        reason: safe ? 'Vorhanden; bleibt unverändert.' : 'Bestand kollidiert mit Zielart, Schreibweise oder Symlink.' };
    }
    return { entryId: relativePath, relativePath, kind, action: 'create', reason: 'Fehlt im analysierten Bestand.', ...(content !== undefined ? { content } : {}) };
  }
  for (const directory of directories) operations.push(operation(directory, 'directory'));
  for (const directory of directories) {
    // Parent directories will contain planned child directories; never need a placeholder.
    if (directories.some(child => child.startsWith(`${directory}/`))) continue;
    const found = existing.get(pathKey(directory));
    if (found?.kind === 'directory' && !found.childrenKnown) continue;
    const children = context.existingEntries.filter(entry => pathKey(entry.relativePath).startsWith(`${pathKey(directory)}/`));
    if (children.some(entry => entry.relativePath !== `${directory}/.gitkeep`)) continue;
    operations.push(operation(`${directory}/.gitkeep`, 'file', ''));
  }
  operations.push(operation('.gitignore', 'file', gitignore));
  unique(operations.map(item => pathKey(item.relativePath)), 'Strukturziele');
  return { rootUri: context.rootUri, profileId: options.profile, manifests: [{ id: manifest.id, version: manifest.version }], operations };
}
