export interface ALAppMetadata {
  readonly id?: string;
  readonly name?: string;
  readonly publisher?: string;
  readonly version?: string;
  readonly runtime?: string;
  readonly idRanges?: readonly { readonly from: number; readonly to: number }[];
  readonly dependencies?: readonly {
    readonly id?: string; readonly name?: string; readonly publisher?: string; readonly version?: string;
  }[];
}

export interface ProjectIssue {
  readonly code: 'scan' | 'limit' | 'symlink' | 'app-json';
  readonly relativePath: string;
  readonly message: string;
}

export interface ProjectEntry {
  readonly relativePath: string;
  readonly kind: 'file' | 'directory' | 'symlink' | 'unknown';
  /** False for deliberately excluded or unreadable directories. */
  readonly childrenKnown?: boolean;
}

export interface ProjectContext {
  readonly rootUri: string;
  readonly state: 'new' | 'existing' | 'incomplete';
  readonly appJsonStatus: 'missing' | 'valid' | 'invalid' | 'unknown';
  readonly appJson?: ALAppMetadata;
  readonly existingEntries: readonly ProjectEntry[];
  readonly alFiles: readonly string[];
  readonly objectFolders: readonly { readonly relativePath: string; readonly objectType: string }[];
  readonly detectedModules: readonly { readonly name: string; readonly relativePath: string; readonly source: 'directory-structure' }[];
  readonly issues: readonly ProjectIssue[];
  readonly scanComplete: boolean;
}
