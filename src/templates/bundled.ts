import * as vscode from 'vscode';
import { ProfileCatalog, TemplateManifest } from '../core/templateModels';
import { resolveProfile } from '../core/profileValidation';
import { loadManifest, loadProfileCatalog } from './catalog';

export interface BundledTemplates {
  readonly catalog: ProfileCatalog;
  readonly manifests: readonly TemplateManifest[];
  readonly gitignore: string;
  readonly agentDocs: Readonly<Record<string, string>>;
}

export async function loadBundledTemplates(extensionUri: vscode.Uri): Promise<BundledTemplates> {
  const root = vscode.Uri.joinPath(extensionUri, 'resources', 'templates');
  async function read(...segments: string[]): Promise<string> {
    return new TextDecoder('utf-8', { fatal: true }).decode(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, ...segments)));
  }
  const catalog = loadProfileCatalog(await read('profiles.json'));
  const ids = [...new Set(catalog.profiles.flatMap(profile => profile.manifestIds))];
  const manifests: TemplateManifest[] = [];
  for (const id of ids) {
    const manifest = loadManifest(await read(id, 'manifest.json'));
    if (manifest.id !== id) throw new Error('Ausgeliefertes Manifest stimmt nicht mit Katalog überein.');
    manifests.push(manifest);
  }
  for (const profile of catalog.profiles) resolveProfile(profile.id, catalog, manifests);
  const templatePaths = [
    'AGENTS.md', 'TODO.md', 'GETTING_STARTED.md',
    'docs/PROJECT.md', 'docs/ARCHITECTURE.md', 'docs/CONVENTIONS.md',
    'docs/SECURITY.md', 'docs/TESTS.md', 'docs/modules/INDEX.md'
  ];
  const agentDocs: Record<string, string> = {};
  for (const path of templatePaths) {
    const content = await read('agent-docs', ...path.split('/'));
    if (!content.trim() || /\{\{(?!PROJECT_NAME\}\})[^{}]+\}\}/.test(content)) {
      throw new Error(`Unvollständige Agenten-Vorlage: ${path}`);
    }
    agentDocs[path] = content;
  }
  return { catalog, manifests, gitignore: await read('al.gitignore'), agentDocs };
}
