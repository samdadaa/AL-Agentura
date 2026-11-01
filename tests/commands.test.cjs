const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const commands = new Map();
  const messages = [], errors = [], logs = [];
  let disposed = 0;
  let failure;
  class CancellationError extends Error {}
  const vscode = {
    CancellationError,
    commands: {
      registerCommand(id, handler) {
        assert.equal(commands.has(id), false);
        commands.set(id, handler);
        return { dispose: () => commands.delete(id) };
      }
    },
    window: {
      createOutputChannel(name) {
        assert.equal(name, 'AL Agentura');
        return { appendLine: line => logs.push(line), dispose: () => disposed++ };
      },
      async showOpenDialog() { if (failure) throw failure; return undefined; },
      async showInformationMessage(message) {
        if (failure) throw failure;
        messages.push(message);
      },
      async showErrorMessage(message) { errors.push(message); }
    }
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const localRequire = id => {
      if (id === 'vscode') return vscode;
      if (['node:fs/promises', 'node:path', 'node:os', 'node:crypto'].includes(id)) return require(id);
      assert.ok(id.startsWith('.'), `Unexpected dependency: ${id}`);
      return load(path.resolve(path.dirname(filename), `${id}.js`));
    };
    const wrapper = vm.runInThisContext(`(function(require,module,exports){${fs.readFileSync(filename, 'utf8')}\n})`, { filename });
    wrapper(localRequire, module, module.exports);
    return module.exports;
  }
  const root = path.resolve(__dirname, '../out');
  const extension = load(path.join(root, 'extension.js'));
  const context = { subscriptions: [] };
  extension.activate(context);
  return { commands, messages, errors, logs, context, CancellationError,
    fail: error => { failure = error; }, disposed: () => disposed };
}

test('Activation registers the contributed command and releases all resources', () => {
  const h = harness();
  const manifest = require('../package.json');
  assert.deepEqual([...h.commands.keys()], manifest.contributes.commands.map(c => c.command));
  assert.equal(h.context.subscriptions.length, 3);
  h.context.subscriptions.forEach(d => d.dispose());
  assert.equal(h.commands.size, 0);
  assert.equal(h.disposed(), 1);
});

test('Repeated cancelled setup wizards create no notifications or filesystem dependency', async () => {
  const h = harness();
  for (let i = 0; i < 2; i++) await h.commands.get('alAgentura.createProject')();
  assert.deepEqual(h.messages, []);
  assert.deepEqual(h.errors, []);
  assert.match(h.logs.at(-1), /abgebrochen/);
});

test('Cancellation produces no error or success notification', async () => {
  const h = harness();
  h.fail(new h.CancellationError());
  await h.commands.get('alAgentura.createProject')();
  assert.deepEqual(h.messages, []);
  assert.deepEqual(h.errors, []);
  assert.match(h.logs.at(-1), /abgebrochen/);
});

test('Unexpected errors and non-Error rejections remain contained and do not leak data', async () => {
  for (const failure of [new Error('SECRET /customer/private'), 'SECRET /customer/private', null]) {
    const h = harness();
    // null is represented as a rejected object here so the mock also throws it.
    h.fail(failure ?? { detail: 'SECRET /customer/private' });
    await h.commands.get('alAgentura.createProject')();
    assert.equal(h.errors.length, 1);
    assert.match(h.errors[0], /erneut versuchen/);
    assert.doesNotMatch(JSON.stringify([...h.errors, ...h.logs]), /SECRET|customer/);
    h.fail(undefined);
    await h.commands.get('alAgentura.createProject')();
    assert.equal(h.messages.length, 0);
  }
});
