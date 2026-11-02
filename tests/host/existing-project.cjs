const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const vscode = require('vscode');
const { loadBundledTemplates } = require('../../out/templates/bundled');
const { prepareExistingProject } = require('../../out/generation/existingProjectPlan');
const { applyExistingProject } = require('../../out/generation/applyExistingProject');

exports.run = async function(extension) {
  const io = vscode.workspace.fs;
  const base = vscode.Uri.joinPath(vscode.Uri.file(fs.realpathSync(os.tmpdir())), `al-existing-${randomUUID()}`);
  await io.createDirectory(base);
  const bundle = await loadBundledTemplates(extension.extensionUri);
  const defaults = Object.fromEntries(['createDirectory', 'writeFile', 'copy', 'stat', 'readDirectory', 'readFile', 'delete'].map(name => [name, (...args) => io[name](...args)]));
  const original = { pick: vscode.window.showQuickPick, warning: vscode.window.showWarningMessage, info: vscode.window.showInformationMessage,
    error: vscode.window.showErrorMessage, editor: vscode.window.showTextDocument, input: vscode.window.showInputBox };
  const settings = (extra = {}) => ({ structure: 'preserve', modules: [], selectedModules: [], ...extra });
  async function write(root, path, content) {
    const dest = vscode.Uri.joinPath(root, path);
    await io.createDirectory(vscode.Uri.joinPath(dest, '..'));
    await io.writeFile(dest, Buffer.from(content));
  }
  async function fixture(name, extra = {}) {
    const root = vscode.Uri.joinPath(base, name); await io.createDirectory(root);
    for (const [path, text] of Object.entries({ 'app.json': '{"name":"Observed Fixture","runtime":"13.0"}',
      'src/Sales/Tables/Customer.al': 'table 50100 CustomerFixture { fields {} }',
      'src/Purchasing/Codeunits/Worker.al': 'codeunit 50101 WorkerFixture {}', ...extra })) await write(root, path, text);
    return root;
  }
  async function snapshot(root) {
    const result = {};
    async function visit(dir, prefix) {
      for (const [name, type] of await io.readDirectory(dir)) {
        const path = prefix + name, uri = vscode.Uri.joinPath(dir, name);
        if (type & vscode.FileType.SymbolicLink) result[path] = 'symlink';
        else if (type === vscode.FileType.Directory) { result[path + '/'] = 'directory'; await visit(uri, path + '/'); }
        else result[path] = Buffer.from(await io.readFile(uri)).toString('base64');
      }
    }
    await visit(root, ''); return result;
  }
  const refreshFor = (root, opts = settings()) => () => prepareExistingProject(root, opts, bundle);
  try {
    const preserved = { 'AGENTS.md': 'custom agent rules\r\n', 'TODO.md': 'custom work', '.gitignore': 'custom-ignore\n',
      '.vscode/launch.json': '{"custom":"unchanged"}', 'docs/modules/INDEX.md': '# Existing index',
      'docs/modules/details/src/Sales.md': '# Existing Sales facts', 'old/Existing.md': 'old custom docs' };
    const root = await fixture('Preserved', preserved);
    const before = await snapshot(root);
    const refresh = refreshFor(root, settings({ selectedModules: ['src/Sales'] }));
    const plan = await refresh();
    assert.ok(plan.operations.every(op => op.targetUri === vscode.Uri.joinPath(root, op.relativePath).toString()));
    let refreshCalls = 0;
    const cancelled = await applyExistingProject(plan, false, async () => { refreshCalls++; return refresh(); });
    assert.equal(cancelled.status, 'cancelled'); assert.equal(refreshCalls, 0);
    assert.deepEqual(await snapshot(root), before, 'Cancellation changes zero target entries');
    const applied = await applyExistingProject(plan, true, refresh);
    assert.equal(applied.status, 'applied', JSON.stringify(applied));
    const after = await snapshot(root);
    for (const [path, bytes] of Object.entries(before)) assert.equal(after[path], bytes, `Existing entry must be byte-identical: ${path}`);
    assert.ok(after['AGENT_INITIALIZATION.md']); assert.ok(after['docs/GAPS.md']);
    assert.ok(after['docs/modules/DISCOVERY.md'], 'Recognition report remains available beside an existing index');
    assert.ok(!after['docs/modules/details/src/Purchasing.md'], 'Unselected module gets no skeleton');
    assert.ok(!after['src/Tables/'], 'Preserve never adds standard folders');
    const second = await refresh();
    assert.equal(second.operations.filter(op => op.action === 'create').length, 0);
    assert.equal((await applyExistingProject(second, true, refresh)).createdPaths.length, 0);
    assert.deepEqual(await snapshot(root), after, 'Repeat is idempotent');

    const indexed = await fixture('Indexed');
    const selected = settings({ selectedModules: ['src/Sales'] });
    const indexedRefresh = refreshFor(indexed, selected);
    assert.equal((await applyExistingProject(await indexedRefresh(), true, indexedRefresh)).status, 'applied');
    const index = Buffer.from(await io.readFile(vscode.Uri.joinPath(indexed, 'docs/modules/INDEX.md'))).toString();
    assert.match(index, /src\/Sales/); assert.match(index, /src\/Purchasing/); assert.match(index, /al-file-paths/);
    const module = Buffer.from(await io.readFile(vscode.Uri.joinPath(indexed, 'docs/modules/details/src/Sales.md'))).toString();
    assert.match(module, /Datenfluss/); assert.match(module, /Zu prüfen/);

    const empty = vscode.Uri.joinPath(base, 'NoModules'); await io.createDirectory(empty);
    const emptyRefresh = refreshFor(empty);
    assert.equal((await applyExistingProject(await emptyRefresh(), true, emptyRefresh)).status, 'applied');
    const emptyIndex = Buffer.from(await io.readFile(vscode.Uri.joinPath(empty, 'docs/modules/INDEX.md'))).toString();
    assert.match(emptyIndex, /Keine Modulkandidaten/);
    assert.ok(!(await io.readDirectory(vscode.Uri.joinPath(empty, 'docs/modules'))).some(([name]) => name === 'details'));

    const staleRoot = await fixture('Stale');
    const staleRefresh = refreshFor(staleRoot), stalePlan = await staleRefresh();
    await write(staleRoot, 'AGENTS.md', 'arrived after preview');
    const staleBefore = await snapshot(staleRoot);
    assert.equal((await applyExistingProject(stalePlan, true, staleRefresh)).status, 'stale');
    assert.deepEqual(await snapshot(staleRoot), staleBefore, 'Stale preview performs no writes');

    for (const [name, path, type] of [['FileParent', 'docs', 'file'], ['CaseConflict', 'DOCS', 'dir'], ['Symlink', 'docs', 'link']]) {
      const conflictRoot = await fixture(name);
      if (type === 'file') await write(conflictRoot, path, 'blocking file');
      else if (type === 'dir') await io.createDirectory(vscode.Uri.joinPath(conflictRoot, path));
      else fs.symlinkSync(root.fsPath, vscode.Uri.joinPath(conflictRoot, path).fsPath, 'dir');
      const conflictRefresh = refreshFor(conflictRoot), conflictPlan = await conflictRefresh();
      assert.ok(conflictPlan.operations.some(op => op.action === 'conflict'), name);
      const unchanged = await snapshot(conflictRoot);
      assert.equal((await applyExistingProject(conflictPlan, true, conflictRefresh)).status, 'blocked');
      assert.deepEqual(await snapshot(conflictRoot), unchanged);
    }

    const raceRoot = await fixture('Race'), raceRefresh = refreshFor(raceRoot), racePlan = await raceRefresh();
    let raced = false;
    const racedResult = await applyExistingProject(racePlan, true, raceRefresh, { ...defaults,
      async copy(source, target, opts) {
        if (!raced) { raced = true; await io.writeFile(target, Buffer.from('foreign concurrent file')); }
        return io.copy(source, target, opts);
      }
    });
    assert.ok(['blocked', 'partial'].includes(racedResult.status)); assert.equal(raced, true);
    const failedTarget = vscode.Uri.joinPath(raceRoot, racedResult.failedPath);
    assert.equal(Buffer.from(await io.readFile(failedTarget)).toString(), 'foreign concurrent file');

    const deniedRoot = await fixture('Denied'), deniedRefresh = refreshFor(deniedRoot);
    const deniedResult = await applyExistingProject(await deniedRefresh(), true, deniedRefresh, { ...defaults,
      copy: async () => { throw vscode.FileSystemError.NoPermissions(); }
    });
    assert.ok(['blocked', 'partial'].includes(deniedResult.status));
    assert.equal(Buffer.from(await io.readFile(vscode.Uri.joinPath(deniedRoot, 'app.json'))).toString(), '{"name":"Observed Fixture","runtime":"13.0"}');

    const cleanupRoot = await fixture('CleanupFailure'), cleanupRefresh = refreshFor(cleanupRoot);
    let scratch;
    try {
      const cleanup = await applyExistingProject(await cleanupRefresh(), true, cleanupRefresh, { ...defaults,
        async delete(uri) { scratch = uri; throw vscode.FileSystemError.NoPermissions(); }
      });
      assert.equal(cleanup.status, 'partial'); assert.equal(cleanup.stagingCleanupFailed, true);
      assert.match(cleanup.message, /bereinigt/);
    } finally { if (scratch) await io.delete(scratch, {recursive:true, useTrash:false}); }

    const unsafeRoot = await fixture('Unsafe'), unsafePlan = await refreshFor(unsafeRoot)();
    for (const relativePath of ['../escape.md', '/absolute.md', 'new.al', 'app.json']) {
      const unsafe = { ...unsafePlan, operations: [{ entryId: relativePath, kind: 'file', action: 'create', relativePath,
        targetUri: vscode.Uri.joinPath(unsafeRoot, relativePath).toString(), content: 'unsafe', reason: 'fixture' }] };
      assert.equal((await applyExistingProject(unsafe, true, async () => unsafe)).status, 'blocked');
    }
    await commandTests(root, before, fixture, snapshot);
    await providerTest(bundle);
  } finally {
    vscode.window.showQuickPick = original.pick; vscode.window.showWarningMessage = original.warning;
    vscode.window.showInformationMessage = original.info; vscode.window.showErrorMessage = original.error;
    vscode.window.showTextDocument = original.editor; vscode.window.showInputBox = original.input;
    await io.delete(base, { recursive: true, useTrash: false });
  }
};

