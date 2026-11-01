export class TemplateValidationError extends Error {
  constructor(readonly code: 'schema' | 'version' | 'path' | 'token' | 'duplicate' | 'input', message: string) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

export function fail(code: TemplateValidationError['code'], message: string): never {
  throw new TemplateValidationError(code, message);
}

/** JSON.parse checks grammar; a lexical pass also rejects silently overwritten keys. */
export function parseJsonData(text: string, label: string): unknown {
  let value: unknown;
  try { value = JSON.parse(text) as unknown; }
  catch { fail('schema', `${label}: Ungültiges JSON.`); }
  const stack: (Set<string> | null)[] = [];
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '{') stack.push(new Set());
    else if (character === '[') stack.push(null);
    else if (character === '}' || character === ']') stack.pop();
    else if (character === '"') {
      const start = index++;
      while (index < text.length) {
        if (text[index] === '\\') index += 2;
        else if (text[index] === '"') break;
        else index++;
      }
      let next = index + 1;
      while (/\s/.test(text[next] ?? '') && next < text.length) next++;
      if (text[next] === ':') {
        const key = JSON.parse(text.slice(start, index + 1)) as string;
        const keys = stack.at(-1);
        if (keys?.has(key)) fail('duplicate', `${label}: Doppelte JSON-Feldnamen sind nicht erlaubt.`);
        keys?.add(key);
      }
    }
  }
  return value;
}

export function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail('schema', `${label}: Objekt erwartet.`);
  }
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    fail('schema', `${label}: Nur Datenobjekte sind erlaubt.`);
  }
  return value as Record<string, unknown>;
}

export function fields(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  if (Object.keys(value).some(key => !allowed.includes(key))) {
    fail('schema', `${label}: Unbekanntes Feld; Schema-Version 1 prüfen.`);
  }
}

export function string(value: unknown, label: string): string {
  if (typeof value !== 'string') fail('schema', `${label}: Text erwartet.`);
  return value;
}

export function array(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) fail('schema', `${label}: Liste erwartet.`);
  return value;
}

export function boolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') fail('schema', `${label}: Boolean erwartet.`);
  return value;
}

export function id(value: unknown, label: string): string {
  const result = string(value, label);
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(result) || result.length > 64) {
    fail('schema', `${label}: ID aus Kleinbuchstaben, Ziffern und Bindestrichen erwartet (maximal 64 Zeichen).`);
  }
  return result;
}

export function variableName(value: unknown): string {
  const result = string(value, 'Variablenname');
  if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(result) || ['constructor', 'prototype', '__proto__'].includes(result)) {
    fail('schema', 'Ungültiger oder reservierter Variablenname.');
  }
  return result;
}

export function schemaVersion(value: unknown): void {
  if (value !== 1) fail('version', 'Nicht unterstützte Schema-Version. Version 1 verwenden; keine automatische Migration alter oder neuer Manifeste.');
}

export function pathKey(value: string): string {
  return value.normalize('NFC').toLowerCase();
}

/** Conservative portable file names: POSIX separators, no URI encoding or aliases. */
export function validatePathSegment(value: string): void {
  if (!value || value.length > 255 || value !== value.normalize('NFC') || value.trim() !== value ||
      /[\x00-\x1f\x7f-\x9f\p{Cf}/\\:*?"<>|%{}]/u.test(value) || /[. ]$/.test(value) ||
      value === '.' || value === '..' || /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(value)) {
    fail('path', 'Ungültiger Pfadbestandteil; portable Namen ohne Traversal, URI-Zeichen oder reservierte Gerätenamen verwenden.');
  }
}

export function validateRelativePath(value: string): void {
  if (!value || value.length > 4096) fail('path', 'Leerer oder zu langer relativer Zielpfad.');
  value.split('/').forEach(validatePathSegment);
}

/** The only placeholder form is {{NAME}}. No evaluation or recursive expansion. */
export function tokens(text: string): readonly string[] {
  const found: string[] = [];
  const markers = /\{\{|\}\}/g;
  const placeholder = /\{\{([A-Za-z][A-Za-z0-9_]{0,63})\}\}/y;
  let marker: RegExpExecArray | null;
  while ((marker = markers.exec(text)) !== null) {
    placeholder.lastIndex = marker.index;
    const match = placeholder.exec(text);
    if (!match) fail('token', 'Ungültiger Platzhalter; Syntax {{NAME}} verwenden.');
    found.push(match[1]);
    markers.lastIndex = placeholder.lastIndex;
  }
  return found;
}

export function unique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) fail('duplicate', `${label}: Duplikate sind nicht erlaubt.`);
}
