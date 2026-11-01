import { ProfileCatalog, TemplateManifest } from '../core/templateModels';
import { validateManifest } from '../core/manifestValidation';
import { validateProfileCatalog } from '../core/profileValidation';
import { parseJsonData } from '../core/templateValidation';

/** Load supplied text only; acquiring resources belongs to the caller's URI-aware adapter. */
export function loadManifest(text: string): TemplateManifest {
  return validateManifest(parseJsonData(text, 'Manifest'));
}

export function loadProfileCatalog(text: string): ProfileCatalog {
  return validateProfileCatalog(parseJsonData(text, 'Profilkatalog'));
}
