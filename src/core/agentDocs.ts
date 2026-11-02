import { validateRelativePath } from './templateValidation';

/** Render only the one supported token. Never guess BC configuration or business rules. */
export function renderAgentDocs(templates: Readonly<Record<string, string>>, projectName: string): readonly { path: string; content: string }[] {
  const required = ['AGENTS.md', 'TODO.md', 'GETTING_STARTED.md', 'README.md', 'docs/PROJECT.md', 'docs/ARCHITECTURE.md', 'docs/CONVENTIONS.md', 'docs/SECURITY.md', 'docs/TESTS.md', 'docs/modules/INDEX.md'];
  const actual = Object.keys(templates);
  if (actual.length !== required.length || required.some(name => !Object.prototype.hasOwnProperty.call(templates, name))) throw new Error('Agenten-Template-Paket ist unvollständig oder enthält unbekannte Dateien.');
  return required.map(path => {
    validateRelativePath(path);
    const source = templates[path];
    if (typeof source !== 'string' || !source.trim()) throw new Error(`Leere Agenten-Vorlage: ${path}`);
    const content = source.replace(/\{\{PROJECT_NAME\}\}/g, () => projectName);
    if (/\{\{[^{}]+\}\}/.test(content)) throw new Error(`Unbekannter Platzhalter in ${path}`);
    return { path, content };
  });
}
