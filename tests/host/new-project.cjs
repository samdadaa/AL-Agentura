const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const vscode = require('vscode');
const { loadBundledTemplates } = require('../../out/templates/bundled');
const { prepareNewProject, readAppJsonSource } = require('../../out/workspace/newProject');
const { createNewProject } = require('../../out/generation/createNewProject');

exports.run = async function (extension) {
  assert.equal(vscode.workspace.workspaceFolders, undefined, 'Host has no open workspace');
  const base = vscode.Uri.joinPath(vscode.Uri.file(fs.realpathSync(os.tmpdir())), `al-new-${randomUUID()}`);
  await vscode.workspace.fs.createDirectory(base);
  const bundle = await loadBundledTemplates(extension.extensionUri);
  const guide = Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(extension.extensionUri, 'resources/templates/new-project/GETTING_STARTED.md'))).toString('utf8');
  const source = vscode.Uri.joinPath(base, 'app.json');
  const appContent = '\uFEFF{\n  "name":"Observed source", "publisher":"Fixture", "runtime":"13.0", "idRanges":[{"from":50000,"to":50099}]\n}\n';
  await vscode.workspace.fs.writeFile(source, Buffer.from(appContent));
  const original = {
    dialog: vscode.window.showOpenDialog, input: vscode.window.showInputBox, pick: vscode.window.showQuickPick,
    warning: vscode.window.showWarningMessage, info: vscode.window.showInformationMessage,
    error: vscode.window.showErrorMessage, editor: vscode.window.showTextDocument,
    execute: vscode.commands.executeCommand, getExtension: vscode.extensions.getExtension
  };
  // Exercise the real independent-generator command including its configuration steps.
  vscode.extensions.getExtension = id => id === 'ms-dynamics-smb.al' ? { isActive: true, packageJSON: {} } : original.getExtension(id);
  const options = { name: 'Direct', profile: 'standard', modules: [] };
  async function folder(name) {
    const uri = vscode.Uri.joinPath(base, name); await vscode.workspace.fs.createDirectory(uri); return uri;
  }
  async function wizard(config) {
    const messages = [], errors = [], editors = [], opens = [];
    let confirmations = 0;
    const parent = config.parent ?? await folder(config.name + '-parent');
    const root = vscode.Uri.joinPath(parent, config.name);
    vscode.window.showOpenDialog = async spec => {
      const step = spec.canSelectFolders ? 'parent' : 'source';
      if (config.stopAt === step) return undefined;
      return [step === 'parent' ? parent : config.source ?? source];
    };
    vscode.window.showInputBox = async spec => {
      const step = spec.title.includes('Module') ? 'modules' : spec.title === 'AL Publisher' ? 'publisher' : spec.title === 'AL App-Version' ? 'version' : spec.title.startsWith('AL Runtime') ? 'runtime' : spec.title === 'AL Objekt-ID von' ? 'from' : spec.title === 'AL Objekt-ID bis' ? 'to' : 'name';
      if (config.stopAt === step) return undefined;
      const value = ({name: config.name, modules: config.modules ?? 'Sales, Purchasing, sales', publisher: 'Fixture', version: '1.0.0.0', runtime: '13.0', from: '50100', to: '50199'})[step];
      assert.equal(await spec.validateInput(value), undefined);
      return value;
    };
    vscode.window.showQuickPick = async (items, spec) => {
      if (spec.title.includes('Projektmodus')) return items.find(item => item.profile === 'fallback');
      const step = spec.title.endsWith('Profil') ? 'profile' : spec.title.includes('Debug-Konfiguration') ? 'launch' : 'config';
      if (config.stopAt === step) return undefined;
      return items.find(item => step === 'profile' ? item.profile === (config.profile ?? 'standard') : step === 'launch' ? item.include === !!config.launch : config.copyApp ? item.copyApp : item.createApp === !!config.generateApp);
    };
    vscode.window.showWarningMessage = async () => {
      confirmations++;
      if (config.lateConflict) {
        await vscode.workspace.fs.createDirectory(root);
        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, 'foreign.txt'), Buffer.from('foreign'));
      }
      return config.stopAt === 'confirm' ? undefined : 'Projekt anlegen';
    };
    vscode.window.showInformationMessage = async message => { messages.push(message); return config.open ? 'Workspace öffnen' : 'Später'; };
    vscode.window.showErrorMessage = async message => { errors.push(message); return undefined; };
    vscode.window.showTextDocument = async document => { editors.push(document.uri.toString()); return {}; };
    vscode.commands.executeCommand = async (id, ...args) => {
      if (id === 'vscode.openFolder') { opens.push(args); return undefined; }
      return original.execute(id, ...args);
    };
    const result = await original.execute('alAgentura.createProject');
    return { result, parent, root, messages, errors, editors, opens, confirmations };
  }
  try {
    const standard = await wizard({ name: 'Standard', open: true });
    assert.equal(standard.result.status, 'created', JSON.stringify(standard.result));
    assert.equal(standard.result.hasAppJson, false);
    assert.equal((await vscode.workspace.fs.readDirectory(vscode.Uri.joinPath(standard.root, 'src'))).length, 14);
    await assert.rejects(() => vscode.workspace.fs.stat(vscode.Uri.joinPath(standard.root, 'app.json')));
    const workspace = vscode.Uri.joinPath(standard.root, 'Standard.code-workspace');
    assert.deepEqual(JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(workspace)).toString()).folders, [{ path: '.' }]);
    assert.equal(standard.opens.length, 1);
    assert.equal(standard.opens[0][0].toString(), workspace.toString());
    assert.equal(standard.opens[0][1], true);
    assert.ok(standard.editors.some(uri => uri.includes('GETTING_STARTED.md')));
    assert.match(standard.messages.at(-1), /AL-Konfiguration noch ausstehend/);
    const modular = await wizard({ name: 'Modular', profile: 'modular', copyApp: true });
    assert.equal(modular.result.status, 'created');
    assert.equal(modular.result.hasAppJson, true);
    assert.deepEqual((await vscode.workspace.fs.readDirectory(vscode.Uri.joinPath(modular.root, 'src'))).map(([name]) => name).sort(), ['Purchasing', 'Sales']);
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(modular.root, 'app.json'))).toString('utf8'), appContent);
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(source)).toString('utf8'), appContent);
    for (const name of ['Sales', 'Purchasing']) {
      assert.match(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(modular.root, `docs/modules/details/src/${name}.md`))).toString(), new RegExp(`Modul: ${name}`));
    }
    for (const root of [standard.root, modular.root]) {
      assert.match(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, 'README.md'))).toString(), /## Voraussetzungen/);
    }
    for (const stopAt of ['parent', 'name', 'profile', 'modules', 'config', 'source', 'launch', 'confirm']) {
      const cancelled = await wizard({ name: `Cancel-${stopAt}`, profile: 'modular', copyApp: true, stopAt });
      assert.ok(cancelled.result === undefined || cancelled.result.status === 'cancelled');
      assert.deepEqual(await vscode.workspace.fs.readDirectory(cancelled.parent), []);
      assert.equal(cancelled.messages.length, 0);
    }
    const existingParent = await folder('existing-case');
    const existingRoot = vscode.Uri.joinPath(existingParent, 'Existing');
    await vscode.workspace.fs.createDirectory(existingRoot);
    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(existingRoot, 'app.json'), Buffer.from('existing app must remain unchanged'));
    const existing = await wizard({ name: 'Existing', parent: existingParent });
    assert.equal(existing.result, undefined);
    assert.equal(existing.confirmations, 0);
    assert.equal(existing.errors.length, 1);
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(existingRoot, 'app.json'))).toString(), 'existing app must remain unchanged');
    const race = await wizard({ name: 'LateConflict', lateConflict: true });
    assert.equal(race.result.status, 'blocked');
    assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(race.root, 'foreign.txt'))).toString(), 'foreign');
    assert.equal(race.messages.length, 0);
    const invalidSource = vscode.Uri.joinPath(base, 'invalid.json');
    await vscode.workspace.fs.writeFile(invalidSource, Buffer.from('{'));
    const invalid = await wizard({ name: 'InvalidSource', copyApp: true, source: invalidSource });
    assert.equal(invalid.result, undefined);
    assert.equal(invalid.errors.length, 1);
    assert.deepEqual(await vscode.workspace.fs.readDirectory(invalid.parent), []);
    const emptyExisting = await folder('empty-existing');
    const emptyParent = vscode.Uri.joinPath(emptyExisting, 'parent');
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(emptyParent, 'Direct'));
    await assert.rejects(() => prepareNewProject(emptyParent, options, bundle, guide));
    const directParent = await folder('direct-parent');
    const direct = await prepareNewProject(directParent, options, bundle, guide);
    assert.equal((await createNewProject(direct, false)).status, 'cancelled');
    const forged = { ...direct, operations: [{ ...direct.operations[0], targetUri: source.toString() }] };
    assert.equal((await createNewProject(forged, true)).status, 'blocked');
    const traversing = { ...direct, operations: [{ ...direct.operations[0], relativePath: '../escape' }] };
    assert.equal((await createNewProject(traversing, true)).status, 'blocked');
    assert.deepEqual(await vscode.workspace.fs.readDirectory(directParent), []);
    const configured = await wizard({ name: 'Configured', generateApp: true, launch: true });
    assert.equal(configured.result.status, 'created');
    const configuredApp = JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(configured.root, 'app.json'))).toString());
    assert.equal(configuredApp.publisher, 'Fixture');
    assert.equal(configuredApp.runtime, '13.0');
    assert.deepEqual(configuredApp.idRanges, [{ from: 50100, to: 50199 }]);
    assert.ok(await vscode.workspace.fs.stat(vscode.Uri.joinPath(configured.root, '.vscode/launch.json')));
    for (const stopAt of ['publisher', 'version', 'runtime', 'from', 'to']) {
      const aborted = await wizard({ name: `Cancel-${stopAt}`, generateApp: true, stopAt });
      assert.deepEqual(await vscode.workspace.fs.readDirectory(aborted.parent), []);
    }
    await writerFailureChecks(base, bundle, guide, options);
    // Parallel invocation cannot open a second wizard while the first picker is pending.
    let release;
    let entered;
    const started = new Promise(resolve => { entered = resolve; });
    vscode.window.showOpenDialog = () => { entered(); return new Promise(resolve => { release = resolve; }); };
    const first = original.execute('alAgentura.createProject');
    await started;
    assert.equal(await original.execute('alAgentura.createProject'), undefined);
    release(undefined);
    await first;
    console.log('EXT-005: new-project host suite passed (wizard, copies, cancellations, conflicts, URI providers, partial errors, workspace dispatch).');
  } finally {
    vscode.window.showOpenDialog = original.dialog; vscode.window.showInputBox = original.input;
    vscode.window.showQuickPick = original.pick; vscode.window.showWarningMessage = original.warning;
    vscode.window.showInformationMessage = original.info; vscode.window.showErrorMessage = original.error;
    vscode.window.showTextDocument = original.editor; vscode.commands.executeCommand = original.execute; vscode.extensions.getExtension = original.getExtension;
    await vscode.workspace.fs.delete(base, { recursive: true, useTrash: false });
  }
};

