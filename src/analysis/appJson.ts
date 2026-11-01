import { ALAppMetadata } from '../core/projectModels';
import { array, fail, object, parseJsonData, string } from '../core/templateValidation';

function textFields(data: Record<string, unknown>, keys: readonly string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (Object.hasOwn(data, key)) {
      const value = string(data[key], `app.json ${key}`);
      if (!value.trim() || /[\x00-\x1f\x7f]/.test(value)) fail('schema', `app.json: Feld ${key} enthält keinen gültigen Text.`);
      result[key] = value;
    }
  }
  return result;
}

/** Extract observed metadata only. AL-version/schema conformance belongs to EXT-006. */
export function parseAppJson(text: string): ALAppMetadata {
  const data = object(parseJsonData(text.replace(/^\uFEFF/, ''), 'app.json'), 'app.json');
  const base = textFields(data, ['id', 'name', 'publisher', 'version', 'runtime']);
  const ranges = Object.hasOwn(data, 'idRanges') ? array(data.idRanges, 'app.json idRanges').map(value => {
    const range = object(value, 'app.json ID-Bereich');
    const from = range.from, to = range.to;
    if (typeof from !== 'number' || typeof to !== 'number' || !Number.isSafeInteger(from) ||
        !Number.isSafeInteger(to) || from < 0 || to < from) fail('schema', 'app.json: Ungültiger ID-Bereich (from/to).');
    return { from, to };
  }) : undefined;
  const dependencies = Object.hasOwn(data, 'dependencies') ? array(data.dependencies, 'app.json dependencies').map(value =>
    textFields(object(value, 'app.json Dependency'), ['id', 'name', 'publisher', 'version'])) : undefined;
  return { ...base, ...(ranges ? { idRanges: ranges } : {}), ...(dependencies ? { dependencies } : {}) };
}
