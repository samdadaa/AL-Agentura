import { TemplateEntry, TemplateInputs, TemplateManifest, TemplateValue, TemplateVariable } from './templateModels';
import { array, boolean, fail, fields, id, object, pathKey, schemaVersion, string, tokens, unique, validatePathSegment, validateRelativePath, variableName } from './templateValidation';

function validateValue(variable: TemplateVariable, value: unknown): TemplateValue {
  switch (variable.type) {
    case 'boolean': return boolean(value, variable.name);
    case 'pathSegments': {
      const values = array(value, variable.name).map(item => string(item, variable.name));
      values.forEach(validatePathSegment);
      unique(values.map(pathKey), 'Pfadvariablen');
      return values;
    }
    case 'pathSegment': {
      const result = string(value, variable.name);
      validatePathSegment(result);
      return result;
    }
    case 'text': {
      const result = string(value, variable.name);
      if (/[\x00-\x1f\x7f-\x9f]/u.test(result)) fail('input', 'Textvariablen dürfen keine Steuerzeichen enthalten.');
      if (variable.required && !result.trim()) fail('input', 'Erforderliche Textvariable darf nicht leer sein.');
      // Variable values are literals and must not introduce unresolved tokens.
      if (result.includes('{{') || result.includes('}}')) fail('token', 'Variablenwerte dürfen keine Platzhalter enthalten.');
      return result;
    }
  }
}

function parseVariable(value: unknown): TemplateVariable {
  const data = object(value, 'Variable');
  fields(data, ['name', 'type', 'required', 'default'], 'Variable');
  const name = variableName(data.name);
  const required = boolean(data.required, 'required');
  const type = data.type;
  if (type !== 'boolean' && type !== 'text' && type !== 'pathSegment' && type !== 'pathSegments') {
    fail('schema', 'Unbekannter Variablentyp.');
  }
  const base = { name, type, required } as TemplateVariable;
  if (!Object.hasOwn(data, 'default')) return base;
  const defaultValue = validateValue(base, data.default);
  // validateValue establishes the matching discriminated default type.
  return { ...base, default: defaultValue } as TemplateVariable;
}

function validateTokens(text: string, variables: ReadonlyMap<string, TemplateVariable>, entry: TemplateEntry, path: boolean): void {
  for (const name of tokens(text)) {
    const variable = variables.get(name);
    if (!variable) fail('token', 'Unbekannter Platzhalter im Template.');
    if (path && variable.type !== 'pathSegment' && variable.type !== 'pathSegments') {
      fail('token', 'Zielpfade erlauben nur Pfadvariablen.');
    }
    if (variable.type === 'pathSegments' && entry.repeatFor !== name) {
      fail('token', 'Listenplatzhalter benötigen repeatFor mit derselben Variable.');
    }
  }
}

function parseEntry(value: unknown, variables: ReadonlyMap<string, TemplateVariable>): TemplateEntry {
  const data = object(value, 'Eintrag');
  const kind = data.kind;
  if (kind !== 'directory' && kind !== 'file') fail('schema', 'Eintrag: kind muss file oder directory sein.');
  fields(data, ['id', 'kind', 'target', 'optional', 'condition', 'repeatFor', ...(kind === 'file' ? ['fileType', 'content'] : [])], 'Eintrag');
  const base = { id: id(data.id, 'Eintrag-ID'), target: string(data.target, 'Zielpfad'),
    ...(Object.hasOwn(data, 'optional') ? { optional: boolean(data.optional, 'optional') } : {}),
    ...(Object.hasOwn(data, 'repeatFor') ? { repeatFor: variableName(data.repeatFor) } : {}) };
  let condition: TemplateEntry['condition'];
  if (Object.hasOwn(data, 'condition')) {
    const item = object(data.condition, 'Bedingung');
    fields(item, ['variable', 'equals'], 'Bedingung');
    condition = { variable: variableName(item.variable), equals: boolean(item.equals, 'equals') };
    if (variables.get(condition.variable)?.type !== 'boolean') fail('schema', 'Bedingungen benötigen eine deklarierte Boolean-Variable.');
  }
  let entry: TemplateEntry;
  if (kind === 'file') {
    const fileType = data.fileType;
    if (fileType !== 'text' && fileType !== 'markdown' && fileType !== 'json' && fileType !== 'al') {
      fail('schema', 'Unbekannter Dateityp.');
    }
    entry = { ...base, kind, fileType, content: string(data.content, 'Dateiinhalt'), ...(condition ? { condition } : {}) };
    validateTokens(entry.content, variables, entry, false);
  } else {
    entry = { ...base, kind, ...(condition ? { condition } : {}) };
  }
  if (entry.repeatFor && variables.get(entry.repeatFor)?.type !== 'pathSegments') {
    fail('schema', 'repeatFor benötigt eine deklarierte pathSegments-Variable.');
  }
  validateTokens(entry.target, variables, entry, true);
  // Tokens always stand for a single path segment; substitution checks static parts now.
  validateRelativePath(entry.target.replace(/\{\{([A-Za-z][A-Za-z0-9_]{0,63})\}\}/g, 'TOKEN'));
  if (entry.repeatFor && !tokens(entry.target).includes(entry.repeatFor)) {
    fail('token', 'repeatFor muss im Zielpfad verwendet werden.');
  }
  return entry;
}

