import { ExistingDocumentationTemplates, renderExistingDocument } from './existingDocumentationTemplates';
import { ProjectContext } from './projectModels';
import { pathKey, validateRelativePath } from './templateValidation';

export interface ModuleCandidate {
  readonly name: string;
  readonly relativePath: string;
  readonly sources: readonly ('directory-structure' | 'al-file-paths')[];
  readonly alFiles: readonly string[];
}
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const md = (value: string): string => value.replace(/[\\`*_{}\[\]<>|]/g, '\\$&');

/** Structural candidates only; neither a folder name nor a filename proves business semantics. */
export function detectModuleCandidates(context: ProjectContext): readonly ModuleCandidate[] {
  const paths = new Map<string, Set<'directory-structure' | 'al-file-paths'>>();
  const objectTypes = new Set(context.objectFolders.map(folder => pathKey(folder.objectType)));
  const add = (path: string, source: 'directory-structure' | 'al-file-paths') => {
    validateRelativePath(path);
    const sources = paths.get(path) ?? new Set();
    sources.add(source); paths.set(path, sources);
  };
  for (const folder of context.objectFolders) {
    const parent = folder.relativePath.split('/').slice(0, -1).join('/');
    if (parent && !['src', 'app'].includes(pathKey(parent))) add(parent, 'directory-structure');
  }
  for (const file of context.alFiles) {
    validateRelativePath(file);
    const parts = file.split('/');
    if (parts.length < 2) continue;
    const container = ['src', 'app'].includes(pathKey(parts[0]));
    const module = parts[container ? 1 : 0];
    if (!module || (container && parts.length < 3) || objectTypes.has(pathKey(module))) continue;
    add(container ? `${parts[0]}/${module}` : module, 'al-file-paths');
  }
  // Assign each file to its closest observed ancestor, without scanning every
  // module against every other module (large Business Central repositories).
  const filesByModule = new Map<string, string[]>();
  for (const file of context.alFiles) {
    const parts = file.split('/').slice(0, -1);
    while (parts.length) {
      const parent = parts.join('/');
      if (paths.has(parent)) {
        const files = filesByModule.get(parent) ?? [];
        files.push(file); filesByModule.set(parent, files); break;
      }
      parts.pop();
    }
  }
  return [...paths.keys()].sort(compare).map(relativePath => ({
    name: relativePath.split('/').at(-1)!, relativePath,
    sources: [...paths.get(relativePath)!].sort(compare), alFiles: (filesByModule.get(relativePath) ?? []).sort(compare)
  }));
}

export function moduleDocumentPath(module: ModuleCandidate): string {
  const path = `docs/modules/details/${module.relativePath}.md`;
  validateRelativePath(path);
  return path;
}

export function renderModuleDocumentation(context: ProjectContext, selectedPaths: readonly string[], templates: ExistingDocumentationTemplates): readonly { path: string; content: string }[] {
  const candidates = detectModuleCandidates(context);
  const selected = new Set(selectedPaths);
  if (selected.size !== selectedPaths.length || selectedPaths.some(path => !candidates.some(module => module.relativePath === path)))
    throw new Error('Modulauswahl enthält unbekannte oder doppelte Kandidaten.');
  const rows = candidates.map(module => `| ${md(module.name)} | ${md(module.relativePath)} | ${module.sources.join(', ')} | ${module.alFiles.length} | ` +
    (selected.has(module.relativePath) ? `[Gerüst](${moduleDocumentPath(module).slice('docs/modules/'.length).split('/').map(encodeURIComponent).join('/')}) — fachlich zu prüfen` : 'Kandidat; kein Modulgerüst ausgewählt') + ' |').join('\n');
  const index = renderExistingDocument(templates, 'index', { MODULE_ROWS: rows || 'Keine Modulkandidaten erkannt. Keine künstlichen Module angelegt.', TOTAL_AL_FILES: String(context.alFiles.length) });
  const gaps = renderExistingDocument(templates, 'gaps', { APP_JSON_STATUS: context.appJsonStatus,
    ISSUES: context.issues.map(issue => `- ${md(issue.relativePath || '.')}: ${md(issue.message)}`).join('\n') });
  const discovery = renderExistingDocument(templates, 'discovery', { DISCOVERY_ENTRIES: candidates.flatMap(module => [
    `## ${md(module.relativePath)}`, `Quelle: ${module.sources.join(', ')}`, '',
    ...(module.alFiles.length ? module.alFiles.map(file => `- ${md(file)}`) : ['Keine direkt zugeordneten AL-Dateien; untergeordnete Kandidaten separat prüfen.']), ''
  ]).join('\n') || 'Keine Modulkandidaten erkannt.' });
  return [{ path: 'docs/modules/INDEX.md', content: index }, { path: 'docs/modules/DISCOVERY.md', content: discovery }, { path: 'docs/GAPS.md', content: gaps },
    { path: 'AGENT_INITIALIZATION.md', content: renderExistingDocument(templates, 'initialization') },
    ...candidates.filter(module => selected.has(module.relativePath)).map(module => ({ path: moduleDocumentPath(module),
      content: renderExistingDocument(templates, 'module', { MODULE_NAME: md(module.name), MODULE_PATH: md(module.relativePath),
        MODULE_SOURCES: module.sources.join(', '), MODULE_FILES: module.alFiles.length ? module.alFiles.map(file =>
          `- ${md(file)} — Objekttyp, ID und Verantwortung im Code prüfen.`).join('\n') : module.sources.includes('al-file-paths') ? 'Keine direkt zugeordneten AL-Dateien; untergeordnete Kandidaten separat prüfen.' : 'Keine AL-Dateien erkannt; nur Ordnerstruktur belegt.' })
    }))];
}
