const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
const { randomUUID } = require('node:crypto');
exports.run = async function() {
  try {
    assert.equal(vscode.workspace.isTrusted, false, 'This test must really run in Restricted Mode');
    const manifest = require('../../package.json');
    const extension = vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`);
    assert.ok(extension); await extension.activate();
    const root = vscode.workspace.workspaceFolders[0].uri;
    const original = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, 'Untrusted.al'));
    const { loadBundledTemplates } = require('../../out/templates/bundled');
    const { prepareExistingProject } = require('../../out/generation/existingProjectPlan');
    const { applyExistingProject } = require('../../out/generation/applyExistingProject');
    const bundle = await loadBundledTemplates(extension.extensionUri);
    const refresh = () => prepareExistingProject(root, {structure:'preserve', modules:[], selectedModules:[]}, bundle);
    assert.equal((await applyExistingProject(await refresh(), true, refresh)).status, 'applied');
    assert.deepEqual(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, 'Untrusted.al')), original);
    const { prepareNewProject } = require('../../out/workspace/newProject');
    const { createNewProject } = require('../../out/generation/createNewProject');
    const plan = await prepareNewProject(vscode.Uri.joinPath(root, '..'), {name: `Safe-${randomUUID()}`, profile:'standard', modules:[]}, bundle, 'unused');
    assert.equal((await createNewProject(plan, true)).status, 'created', 'Text scaffolding must work without executing workspace code');
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({passed:true, version:vscode.version, trusted:vscode.workspace.isTrusted}));
  } catch (error) {
    fs.writeFileSync(process.env.AL_EXTENSION_HOST_REPORT, JSON.stringify({passed:false, error:error.stack || String(error)}));
    throw error;
  } finally { /* No external extensions were activated. */ }
};
