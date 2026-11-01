import { ProfileCatalog, ProjectProfile, TemplateInputs, TemplateManifest, TemplateVariable } from './templateModels';
import { array, fail, fields, id, object, schemaVersion, string, unique } from './templateValidation';
import { validateManifest, validateTemplateInputs } from './manifestValidation';

export function validateProfileCatalog(value: unknown): ProfileCatalog {
  const data = object(value, 'Profilkatalog');
  schemaVersion(data.schemaVersion);
  fields(data, ['schemaVersion', 'profiles'], 'Profilkatalog');
  const profiles = array(data.profiles, 'Profile').map(value => {
    const item = object(value, 'Profil');
    fields(item, ['id', 'name', 'manifestIds'], 'Profil');
    const name = string(item.name, 'Profilname');
    if (!name.trim() || /[\x00-\x1f\x7f-\x9f]/u.test(name)) fail('schema', 'Profilname darf nicht leer sein oder Steuerzeichen enthalten.');
    const manifestIds = array(item.manifestIds, 'Manifestreferenzen').map(value => id(value, 'Manifestreferenz'));
    if (manifestIds.length === 0) fail('schema', 'Ein Profil benötigt mindestens ein Manifest.');
    unique(manifestIds, 'Manifestreferenzen');
    return { id: id(item.id, 'Profil-ID'), name, manifestIds };
  });
  unique(profiles.map(profile => profile.id), 'Profil-IDs');
  return { schemaVersion: 1, profiles };
}

/** All manifests are validated before a profile is returned. Array order is authoritative. */
export function resolveProfile(profileId: string, catalog: ProfileCatalog, manifests: readonly TemplateManifest[]): {
  readonly profile: ProjectProfile;
  readonly manifests: readonly TemplateManifest[];
} {
  const safeCatalog = validateProfileCatalog(catalog);
  const safeManifests = manifests.map(validateManifest);
  unique(safeManifests.map(manifest => manifest.id), 'Manifest-IDs');
  // A broken reference anywhere in the catalog is an error, not a silent partial load.
  for (const item of safeCatalog.profiles) {
    for (const reference of item.manifestIds) {
      if (!safeManifests.some(manifest => manifest.id === reference)) fail('schema', 'Profil verweist auf ein fehlendes Manifest.');
    }
  }
  const profile = safeCatalog.profiles.find(item => item.id === profileId);
  if (!profile) fail('input', 'Unbekanntes Profil.');
  const selected = profile.manifestIds.map(reference => safeManifests.find(manifest => manifest.id === reference)!);
  composedManifest(profile, selected);
  return { profile, manifests: selected };
}

function composedManifest(profile: ProjectProfile, manifests: readonly TemplateManifest[]): TemplateManifest {
  const variables = new Map<string, TemplateVariable>();
  for (const manifest of manifests) {
    for (const variable of manifest.variables) {
      const previous = variables.get(variable.name);
      if (previous && JSON.stringify(previous) !== JSON.stringify(variable)) {
        fail('duplicate', 'Widersprüchliche Variablendeklarationen in der Profilkomposition.');
      }
      variables.set(variable.name, variable);
    }
  }
  // Internal validation envelope only. Source manifest versions remain authoritative.
  return validateManifest({
    schemaVersion: 1, id: profile.id, version: '0.0.0',
    variables: [...variables.values()],
    entries: manifests.flatMap(manifest => manifest.entries)
  });
}

/** No inheritance or overrides: shared variable declarations must be identical. */
export function validateProfileInputs(profileId: string, catalog: ProfileCatalog, manifests: readonly TemplateManifest[], input: unknown): TemplateInputs {
  const resolved = resolveProfile(profileId, catalog, manifests);
  return validateTemplateInputs(composedManifest(resolved.profile, resolved.manifests), input);
}