/** Reject file ancestors as well as case-insensitive target collisions. */
function validateTargets(entries: readonly { target: string; kind: 'file' | 'directory' }[]): void {
  const targets = new Map<string, 'file' | 'directory'>();
  for (const entry of entries) {
    const key = pathKey(entry.target);
    if (targets.has(key)) fail('duplicate', 'Doppelter Zielpfad; auch Groß-/Kleinschreibung wird berücksichtigt.');
    targets.set(key, entry.kind);
  }
  for (const key of targets.keys()) {
    const parts = key.split('/');
    for (let i = 1; i < parts.length; i++) {
      if (targets.get(parts.slice(0, i).join('/')) === 'file') fail('duplicate', 'Eine Datei darf kein übergeordnetes Verzeichnis eines anderen Ziels sein.');
    }
  }
}

export function validateManifest(value: unknown): TemplateManifest {
  const data = object(value, 'Manifest');
  schemaVersion(data.schemaVersion);
  fields(data, ['schemaVersion', 'id', 'version', 'variables', 'entries'], 'Manifest');
  const manifestId = id(data.id, 'Manifest-ID');
  const version = string(data.version, 'Manifestversion');
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) fail('version', 'Manifestversion muss MAJOR.MINOR.PATCH ohne führende Nullen sein.');
  const variables = array(data.variables, 'Variablen').map(parseVariable);
  unique(variables.map(variable => variable.name), 'Variablennamen');
  const byName = new Map(variables.map(variable => [variable.name, variable]));
  const entries = array(data.entries, 'Einträge').map(entry => parseEntry(entry, byName));
  unique(entries.map(entry => entry.id), 'Eintrag-IDs');
  validateTargets(entries);
  return { schemaVersion: 1, id: manifestId, version, variables, entries };
}

/** Also checks fully substituted targets, even for optional/conditional entries. No writing. */
export function validateTemplateInputs(manifest: TemplateManifest, input: unknown): TemplateInputs {
  // Revalidate callers' data instead of trusting a TypeScript annotation at runtime.
  const safe = validateManifest(manifest);
  const data = object(input, 'Eingaben');
  const names = safe.variables.map(variable => variable.name);
  if (Object.keys(data).some(key => !names.includes(key))) fail('input', 'Unbekannte Eingabevariable.');
  const result: Record<string, TemplateValue> = Object.create(null) as Record<string, TemplateValue>;
  for (const variable of safe.variables) {
    const value: unknown = Object.hasOwn(data, variable.name) ? data[variable.name] : variable.default;
    if (value === undefined) {
      const referenced = safe.entries.some(entry => tokens(entry.target).includes(variable.name) ||
        (entry.kind === 'file' && tokens(entry.content).includes(variable.name)) || entry.condition?.variable === variable.name);
      if (variable.required || referenced) fail('input', `Variable ${variable.name}: Wert oder Default fehlt.`);
    } else {
      result[variable.name] = validateValue(variable, value);
    }
  }
  const targets: { target: string; kind: 'file' | 'directory' }[] = [];
  for (const entry of safe.entries) {
    const repetitions = entry.repeatFor ? result[entry.repeatFor] as readonly string[] : [''];
    for (const item of repetitions) {
      const target = entry.target.replace(/\{\{([A-Za-z][A-Za-z0-9_]{0,63})\}\}/g, (_match, name: string) => {
        const value = name === entry.repeatFor ? item : result[name];
        if (typeof value !== 'string') fail('input', 'Zielpfad benötigt eine Pfadvariable.');
        return value;
      });
      validateRelativePath(target);
      targets.push({ target, kind: entry.kind });
    }
  }
  validateTargets(targets);
  return result;
}
