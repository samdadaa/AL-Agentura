import * as vscode from 'vscode';
import { ProjectContext, ProjectEntry, ProjectIssue } from '../core/projectModels';
import { TemplateValidationError, validatePathSegment } from '../core/templateValidation';
import { validateRootUri } from '../workspace/resolveWorkspace';
import { parseAppJson } from './appJson';

export interface InspectionOptions {
  readonly objectTypes: readonly string[];
  readonly maxEntries?: number;
  readonly maxDepth?: number;
  readonly maxAppJsonBytes?: number;
}
const EXCLUDED = new Set(['.git', 'node_modules', '.alpackages', '.alcache', '.snapshots']);
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;

/** Read-only; retains the provider/authority and never follows reported symbolic links. */
export async function inspectProject(root: vscode.Uri, options: InspectionOptions): Promise<ProjectContext> {
  validateRootUri(root);
  const maxEntries = options.maxEntries ?? 10000, maxDepth = options.maxDepth ?? 32;
  const maxBytes = options.maxAppJsonBytes ?? 1024 * 1024;
  if (![maxEntries, maxDepth, maxBytes].every(value => Number.isSafeInteger(value) && value > 0)) throw new Error('Ungültige Analyselimits.');
  options.objectTypes.forEach(validatePathSegment);
  const rootStat = await vscode.workspace.fs.stat(root);
  if ((rootStat.type & vscode.FileType.SymbolicLink) || !(rootStat.type & vscode.FileType.Directory)) {
    throw new Error('Ziel muss ein Verzeichnis ohne gemeldeten Symlink sein.');
  }
  const entries: ProjectEntry[] = [], issues: ProjectIssue[] = [];
  let scanComplete = true;
  async function visit(uri: vscode.Uri, parent: string, depth: number): Promise<boolean> {
    let children: [string, vscode.FileType][];
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      if ((stat.type & vscode.FileType.SymbolicLink) || !(stat.type & vscode.FileType.Directory)) throw new Error('changed');
      children = await vscode.workspace.fs.readDirectory(uri);
    } catch {
      scanComplete = false;
      issues.push({ code: 'scan', relativePath: parent, message: 'Verzeichnis konnte nicht sicher gelesen werden; Bestand unvollständig.' });
      return false;
    }
    children.sort(([a], [b]) => compare(a, b));
    let complete = true;
    for (const [name, type] of children) {
      if (entries.length >= maxEntries) {
        scanComplete = false; complete = false;
        issues.push({ code: 'limit', relativePath: parent, message: 'Analyselimit erreicht; Bestand unvollständig.' });
        break;
      }
      try { validatePathSegment(name); }
      catch {
        scanComplete = false; complete = false;
        issues.push({ code: 'scan', relativePath: parent, message: 'Nicht portabler oder unsicherer Eintragsname; Bestand unvollständig.' });
        continue;
      }
      const relativePath = parent ? `${parent}/${name}` : name;
      if (type & vscode.FileType.SymbolicLink) {
        entries.push({ relativePath, kind: 'symlink' });
        issues.push({ code: 'symlink', relativePath, message: 'Symlink nur erfasst; nicht verfolgt.' });
      } else if (type & vscode.FileType.Directory) {
        const index = entries.length;
        entries.push({ relativePath, kind: 'directory', childrenKnown: false });
        if (EXCLUDED.has(name.toLowerCase())) continue;
        if (depth >= maxDepth) {
          scanComplete = false; complete = false;
          issues.push({ code: 'limit', relativePath, message: 'Maximale Analysetiefe erreicht; Bestand unvollständig.' });
        } else {
          const known = await visit(vscode.Uri.joinPath(uri, name), relativePath, depth + 1);
          entries[index] = { relativePath, kind: 'directory', childrenKnown: known };
        }
      } else if (type & vscode.FileType.File) entries.push({ relativePath, kind: 'file' });
      else {
        entries.push({ relativePath, kind: 'unknown' });
        scanComplete = false; complete = false;
        issues.push({ code: 'scan', relativePath, message: 'Dateityp ist unbekannt; Bestand unvollständig.' });
      }
    }
    return complete;
  }
  await visit(root, '', 0);
  entries.sort((a, b) => compare(a.relativePath, b.relativePath));
  let appJsonStatus: ProjectContext['appJsonStatus'] = scanComplete ? 'missing' : 'unknown';
  let appJson: ProjectContext['appJson'];
  const appEntry = entries.find(entry => entry.relativePath.toLowerCase() === 'app.json');
  if (appEntry) {
    appJsonStatus = 'invalid';
    try {
      if (appEntry.relativePath !== 'app.json' || appEntry.kind !== 'file') throw new Error('unsafe');
      const uri = vscode.Uri.joinPath(root, 'app.json');
      const stat = await vscode.workspace.fs.stat(uri);
      if ((stat.type & vscode.FileType.SymbolicLink) || !(stat.type & vscode.FileType.File) || stat.size > maxBytes) throw new Error('unsafe');
      const bytes = await vscode.workspace.fs.readFile(uri);
      if (bytes.length > maxBytes) throw new Error('limit');
      appJson = parseAppJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      appJsonStatus = 'valid';
      if (!appJson.name && !appJson.id && !appJson.runtime) {
        issues.push({ code: 'app-json', relativePath: 'app.json', message: 'app.json enthält keine identifizierenden AL-Metadaten; Konfiguration prüfen.' });
      }
    } catch (error: unknown) {
      issues.push({ code: 'app-json', relativePath: 'app.json', message: error instanceof TemplateValidationError ?
        `app.json konnte nicht ausgewertet werden: ${error.message}` :
        'app.json ist nicht sicher als UTF-8-Datei lesbar; Größe, Dateityp und Zugriffsrechte prüfen.' });
    }
  }
  const alFiles = entries.filter(entry => entry.kind === 'file' && entry.relativePath.toLowerCase().endsWith('.al')).map(entry => entry.relativePath);
  if (alFiles.length > 0 && appJsonStatus === 'missing') {
    issues.push({ code: 'app-json', relativePath: 'app.json', message: 'AL-Dateien erkannt, aber keine app.json im gewählten Root gefunden.' });
  }
  const byType = new Map(options.objectTypes.map(type => [type.toLowerCase(), type]));
  const objectFolders = entries.filter(entry => entry.kind === 'directory' && byType.has(entry.relativePath.split('/').at(-1)!.toLowerCase()))
    .map(entry => ({ relativePath: entry.relativePath, objectType: byType.get(entry.relativePath.split('/').at(-1)!.toLowerCase())! }));
  const modules = new Map<string, { name: string; relativePath: string; source: 'directory-structure' }>();
  for (const folder of objectFolders) {
    const parts = folder.relativePath.split('/');
    if (parts.length === 3 && parts[0] === 'src') {
      modules.set(parts[1], { name: parts[1], relativePath: `src/${parts[1]}`, source: 'directory-structure' });
    }
  }
  const state: ProjectContext['state'] = !scanComplete || appJsonStatus === 'invalid' || issues.some(issue => issue.code === 'app-json') ? 'incomplete' :
    appJsonStatus === 'valid' ? 'existing' : entries.length === 0 ? 'new' : 'incomplete';
  return { rootUri: root.toString(), state, appJsonStatus, ...(appJson ? { appJson } : {}), existingEntries: entries,
    alFiles, objectFolders, detectedModules: [...modules.values()], issues, scanComplete };
}
