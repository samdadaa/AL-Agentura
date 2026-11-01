const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const vscode = require('vscode');
const { completeMicrosoftProject, claimMicrosoftContinuation } = require('../../out/generation/completeMicrosoftProject');

exports.run = async function (extension) {
  const base = vscode.Uri.joinPath(vscode.Uri.file(fs.realpathSync(os.tmpdir())), `al-microsoft-${randomUUID()}`);
  const io = vscode.workspace.fs;
  await io.createDirectory(base);
  const encode = value => Buffer.from(value);
  const read = async (root, file) => Buffer.from(await io.readFile(vscode.Uri.joinPath(root, file))).toString();
  async function project(name, files = {}) {
    const root = vscode.Uri.joinPath(base, name);
    await io.createDirectory(root);
    await io.writeFile(vscode.Uri.joinPath(root, 'app.json'), encode('{"name":"Microsoft Fixture","runtime":"13.0"}\n'));
    for (const [file, content] of Object.entries(files)) {
      const dest = vscode.Uri.joinPath(root, file);
      await io.createDirectory(vscode.Uri.joinPath(dest, '..'));
      await io.writeFile(dest, encode(content));
    }
    return root;
  }
  try {
    const claims = vscode.Uri.joinPath(base, 'extension-storage');
    const id = randomUUID();
    const attempts = await Promise.all(Array.from({ length: 8 }, () => claimMicrosoftContinuation(claims, id)));
    assert.equal(attempts.filter(Boolean).length, 1, 'Claim must be exclusive in the native filesystem');
    assert.equal(await claimMicrosoftContinuation(claims, id), false, 'Consumed jobs cannot replay');
    const blockedStorage = vscode.Uri.joinPath(base, 'blocked-storage');
    await io.writeFile(blockedStorage, encode('not a directory'));
    await assert.rejects(() => claimMicrosoftContinuation(blockedStorage, randomUUID()), error => {
      assert.match(error.message, /Fortsetzungssperre:/);
      assert.ok(!error.message.includes(base.fsPath), 'Storage errors must not expose native paths');
      return true;
    });


    const blockedDirectory = vscode.Uri.joinPath(base, 'blocked-claim-directory');
    await io.createDirectory(blockedDirectory);
    await io.writeFile(vscode.Uri.joinPath(blockedDirectory, 'microsoft-continuations'), encode('not a directory'));
    await assert.rejects(() => claimMicrosoftContinuation(blockedDirectory, randomUUID()), /Fortsetzungssperre:/);

    const preserved = { 'AGENTS.md': 'user instructions', 'TODO.md': 'user tickets', '.gitignore': 'custom rules',
      'HelloWorld.al': 'pageextension 50100 Hello extends "Customer List" {}', '.vscode/launch.json': '{"custom":true}' };
    const root = await project('Standard', preserved);
    const app = await read(root, 'app.json');
    const result = await completeMicrosoftProject(extension.extensionUri, root, 'standard', []);
    assert.deepEqual(JSON.parse(await read(root, 'Standard.code-workspace')).folders, [{ path: '.' }]);
    assert.equal(result.workspaceUri.toString(), vscode.Uri.joinPath(root, 'Standard.code-workspace').toString());
    assert.ok(result.created > 0);
    for (const [file, content] of Object.entries(preserved)) assert.equal(await read(root, file), content);
    assert.equal(await read(root, 'app.json'), app);
    assert.equal((await io.stat(vscode.Uri.joinPath(root, 'src/Tables'))).type, vscode.FileType.Directory);
    assert.match(await read(root, 'GETTING_STARTED.md'), /Microsoft Fixture/);
    const repeated = await completeMicrosoftProject(extension.extensionUri, root, 'standard', []);
    assert.equal(repeated.created, 0, 'Second writer pass must be idempotent');
    assert.ok(repeated.skipped > 0);

    const modular = await project('Modular');
    await completeMicrosoftProject(extension.extensionUri, modular, 'modular', ['Sales', 'Finance']);
    assert.equal((await io.stat(vscode.Uri.joinPath(modular, 'src/Sales/Tables'))).type, vscode.FileType.Directory);
    assert.equal((await io.stat(vscode.Uri.joinPath(modular, 'src/Finance/Codeunits'))).type, vscode.FileType.Directory);

    const agent = await project('Agent', { 'app/Setup/Agent.al': 'preserved Microsoft agent' });
    await completeMicrosoftProject(extension.extensionUri, agent, 'bc-agent', []);
    assert.equal(await read(agent, 'app/Setup/Agent.al'), 'preserved Microsoft agent');
    assert.ok(!(await io.readDirectory(agent)).some(([name]) => name === 'src' || name === '.gitignore'));
    assert.ok(await io.stat(vscode.Uri.joinPath(agent, 'Agent.code-workspace')));

    const conflict = await project('Conflict', { 'docs': 'file blocking directory' });
    await assert.rejects(() => completeMicrosoftProject(extension.extensionUri, conflict, 'standard', []));
    assert.equal(await read(conflict, 'docs'), 'file blocking directory');
    assert.ok(!(await io.readDirectory(conflict)).some(([name]) => name === 'docs/PROJECT.md'));

    const foreign = await project('Foreign', { 'Foreign.code-workspace': '{"folders":[{"path":"../elsewhere"}]}' });
    await assert.rejects(() => completeMicrosoftProject(extension.extensionUri, foreign, 'standard', []), /Workspace referenziert/);
    assert.equal(await read(foreign, 'Foreign.code-workspace'), '{"folders":[{"path":"../elsewhere"}]}');
    assert.equal((await io.readDirectory(foreign)).length, 2, 'Invalid existing workspace must stop before writes');

    const race = await project('Race');
    const defaults = Object.fromEntries(['writeFile', 'copy', 'readFile', 'delete'].map(name => [name, (...args) => io[name](...args)]));
    let injected = false;
    await assert.rejects(() => completeMicrosoftProject(extension.extensionUri, race, 'standard', [], {
      ...defaults,
      async copy(source, target, options) {
        if (!injected && target.path.endsWith('/AGENTS.md')) {
          injected = true;
          await io.writeFile(target, encode('concurrent instructions'));
        }
        return io.copy(source, target, options);
      }
    }), /nicht vollständig/);
    assert.equal(injected, true);
    assert.equal(await read(race, 'AGENTS.md'), 'concurrent instructions', 'Native copy must preserve a concurrent file');

    const denied = await project('Denied');
    await assert.rejects(() => completeMicrosoftProject(extension.extensionUri, denied, 'standard', [], {
      ...defaults, copy: async () => { throw vscode.FileSystemError.NoPermissions(); }
    }), /nicht vollständig/);
    assert.equal(await read(denied, 'app.json'), app);

    const linked = await project('Linked');
    const outside = await project('Outside');
    fs.symlinkSync(outside.fsPath, vscode.Uri.joinPath(linked, 'docs').fsPath, 'dir');
    await assert.rejects(() => completeMicrosoftProject(extension.extensionUri, linked, 'standard', []));
    assert.equal((await io.readDirectory(outside)).length, 1, 'No documents may escape through a symlink');
    console.log('Microsoft completion: native claim, Standard/Modular/BC Agent, preservation, idempotence, conflicts, race, write failure and symlink passed.');
  } finally { await io.delete(base, { recursive: true, useTrash: false }); }
};
