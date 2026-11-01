import { TemplateManifest } from './templateModels';
import { validateManifest } from './manifestValidation';
import { array, fail, pathKey, string, validatePathSegment } from './templateValidation';

export interface StructureOptions {
  readonly profile: 'standard' | 'modular';
  readonly modules?: readonly string[];
  /** Subset of the selected manifest's declared AL object types. */
  readonly objectTypes?: readonly string[];
}

export function objectTypesFromManifest(value: TemplateManifest): readonly string[] {
  const manifest = validateManifest(value);
  const modular = manifest.id === 'al-modular';
  if (!modular && manifest.id !== 'al-standard') fail('schema', 'Strukturprofil muss al-standard oder al-modular sein.');
  return manifest.entries.map(entry => {
    const prefix = modular ? 'src/{{MODULES}}/' : 'src/';
    if (entry.kind !== 'directory' || !entry.target.startsWith(prefix) || entry.optional !== undefined || entry.condition ||
        (modular ? entry.repeatFor !== 'MODULES' : entry.repeatFor !== undefined)) {
      fail('schema', 'Strukturprofil darf nur deklarierte Objektordner enthalten.');
    }
    const type = entry.target.slice(prefix.length);
    validatePathSegment(type);
    return type;
  });
}

/** Keep the first explicit spelling; never trim, rename or repair a module. */
export function normalizeModules(names: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  return array(names, 'Modul-/Objekttypnamen').map(value => string(value, 'Modul-/Objekttypname')).filter(name => {
    validatePathSegment(name);
    const key = pathKey(name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
