const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
const { randomUUID } = require('node:crypto');
exports.run = async function() {
  const originalExtension = vscode.extensions.getExtension;
  try {
    assert.equal(vscode.workspace.isTrusted, false, 'This test must really run in Restricted Mode');
    const manifest = require('../../package.json');
    const extension = originalExtension(`${manifest.publisher}.${manifest.name}`);
    assert.ok(extension); await extension.activate();
    let activations = 0;
    vscode.extensions.getExtension = id => id === 'ms-dynamics-smb.al' ? { isActive: false, activate: async () => { activations++; } } : originalExtension(id);
    const { startMicrosoftProjectFlow } = require('../../out/commands/microsoftProjectFlow');
    const logger = {info(){}, error(){}};
    assert.equal(await startMicrosoftProjectFlow({}, logger, 'standard'), false);
    await vscode.commands.executeCommand('alAgentura.testALGoIntegration');
    assert.equal(activations, 0, 'No external AL activation in Restricted Mode');
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
  } finally { vscode.extensions.getExtension = originalExtension; }
};
