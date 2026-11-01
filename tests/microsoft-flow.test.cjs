const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(shared = {}) {
  const records = [], messages = [], errors = [];
  const state = shared.state ?? new Map(), claims = shared.claims ?? new Set();
  const events = {};
  let ready = true, failure, openingFailure, claimFailure, existingApp = true;
  const alCommands = [
    { command: 'al.project.go', title: 'AL: Go!' },
    { command: 'al.project.agent', title: 'AL: Create Project Agent' },
    { command: 'al.project.other', title: 'AL: Download Symbols' }
  ];
  const uri = value => ({ scheme: value.split(':')[0], path: value.replace('file://', ''), toString: () => value });
  const vscode = {
    extensions: { getExtension: () => ({ isActive: true, packageJSON: { contributes: { commands: alCommands } } }) },
    commands: {
      getCommands: async () => alCommands.map(c => c.command),
      executeCommand: async (name, ...options) => {
        records.push(['run', name, ...options]);
        if (name === 'vscode.openFolder' && openingFailure) throw new Error('open failed');
        if (name.startsWith('al.project') && failure) throw new Error('cancelled');
      }
    },
    workspace: {
      workspaceFolders: [],
      onDidChangeWorkspaceFolders: callback => { events.workspace = callback; return { dispose() {} }; },
      createFileSystemWatcher: () => ({
        onDidCreate: callback => { events.create = callback; return { dispose() {} }; },
        onDidChange: callback => { events.change = callback; return { dispose() {} }; },
        dispose() {}
      })
    },
    Uri: { parse: uri, joinPath: (root, file) => uri(root.toString() + '/' + file) },
    window: {
      showInformationMessage: async (...args) => { messages.push(args); },
      showWarningMessage: async (...args) => { messages.push(args); },
      showQuickPick: async values => values[0],
      showInputBox: async () => 'Sales, Finance',
      showErrorMessage: async (...args) => { errors.push(args); }
    }
  };
  const context = { extensionUri: uri('file:///extension'), globalStorageUri: uri('file:///storage'),
    globalState: { get: name => state.get(name), update: async (name, value) => state.set(name, value) } };
  const filename = path.resolve(__dirname, '../out/commands/microsoftProjectFlow.js');
  const module = { exports: {} };
  const { NewProjectError, parseModuleList } = require('../out/core/newProject');
  const loader = dep => {
    if (dep === 'vscode') return vscode;
    if (dep === 'node:crypto') return require(dep);
    if (dep === '../core/newProject') return { NewProjectError, parseModuleList };
    if (dep === '../workspace/newProject') return { readAppJsonSource: async () => { if (!ready) throw new Error('partial JSON'); },
      statIfPresent: async () => existingApp ? { type: 1 } : undefined };
    if (dep === '../generation/completeMicrosoftProject') return {
      claimMicrosoftContinuation: async (storage, id) => {
        if (claimFailure) throw new NewProjectError('Fortsetzungssperre: Zugriff verweigert.');
        if (claims.has(id)) return false;
        claims.add(id); return true;
      },
      completeMicrosoftProject: async (...args) => {
        records.push(['complete', ...args]);
        if (failure) throw new NewProjectError('Fixture: Teilfehler');
        return { workspaceUri: uri(args[1].toString() + '/Project.code-workspace'), created: 10, skipped: 2 };
      }
    };
    throw new Error(dep);
  };
  vm.runInThisContext(`(function(require,module,exports){${fs.readFileSync(filename, 'utf8')}\n})`, { filename })(loader, module, module.exports);
  return { flow: module.exports, context, vscode, records, state, claims, events, messages, errors,
    logger: { info() {}, error() {} }, root: (value = 'file:///tmp/new-project') => ({ uri: uri(value) }),
    existingApp: value => { existingApp = value; }, ready: value => { ready = value; }, fail: () => { failure = true; }, failOpen: () => { openingFailure = true; }, failClaim: () => { claimFailure = true; } };
}

const pending = h => [...h.state.values()].find(Boolean);
const completeCount = h => h.records.filter(r => r[0] === 'complete').length;

test('Microsoft commands come from the actual manifest', async () => {
  const h = setup();
  assert.deepEqual((await h.flow.findMicrosoftProjectCommands('standard')).map(c => c.command), ['al.project.go']);
  assert.deepEqual((await h.flow.findMicrosoftProjectCommands('bc-agent')).map(c => c.command), ['al.project.agent']);
});

test('Microsoft starts without generating files until a new valid AL root is available', async () => {
  const h = setup();
  assert.equal(await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'bc-agent'), true);
  assert.deepEqual(h.records.map(r => r[1]), ['al.project.agent']);
  assert.ok(pending(h));
});

