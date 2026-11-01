import * as vscode from 'vscode';

export function validateRootUri(uri: vscode.Uri): void {
  if (!uri.path.startsWith('/') || /[\x00\\]/.test(uri.path) || uri.path.split('/').some(part => part === '.' || part === '..') || uri.query || uri.fragment ||
      ['http', 'https', 'data', 'javascript', 'command', 'untitled', 'vscode'].includes(uri.scheme)) {
    throw new Error('Ziel muss ein hierarchischer Ordner eines Dateisystem-Providers sein.');
  }
}

export interface WorkspaceSelection {
  readonly folders: () => readonly vscode.WorkspaceFolder[];
  readonly pickFolder: () => Thenable<vscode.WorkspaceFolder | undefined>;
  readonly pickDirectory: () => Thenable<vscode.Uri[] | undefined>;
}

const defaultSelection: WorkspaceSelection = {
  folders: () => vscode.workspace.workspaceFolders ?? [],
  pickFolder: () => vscode.window.showWorkspaceFolderPick({ placeHolder: 'AL-Zielordner zur Analyse auswählen' }),
  pickDirectory: () => vscode.window.showOpenDialog({
    canSelectFiles: false, canSelectFolders: true, canSelectMany: false,
    openLabel: 'AL-Zielordner analysieren', title: 'Ordner zur Projektanalyse auswählen'
  })
};

export async function resolveWorkspaceRoot(selection: WorkspaceSelection = defaultSelection): Promise<vscode.Uri | undefined> {
  const folders = selection.folders();
  let root: vscode.Uri | undefined;
  if (folders.length === 1) root = folders[0].uri;
  else if (folders.length > 1) {
    const selected = await selection.pickFolder();
    // Never accept a root that disappeared while the picker was open.
    root = selected && selection.folders().some(folder => folder.uri.toString() === selected.uri.toString()) ? selected.uri : undefined;
  } else {
    root = (await selection.pickDirectory())?.[0];
  }
  if (root) validateRootUri(root);
  return root;
}
