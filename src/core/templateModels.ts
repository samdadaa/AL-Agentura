/** Version 1 describes data only; no expressions, scripts or implicit inheritance. */
export type TemplateVariable = {
  readonly name: string;
  readonly required: boolean;
} & (
  | { readonly type: 'text' | 'pathSegment'; readonly default?: string }
  | { readonly type: 'boolean'; readonly default?: boolean }
  | { readonly type: 'pathSegments'; readonly default?: readonly string[] }
);

interface EntryBase {
  readonly id: string;
  readonly target: string;
  readonly optional?: boolean;
  readonly condition?: { readonly variable: string; readonly equals: boolean };
  /** A pathSegments variable; each value supplies one path segment for its token. */
  readonly repeatFor?: string;
}

export type TemplateEntry = EntryBase & (
  | { readonly kind: 'directory' }
  | { readonly kind: 'file'; readonly fileType: 'text' | 'markdown' | 'json' | 'al'; readonly content: string }
);

export interface TemplateManifest {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly version: string;
  readonly variables: readonly TemplateVariable[];
  readonly entries: readonly TemplateEntry[];
}

/** Ordered composition of complete manifests, without overrides or inheritance. */
export interface ProjectProfile {
  readonly id: string;
  readonly name: string;
  readonly manifestIds: readonly string[];
}

export interface ProfileCatalog {
  readonly schemaVersion: 1;
  readonly profiles: readonly ProjectProfile[];
}

export type TemplateValue = string | boolean | readonly string[];
export type TemplateInputs = Readonly<Record<string, TemplateValue>>;

/** URI-backed plan shared by confirmed new-project and existing-project generation. */
export interface GenerationPlan {
  readonly rootUri: string;
  readonly profileId: string;
  readonly manifests: readonly { readonly id: string; readonly version: string }[];
  readonly operations: readonly {
    readonly entryId: string;
    readonly targetUri: string;
    readonly relativePath: string;
    readonly kind: 'file' | 'directory';
    readonly action: 'create' | 'skip' | 'conflict';
    readonly reason: string;
    readonly content?: string;
  }[];
}
