import { randomUUID } from 'node:crypto';
import { NewProjectError } from './newProject';
export interface ALConfiguration { readonly publisher: string; readonly appName: string; readonly version: string; readonly runtime: string; readonly idFrom: number; readonly idTo: number; }
const versionPattern = /^\d+\.\d+\.\d+\.\d+$/;
const runtimePattern = /^\d+\.\d+$/;
export function validateALConfiguration(c: ALConfiguration): void {
  for (const [key, value] of [['publisher', c.publisher], ['name', c.appName]] as const) if (!value.trim() || value.length > 120 || /[\x00-\x1f\x7f]/.test(value)) throw new NewProjectError(`app.json: ${key} ungültig.`);
  if (!versionPattern.test(c.version)) throw new NewProjectError('app.json: Version muss vier numerische Teile haben.');
  if (!runtimePattern.test(c.runtime)) throw new NewProjectError('app.json: Runtime muss Major.Minor sein.');
  if (!Number.isSafeInteger(c.idFrom) || !Number.isSafeInteger(c.idTo) || c.idFrom < 1 || c.idTo > 2147483647 || c.idTo < c.idFrom) throw new NewProjectError('app.json: ID-Bereich ungültig.');
}
export function generateALAppJson(c: ALConfiguration, uuid: () => string = randomUUID): string {
  validateALConfiguration(c);
  const id = uuid();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new NewProjectError('App-ID ist keine UUID.');
  return JSON.stringify({ id, name: c.appName.trim(), publisher: c.publisher.trim(), version: c.version, runtime: c.runtime, idRanges: [{ from: c.idFrom, to: c.idTo }], dependencies: [] }, null, 2) + '\n';
}
export function validateExistingALAppJson(content: string): readonly string[] {
  let parsed: unknown;
  try { parsed = JSON.parse(content.replace(/^\uFEFF/, '')); } catch { return ['Ungültiges JSON.']; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return ['app.json muss ein Objekt sein.'];
  const a = parsed as Record<string, unknown>; const errors: string[] = [];
  for (const key of ['id', 'name', 'publisher', 'version']) if (typeof a[key] !== 'string' || !(a[key] as string).trim()) errors.push(`Pflichtfeld ${key} fehlt.`);
  if (typeof a.id === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(a.id)) errors.push('App-ID ist keine UUID.');
  if (typeof a.version === 'string' && !versionPattern.test(a.version)) errors.push('Version hat nicht vier Teile.');
  if (a.runtime !== undefined && (typeof a.runtime !== 'string' || !runtimePattern.test(a.runtime))) errors.push('Runtime hat nicht Major.Minor-Format.');
  if (a.idRanges !== undefined && (!Array.isArray(a.idRanges) || !a.idRanges.length || a.idRanges.some(r => !r || !Number.isSafeInteger(r.from) || !Number.isSafeInteger(r.to) || r.from < 1 || r.to < r.from || r.to > 2147483647))) errors.push('Ungültige idRanges.');
  if (a.dependencies !== undefined && !Array.isArray(a.dependencies)) errors.push('dependencies muss Array sein.');
  return errors;
}
export function generateLaunchJson(): string {
  return JSON.stringify({ version: '0.2.0', configurations: [{ name: 'Business Central Sandbox (configure environment)', type: 'al', request: 'launch', environmentType: 'Sandbox', environmentName: 'YOUR_SANDBOX_NAME', startupObjectId: 22, startupObjectType: 'Page', breakOnError: 'All', launchBrowser: true }] }, null, 2) + '\n';
}
