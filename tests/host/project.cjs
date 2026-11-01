const assert = require('node:assert/strict');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const vscode = require('vscode');
const { inspectProject } = require('../../out/analysis/inspectProject');
const { resolveWorkspaceRoot, validateRootUri } = require('../../out/workspace/resolveWorkspace');
const { loadBundledTemplates } = require('../../out/templates/bundled');
const { objectTypesFromManifest } = require('../../out/core/alStructure');
const { createStructurePlan } = require('../../out/generation/structurePlan');

exports.run = async function (extension) {
  const bundle = await loadBundledTemplates(extension.extensionUri);
  const standard = bundle.manifests.find(item => item.id === 'al-standard');
  const modular = bundle.manifests.find(item => item.id === 'al-modular');
  const options = { objectTypes: objectTypesFromManifest(standard) };
  const root = vscode.Uri.joinPath(vscode.Uri.file(os.tmpdir()), `al-integration-${randomUUID()}`);
  const originalInfo = vscode.window.showInformationMessage;
  const originalWarning = vscode.window.showWarningMessage;
  const originalDialog = vscode.window.showOpenDialog;
  const warnings = [];
  try {
    async function folder(name) {
      const uri = vscode.Uri.joinPath(root, name);
      await vscode.workspace.fs.createDirectory(uri);
      return uri;
    }
    async function write(base, relative, text) {
      const parts = relative.split('/');
      await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(base, ...parts.slice(0, -1)));
      await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(base, ...parts), Buffer.from(text));
    }
    const empty = await folder('empty');
    const existing = await folder('existing');
    const invalid = await folder('invalid');
    const generic = await folder('generic');
    const missingApp = await folder('missing-app');
    const appText = JSON.stringify({ name: 'Observed', publisher: 'Fixture', runtime: '13.0', idRanges: [{ from: 50000, to: 50099 }], dependencies: [] });
    const alText = 'table 50000 "Observed" { }';
    const ignoreText = '# existing custom rules\ncustom-only/\n';
    await write(existing, 'app.json', appText);
    await write(existing, 'src/Sales/Tables/Existing.Table.AL', alText);
    await write(existing, '.gitignore', ignoreText);
    await write(invalid, 'app.json', '{ malformed');
    await write(generic, 'README.md', 'Unrelated folder');
    await write(missingApp, 'src/Tables/Only.Table.al', 'table 50001 "Only" {}');
    const emptyContext = await inspectProject(empty, options);
    assert.equal(emptyContext.state, 'new');
    assert.equal(emptyContext.appJsonStatus, 'missing');
    const existingContext = await inspectProject(existing, options);
    assert.equal(existingContext.state, 'existing');
    assert.equal(existingContext.appJson.name, 'Observed');
    assert.deepEqual(existingContext.alFiles, ['src/Sales/Tables/Existing.Table.AL']);
    assert.deepEqual(existingContext.detectedModules, [{ name: 'Sales', relativePath: 'src/Sales', source: 'directory-structure' }]);
    assert.deepEqual(await inspectProject(existing, options), existingContext);
    const invalidContext = await inspectProject(invalid, options);
    assert.equal(invalidContext.state, 'incomplete');
    assert.equal(invalidContext.appJsonStatus, 'invalid');
    assert.match(invalidContext.issues[0].message, /JSON/);
    assert.equal((await inspectProject(generic, options)).state, 'incomplete');
    const missingContext = await inspectProject(missingApp, options);
    assert.equal(missingContext.state, 'incomplete');
    assert.equal(missingContext.appJson, undefined);
    assert.equal(missingContext.appJsonStatus, 'missing');
    assert.match(missingContext.issues[0].message, /keine app.json/);
    for (const uri of ['https://example.test/project', 'file:///tmp/project?query=x', 'file:///tmp/project#fragment', 'file:///tmp/../escape']) {
      assert.throws(() => validateRootUri(vscode.Uri.parse(uri)));
    }
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(existing, 'app.json'))).toString(), appText);
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(existing, 'src/Sales/Tables/Existing.Table.AL'))).toString(), alText);

    // Real filesystem/URIs, deterministic substitutes for the interactive pickers only.
    let picks = 0, dialogs = 0;
    const roots = [empty, existing].map((uri, index) => ({ uri, index, name: `Root ${index}` }));
    const selection = { folders: () => [], pickFolder: async () => { picks++; return roots[1]; }, pickDirectory: async () => { dialogs++; return [empty]; } };
    assert.equal((await resolveWorkspaceRoot(selection)).toString(), empty.toString());
    assert.equal(dialogs, 1);
    assert.equal((await resolveWorkspaceRoot({ ...selection, folders: () => [roots[1]] })).toString(), existing.toString());
    assert.equal(picks, 0);
    assert.equal((await resolveWorkspaceRoot({ ...selection, folders: () => roots })).toString(), existing.toString());
    assert.equal(picks, 1);
    assert.equal(await resolveWorkspaceRoot({ ...selection, pickDirectory: async () => undefined }), undefined);
    assert.equal(await resolveWorkspaceRoot({ ...selection, folders: () => roots, pickFolder: async () => undefined }), undefined);
    let current = roots;
    assert.equal(await resolveWorkspaceRoot({ ...selection, folders: () => current, pickFolder: async () => { current = []; return roots[1]; } }), undefined);

    // Command uses the default dialog path in this no-workspace host.
    vscode.window.showOpenDialog = async () => [invalid];
    vscode.window.showWarningMessage = async message => { warnings.push(message); };
    const reported = await vscode.commands.executeCommand('alProjectAssistant.inspect');
    assert.equal(reported.appJsonStatus, 'invalid');
    assert.ok(warnings.some(message => /keine Dateien geändert/.test(message) && /JSON/.test(message)));
    vscode.window.showOpenDialog = async () => undefined;
    assert.equal(await vscode.commands.executeCommand('alProjectAssistant.inspect'), undefined);

    // Apply only creates in a dedicated fixture helper, never through product code.
    const idempotent = await folder('idempotent');
    const firstContext = await inspectProject(idempotent, options);
    const first = createStructurePlan(firstContext, standard, { profile: 'standard' }, bundle.gitignore);
    const before = await vscode.workspace.fs.readDirectory(idempotent);
    assert.deepEqual(before, [], 'planning is read-only');
    for (const operation of first.operations) {
      if (operation.action !== 'create') continue;
      const uri = vscode.Uri.parse(operation.targetUri);
      if (operation.kind === 'directory') await vscode.workspace.fs.createDirectory(uri);
      else await vscode.workspace.fs.writeFile(uri, Buffer.from(operation.content));
    }
    const second = createStructurePlan(await inspectProject(idempotent, options), standard, { profile: 'standard' }, bundle.gitignore);
    assert.equal(second.operations.filter(operation => operation.action === 'create').length, 0);
    assert.equal(second.operations.filter(operation => operation.action === 'conflict').length, 0);
    const modularTarget = await folder('modular-idempotent');
    const modularOptions = { profile: 'modular', modules: ['Sales', 'Purchasing', 'sales'], objectTypes: ['Tables', 'Pages'] };
    const modularFirst = createStructurePlan(await inspectProject(modularTarget, options), modular, modularOptions, bundle.gitignore);
    for (const operation of modularFirst.operations) {
      if (operation.action !== 'create') continue;
      const uri = vscode.Uri.parse(operation.targetUri);
      if (operation.kind === 'directory') await vscode.workspace.fs.createDirectory(uri);
      else await vscode.workspace.fs.writeFile(uri, Buffer.from(operation.content));
    }
    const modularSecond = createStructurePlan(await inspectProject(modularTarget, options), modular, modularOptions, bundle.gitignore);
    assert.ok(modularSecond.operations.every(operation => operation.action === 'skip'));
    const existingPlan = createStructurePlan(existingContext, modular, { profile: 'modular', modules: ['Sales'], objectTypes: ['Tables'] }, bundle.gitignore);
    assert.ok(existingPlan.operations.every(operation => operation.action === 'skip'));
    assert.ok(!existingPlan.operations.some(operation => operation.relativePath.endsWith('/.gitkeep')));
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(existing, '.gitignore'))).toString(), ignoreText);
    console.log('EXT-003/004: local host integration passed (empty/existing/invalid/generic, no-root/multi-root selection, cancel, command, idempotence, preserved content).');
    await remoteProviderChecks(options, standard, modular, bundle.gitignore);
  } finally {
    vscode.window.showInformationMessage = originalInfo;
    vscode.window.showWarningMessage = originalWarning;
    vscode.window.showOpenDialog = originalDialog;
    await vscode.workspace.fs.delete(root, { recursive: true, useTrash: false });
  }
};

