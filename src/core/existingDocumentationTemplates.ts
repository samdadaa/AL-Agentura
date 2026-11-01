import { fields, object, parseJsonData, schemaVersion, tokens, unique, fail } from './templateValidation';

export const EXISTING_DOCUMENT_TOKENS = {
  module: ['MODULE_NAME', 'MODULE_PATH', 'MODULE_SOURCES', 'MODULE_FILES'],
  index: ['MODULE_ROWS', 'TOTAL_AL_FILES'], discovery: ['DISCOVERY_ENTRIES'],
  gaps: ['APP_JSON_STATUS', 'ISSUES'], initialization: [], project: ['OBSERVED_APP_JSON'], 'getting-started': []
} as const;
export type ExistingDocumentId = keyof typeof EXISTING_DOCUMENT_TOKENS;
export interface ExistingDocumentationTemplates {
  readonly version: '1.0.0';
  readonly contents: Readonly<Record<ExistingDocumentId, string>>;
}

export function loadExistingDocumentationTemplates(versionText: string, contents: Readonly<Record<string, string>>): ExistingDocumentationTemplates {
  const version = object(parseJsonData(versionText, 'Bestandsdokumentation-Version'), 'Bestandsdokumentation-Version');
  fields(version, ['schemaVersion', 'version'], 'Bestandsdokumentation-Version');
  schemaVersion(version.schemaVersion);
  if (version.version !== '1.0.0') fail('version', 'Nicht unterstützte Bestandsdokumentation-Version.');
  const ids = Object.keys(EXISTING_DOCUMENT_TOKENS) as ExistingDocumentId[];
  if (Object.keys(contents).length !== ids.length || ids.some(id => !Object.hasOwn(contents, id))) fail('schema', 'Bestandsdokumentation unvollständig.');
  for (const id of ids) {
    const source = contents[id];
    if (typeof source !== 'string' || !source.trim()) fail('schema', 'Leere Bestandsdokumentation.');
    const found = [...new Set(tokens(source))];
    const required: readonly string[] = EXISTING_DOCUMENT_TOKENS[id];
    if (found.length !== required.length || found.some(token => !required.includes(token))) fail('token', 'Unbekannter oder fehlender Platzhalter in Bestandsdokumentation.');
  }
  return { version: '1.0.0', contents: contents as Readonly<Record<ExistingDocumentId, string>> };
}

/** A single literal substitution pass: workspace metadata cannot introduce executable templates. */
export function renderExistingDocument(templates: ExistingDocumentationTemplates, id: ExistingDocumentId, values: Readonly<Record<string, string>> = {}): string {
  const required: readonly string[] = EXISTING_DOCUMENT_TOKENS[id];
  unique(Object.keys(values), 'Dokumentvariablen');
  if (Object.keys(values).length !== required.length || required.some(token => typeof values[token] !== 'string')) fail('token', 'Dokumentvariablen unvollständig.');
  return templates.contents[id].replace(/\{\{([A-Z_]+)\}\}/g, (_, token: string) => values[token]);
}