test('New AL project completes and opens workspace automatically without confirmations', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  h.vscode.workspace.workspaceFolders = [h.root()];
  await Promise.all(Array.from({ length: 10 }, () => h.flow.offerMicrosoftProjectContinuation(h.context, h.logger)));
  assert.equal(completeCount(h), 1);
  assert.equal(h.records.at(-1)[1], 'vscode.openFolder');
  assert.deepEqual(h.records.at(-1)[3], { forceReuseWindow: true });
  assert.deepEqual(h.messages, []);
  assert.equal(pending(h), undefined);
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.equal(completeCount(h), 1);
});

test('Persistent exclusive claim prevents stale state in a second extension host from replaying', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  const stale = new Map(h.state);
  const second = setup({ state: stale, claims: h.claims });
  h.vscode.workspace.workspaceFolders = [h.root()];
  second.vscode.workspace.workspaceFolders = [second.root()];
  await Promise.all([h, second].map(host => host.flow.offerMicrosoftProjectContinuation(host.context, host.logger)));
  assert.equal(completeCount(h) + completeCount(second), 1);
});

test('Modular input is collected before Microsoft and persisted across window changes', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'modular');
  assert.deepEqual(pending(h).modules, ['Sales', 'Finance']);
  h.vscode.window.showInputBox = () => { throw new Error('No more input allowed'); };
  h.vscode.workspace.workspaceFolders = [h.root()];
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.deepEqual(h.records.find(r => r[0] === 'complete')[4], ['Sales', 'Finance']);
});

test('Module cancellation never starts Microsoft or stores a continuation', async () => {
  const h = setup();
  h.vscode.window.showInputBox = async () => undefined;
  assert.equal(await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'modular'), false);
  assert.equal(pending(h), undefined);
  assert.deepEqual(h.records, []);
});

test('Old roots, multi-root and remote projects are never automatically supplemented', async () => {
  const h = setup();
  const old = h.root('file:///tmp/old');
  h.vscode.workspace.workspaceFolders = [old];
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  for (const folders of [[old], [h.root(), old], [h.root('vscode-remote:///tmp/new')]]) {
    h.vscode.workspace.workspaceFolders = folders;
    await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
    assert.equal(completeCount(h), 0);
  }
});

test('Delayed or partial app.json is retried when changed, without duplicate completion', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  h.vscode.workspace.workspaceFolders = [h.root()];
  h.ready(false);
  const registration = h.flow.registerMicrosoftProjectResume(h.context, h.logger);
  try {
    await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
    assert.equal(completeCount(h), 0);
    h.ready(true);
    h.events.change();
    await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
    assert.equal(completeCount(h), 1);
  } finally { registration.dispose(); }
});

test('Polling recovers a missed app.json event', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  h.vscode.workspace.workspaceFolders = [h.root()];
  h.ready(false);
  const registration = h.flow.registerMicrosoftProjectResume(h.context, h.logger);
  try {
    await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
    h.ready(true);
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.equal(completeCount(h), 1);
  } finally { registration.dispose(); }
});

test('Expired pending requests are discarded and reported', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  pending(h).createdAt = Date.now() - 16 * 60 * 1000;
  h.vscode.workspace.workspaceFolders = [h.root()];
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.equal(completeCount(h), 0);
  assert.equal(pending(h), undefined);
  assert.match(h.messages[0][0], /abgelaufen/);
});

test('Partial failure is reported, does not open workspace and is never automatically replayed', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  h.fail();
  h.vscode.workspace.workspaceFolders = [h.root()];
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.equal(completeCount(h), 1);
  assert.match(h.errors[0][0], /Teilfehler/);
  assert.ok(!h.records.some(r => r[1] === 'vscode.openFolder'));
});

test('Workspace opening failure reports created files and manual recovery', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  h.failOpen();
  h.vscode.workspace.workspaceFolders = [h.root()];
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.match(h.errors[0][0], /Dateien ergänzt.*manuell öffnen/);
});

test('A failed Microsoft command clears its pending request', async () => {
  const h = setup();
  h.fail();
  assert.equal(await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard'), false);
  assert.equal(pending(h), undefined);
  assert.equal(completeCount(h), 0);
});

test('Repeated starts while pending never invoke Microsoft twice', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  assert.equal(await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard'), false);
  assert.equal(h.records.length, 1);
});


test('Microsoft can populate an already open empty root without switching windows', async () => {
  const h = setup();
  h.existingApp(false);
  h.ready(false);
  h.vscode.workspace.workspaceFolders = [h.root()];
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  assert.equal(completeCount(h), 0);
  h.ready(true);
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.equal(completeCount(h), 1);
});


test('Storage failures identify the continuation step and stop without writes or repeated notifications', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context, h.logger, 'standard');
  h.failClaim();
  h.vscode.workspace.workspaceFolders = [h.root()];
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  await h.flow.offerMicrosoftProjectContinuation(h.context, h.logger);
  assert.equal(completeCount(h), 0);
  assert.equal(pending(h), undefined);
  assert.equal(h.errors.length, 1);
  assert.match(h.errors[0][0], /fehlgeschlagen \(Fortsetzungssperre\).*Zugriff verweigert/);
});