async function remoteProviderChecks(options, standard, modular, gitignore) {
  const D = vscode.FileType.Directory, F = vscode.FileType.File, S = vscode.FileType.SymbolicLink;
  const entries = new Map([
    ['/project', { type: D }], ['/project/app.json', { type: F, text: '{"name":"Remote","runtime":"13.0"}' }],
    ['/project/src', { type: D }], ['/project/src/Sales', { type: D }], ['/project/src/Sales/Tables', { type: D }],
    ['/project/src/Sales/Tables/Remote.Table.al', { type: F, text: 'unread AL code' }],
    ['/project/src/Link', { type: D | S }], ['/project/src/Link/Outside.al', { type: F, text: 'must never be visited' }],
    ['/project/.git', { type: D }], ['/project/.git/Hidden.al', { type: F, text: 'must never be visited' }],
    ['/linked-root', { type: D | S }], ['/blocked', { type: D, blocked: true }],
    ['/unknown', { type: D }], ['/unknown/blob', { type: vscode.FileType.Unknown }]
  ]);
  const event = new vscode.EventEmitter();
  const reads = [];
  let writes = 0;
  const denyWrite = () => { writes++; throw vscode.FileSystemError.NoPermissions(); };
  const provider = {
    onDidChangeFile: event.event, watch: () => ({ dispose() {} }),
    stat(uri) {
      const entry = entries.get(uri.path);
      if (!entry) throw vscode.FileSystemError.FileNotFound();
      return { type: entry.type, ctime: 1, mtime: 1, size: Buffer.byteLength(entry.text ?? '') };
    },
    readDirectory(uri) {
      reads.push(uri.path);
      if (entries.get(uri.path)?.blocked) throw vscode.FileSystemError.NoPermissions();
      const prefix = `${uri.path}/`;
      return [...entries].filter(([key]) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
        .map(([key, entry]) => [key.slice(prefix.length), entry.type]).reverse();
    },
    readFile(uri) { reads.push(uri.path); return Buffer.from(entries.get(uri.path)?.text ?? ''); },
    createDirectory: denyWrite, writeFile: denyWrite, delete: denyWrite, rename: denyWrite
  };
  const disposable = vscode.workspace.registerFileSystemProvider('al-fixture-remote', provider, { isCaseSensitive: true, isReadonly: true });
  try {
    const uri = vscode.Uri.parse('al-fixture-remote://ssh-remote+fixture/project');
    const context = await inspectProject(uri, options);
    assert.equal(context.state, 'existing');
    assert.equal(context.scanComplete, true);
    assert.deepEqual(context.alFiles, ['src/Sales/Tables/Remote.Table.al']);
    assert.ok(context.issues.some(issue => issue.code === 'symlink'));
    assert.ok(!reads.some(value => value.includes('/Link') || value.includes('/.git/') || value.endsWith('.al')));
    const remotePlan = createStructurePlan(context, modular, { profile: 'modular', modules: ['Sales'], objectTypes: ['Tables'] }, gitignore);
    for (const operation of remotePlan.operations) {
      const target = vscode.Uri.parse(operation.targetUri);
      assert.equal(target.scheme, uri.scheme);
      assert.equal(target.authority, uri.authority);
      assert.ok(target.path.startsWith(`${uri.path}/`));
    }
    const conflict = createStructurePlan(context, modular, { profile: 'modular', modules: ['Link'], objectTypes: ['Tables'] }, gitignore);
    assert.equal(conflict.operations.find(operation => operation.relativePath === 'src/Link/Tables').action, 'conflict');
    await assert.rejects(() => inspectProject(uri.with({ path: '/linked-root' }), options));
    for (const bounded of [{ ...options, maxEntries: 1 }, { ...options, maxDepth: 1 }, options]) {
      const result = await inspectProject(bounded === options ? uri.with({ path: '/blocked' }) : uri, bounded);
      assert.equal(result.scanComplete, false);
      assert.equal(result.state, 'incomplete');
      assert.throws(() => createStructurePlan(result, standard, { profile: 'standard' }, gitignore));
    }
    const limitedJson = await inspectProject(uri, { ...options, maxAppJsonBytes: 1 });
    assert.equal(limitedJson.appJsonStatus, 'invalid');
    const unknown = await inspectProject(uri.with({ path: '/unknown' }), options);
    assert.equal(unknown.scanComplete, false);
    assert.equal(unknown.appJsonStatus, 'unknown');
    assert.equal(writes, 0);
    console.log('EXT-003/004: readonly URI-provider integration passed (authority, remote paths, symlinks, exclusions, limits, read errors, zero writes).');
  } finally {
    disposable.dispose(); event.dispose();
  }
}