async function commandTests(root, before, fixture, snapshot) {
  const warnings = [], previews = [], errors = [], infos = [];
  vscode.window.showQuickPick = async (items, spec) => spec.canPickMany ? items.filter(item => item.module.relativePath === 'src/Sales') : items.find(item => item.id === 'preserve');
  vscode.window.showTextDocument = async document => { previews.push(document.getText()); return {}; };
  vscode.window.showWarningMessage = async (message, opts) => { warnings.push(message); return opts?.modal ? 'Fehlende Dateien anlegen' : undefined; };
  vscode.window.showInformationMessage = async message => { infos.push(message); };
  vscode.window.showErrorMessage = async message => { errors.push(message); };
  const fresh = await fixture('Command');
  const result = await vscode.commands.executeCommand('alAgentura.setupCurrentProject', { rootUri: fresh.toString() });
  assert.equal(result.status, 'applied', JSON.stringify({result, errors}));
  for (const label of ['Neu', 'Vorhanden', 'Konflikt', 'Überspringen', 'Ziel:', 'Inhalt:']) assert.ok(previews[0].includes(label), label);
  assert.match(infos.at(-1), /angelegt.*übersprungen.*offene Prüfpunkte/);
  assert.deepEqual(errors, []);
  const repeatedBefore = await snapshot(fresh);
  await vscode.commands.executeCommand('alAgentura.setupCurrentProject', { rootUri: fresh.toString() });
  assert.deepEqual(await snapshot(fresh), repeatedBefore);

  const cancelRoot = await fixture('CommandCancel'), cancelBefore = await snapshot(cancelRoot);
  vscode.window.showWarningMessage = async () => undefined;
  const cancel = await vscode.commands.executeCommand('alAgentura.setupCurrentProject', { rootUri: cancelRoot.toString() });
  assert.equal(cancel.status, 'cancelled'); assert.deepEqual(await snapshot(cancelRoot), cancelBefore);

  let enter, release;
  const entered = new Promise(resolve => { enter = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  vscode.window.showWarningMessage = async () => { enter(); return gate; };
  const first = vscode.commands.executeCommand('alAgentura.setupCurrentProject', { rootUri: cancelRoot.toString() });
  await entered;
  const duplicate = await vscode.commands.executeCommand('alAgentura.setupCurrentProject', { rootUri: cancelRoot.toString() });
  assert.equal(duplicate, undefined);
  release(undefined); await first;
  assert.deepEqual(await snapshot(cancelRoot), cancelBefore, 'Concurrent command never writes');
}

async function providerTest(bundle) {
  const event = new vscode.EventEmitter();
  const root = vscode.Uri.parse('al-existing-readonly://fixture/root');
  const data = Buffer.from('{"name":"Remote fixture"}');
  let writes = 0;
  const registration = vscode.workspace.registerFileSystemProvider(root.scheme, {
    onDidChangeFile: event.event, watch: () => ({dispose(){}}),
    stat: uri => {
      if (uri.path === '/root') return { type: vscode.FileType.Directory, size: 0, ctime: 0, mtime: 0 };
      if (uri.path === '/root/app.json') return { type: vscode.FileType.File, size: data.length, ctime: 0, mtime: 0 };
      throw vscode.FileSystemError.FileNotFound();
    },
    readDirectory: () => [['app.json', vscode.FileType.File]], readFile: () => data,
    writeFile() { writes++; }, createDirectory() { writes++; }, delete() { writes++; }, rename() { writes++; }
  }, { isReadonly: true });
  try {
    const opts = { structure: 'preserve', modules: [], selectedModules: [] };
    const refresh = () => prepareExistingProject(root, opts, bundle);
    const plan = await refresh();
    assert.ok(plan.operations.every(op => vscode.Uri.parse(op.targetUri).scheme === root.scheme));
    assert.equal((await applyExistingProject(plan, true, refresh)).status, 'blocked');
    assert.equal(writes, 0, 'Unsupported provider writes are rejected before target changes');
  } finally { registration.dispose(); event.dispose(); }
}
