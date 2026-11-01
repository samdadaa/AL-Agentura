const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup() {
  const records = [];
  const state = new Map();
  const alCommands = [
    { command: 'al.project.go', title: 'AL: Go!' },
    { command: 'al.project.agent', title: 'AL: Create Project Agent' },
    { command: 'al.project.other', title: 'AL: Download Symbols' }
  ];
  const vscode = {
    extensions: { getExtension: () => ({ isActive: true, packageJSON: { contributes: { commands: alCommands } } }) },
    commands: {
      getCommands: async () => alCommands.map(c => c.command),
      executeCommand: async (name, options) => { records.push(['run', name, options]); }
    },
    workspace: {
      workspaceFolders: [],
      fs: { stat: async () => ({ type: 1 }) },
      onDidChangeWorkspaceFolders: () => ({ dispose(){} }),
      createFileSystemWatcher: () => ({ onDidCreate() {}, dispose(){} })
    },
    FileType: { File: 1, SymbolicLink: 64 },
    Uri: {
      parse: value => ({ scheme: 'file', toString: () => value }),
      joinPath: (root, file) => ({toString: () => root.toString()+'/'+file})
    },
    window: {
      showInformationMessage: async () => 'AL Agentura ergänzen',
      showWarningMessage: async () => undefined,
      showQuickPick: async values => values[0],
      showErrorMessage: async () => {}
    }
  };
  const context = { globalState: { get: name => state.get(name), update: async (name, value) => state.set(name, value) } };
  const filename = path.resolve(__dirname, '../out/commands/microsoftProjectFlow.js');
  const module = { exports: {} };
  const loader = dep => {
    if(dep === 'vscode') return vscode;
    if(dep.startsWith('./')) return { SETUP_CURRENT_PROJECT_COMMAND: 'alAgentura.setupCurrentProject' };
    throw new Error(dep);
  };
  vm.runInThisContext(`(function(require,module,exports){${fs.readFileSync(filename, 'utf8')}\n})`, { filename })(loader,module,module.exports);
  return { flow: module.exports, context, vscode, records, state, logger: { info() {}, error() {} } };
}

test('Microsoft commands are selected from actual manifest and not invented', async () => {
  const h = setup();
  assert.deepEqual((await h.flow.findMicrosoftProjectCommands('standard')).map(c=>c.command), ['al.project.go']);
  assert.deepEqual((await h.flow.findMicrosoftProjectCommands('modular')).map(c=>c.command), ['al.project.go']);
  assert.deepEqual((await h.flow.findMicrosoftProjectCommands('bc-agent')).map(c=>c.command), ['al.project.agent']);
});

test('Microsoft command starts, but must not create Agentura files before a new app.json is detected', async () => {
  const h = setup();
  assert.equal(await h.flow.startMicrosoftProjectFlow(h.context,h.logger,'bc-agent'), true);
  assert.deepEqual(h.records.map(r=>r[1]), ['al.project.agent']);
  assert.equal(h.state.size, 1);
});

test('After a different AL workspace opens, user must confirm before setup is invoked', async () => {
  const h = setup();
  await h.flow.startMicrosoftProjectFlow(h.context,h.logger,'standard');
  h.vscode.workspace.workspaceFolders = [{uri:{ scheme:'file',toString:()=> 'file:///tmp/new-project' }}];
  await h.flow.offerMicrosoftProjectContinuation(h.context,h.logger);
  assert.deepEqual(h.records.map(r=>r[1]), ['al.project.go','alAgentura.setupCurrentProject']);
  assert.equal(h.records[1][2].profile,'standard');
  assert.equal(h.state.values().next().value,undefined);
});