async function writerFailureChecks(base, bundle, guide, options) {
  const parent = vscode.Uri.joinPath(base, 'failure-parent');
  await vscode.workspace.fs.createDirectory(parent);
  const defaults = Object.fromEntries(['createDirectory', 'writeFile', 'copy', 'stat', 'readDirectory', 'readFile', 'delete']
    .map(key => [key, (...args) => vscode.workspace.fs[key](...args)]));
  const race = await prepareNewProject(parent, { ...options, name: 'Race' }, bundle, guide);
  const raced = await createNewProject(race, true, { ...defaults,
    async copy(source, target, settings) {
      assert.equal(settings.overwrite, false);
      if (target.path.endsWith('/.gitignore')) await vscode.workspace.fs.writeFile(target, Buffer.from('foreign race'));
      return vscode.workspace.fs.copy(source, target, settings);
    }
  });
  assert.equal(raced.status, 'partial');
  assert.equal(Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.Uri.parse(race.rootUri), '.gitignore'))).toString(), 'foreign race');
  const failure = await prepareNewProject(parent, { ...options, name: 'Failure' }, bundle, guide);
  const partial = await createNewProject(failure, true, { ...defaults,
    copy(source, target, settings) {
      if (target.path.endsWith('/GETTING_STARTED.md')) throw vscode.FileSystemError.NoPermissions();
      return vscode.workspace.fs.copy(source, target, settings);
    }
  });
  assert.equal(partial.status, 'partial');
  assert.equal(partial.failedPath, 'GETTING_STARTED.md');
  assert.ok(partial.createdPaths.includes('Failure.code-workspace'));
  assert.ok(await vscode.workspace.fs.stat(vscode.Uri.parse(failure.workspaceUri)));
  const cleanupPlan = await prepareNewProject(parent, { ...options, name: 'CleanupWarning' }, bundle, guide);
  let scratch;
  try {
    const cleanup = await createNewProject(cleanupPlan, true, { ...defaults,
      async delete(uri) { scratch = uri; throw vscode.FileSystemError.NoPermissions(); }
    });
    assert.equal(cleanup.status, 'created');
    assert.equal(cleanup.stagingCleanupFailed, true, 'Successful project creation must still report scratch cleanup failure');
  } finally { if (scratch) await vscode.workspace.fs.delete(scratch, {recursive:true, useTrash:false}); }
  const link = vscode.Uri.joinPath(base, 'linked-parent');
  fs.symlinkSync(parent.fsPath, link.fsPath, 'dir');
  await assert.rejects(() => prepareNewProject(link, options, bundle, guide));
  const sourceLink = vscode.Uri.joinPath(base, 'linked-app.json');
  fs.symlinkSync(vscode.Uri.joinPath(base, 'app.json').fsPath, sourceLink.fsPath, 'file');
  await assert.rejects(() => readAppJsonSource(sourceLink));
  const event = new vscode.EventEmitter();
  let writes = 0;
  const denied = () => { writes++; throw vscode.FileSystemError.NoPermissions(); };
  const provider = { onDidChangeFile: event.event, watch: () => ({ dispose() {} }),
    stat: () => ({ type: vscode.FileType.Directory, size: 0, ctime: 1, mtime: 1 }),
    readDirectory: () => [], readFile: () => new Uint8Array(),
    createDirectory: denied, writeFile: denied, delete: denied, rename: denied };
  const registration = vscode.workspace.registerFileSystemProvider('al-new-unsupported', provider, { isCaseSensitive: true });
  try {
    await assert.rejects(() => prepareNewProject(vscode.Uri.parse('al-new-unsupported://remote-fixture/parent'), options, bundle, guide), /lokale file/);
    assert.equal(writes, 0);
  } finally { registration.dispose(); event.dispose(); }
}
