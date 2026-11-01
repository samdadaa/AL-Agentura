import * as vscode from 'vscode';
import { ExistingProjectPlan } from '../generation/existingProjectPlan';
import { ExistingProjectResult } from '../generation/applyExistingProject';

export function existingProjectPreviewText(plan: ExistingProjectPlan): string {
  const sections = [
    { label: 'Neu', items: plan.operations.filter(item => item.action === 'create') },
    { label: 'Vorhanden', items: plan.operations.filter(item => item.action === 'skip' && item.kind === 'directory') },
    { label: 'Konflikt', items: plan.operations.filter(item => item.action === 'conflict') },
    { label: 'Überspringen', items: plan.operations.filter(item => item.action === 'skip' && item.kind === 'file') }
  ];
  return `AL Agentura — Bestandsprojekt ergänzen\nZiel: ${plan.rootUri}\nProfil: ${plan.profileId}\n\n` + sections.map(section =>
    `${section.label} (${section.items.length})\n` + section.items.map(item =>
      `${item.relativePath}\n  Ziel: ${item.targetUri}\n  Aktion: ${item.action} — ${item.reason}` +
      (item.action === 'create' && item.content !== undefined ? `\n  Inhalt:\n${item.content.split('\n').map(line => '    ' + line).join('\n')}` : '')).join('\n\n')).join('\n\n') +
    '\n\nOffene Punkte\n' + plan.openIssues.map(issue => '- ' + issue).join('\n') +
    '\n\nBestehende Inhalte bleiben unverändert. Bei Konflikten erfolgt keine Anlage.\n';
}

export async function confirmExistingProject(plan: ExistingProjectPlan): Promise<boolean> {
  const document = await vscode.workspace.openTextDocument({ language: 'plaintext', content: existingProjectPreviewText(plan) });
  await vscode.window.showTextDocument(document, { preview: true });
  if (plan.operations.some(item => item.action === 'conflict')) {
    void vscode.window.showWarningMessage('AL Agentura: Konflikte in der Vorschau. Keine Änderungen; betroffene Pfade zuerst prüfen.');
    return false;
  }
  if (!plan.operations.some(item => item.action === 'create')) {
    void vscode.window.showInformationMessage('AL Agentura: Keine fehlenden Einträge. Vorhandene Dateien bleiben unverändert.');
    return false;
  }
  return await vscode.window.showWarningMessage(
    `${plan.operations.filter(item => item.action === 'create').length} fehlende Einträge anlegen? Bestehende Dateien bleiben unverändert.`,
    { modal: true }, 'Fehlende Dateien anlegen') === 'Fehlende Dateien anlegen';
}

export async function presentExistingProjectResult(result: ExistingProjectResult): Promise<void> {
  if (result.status === 'cancelled') return;
  if (result.status !== 'applied') {
    void vscode.window.showErrorMessage(`AL Agentura: ${result.status === 'partial' ? 'Ergänzung teilweise fehlgeschlagen' : result.status === 'stale' ? 'Vorschau veraltet' : 'Ergänzung blockiert'}. ` +
      `${result.createdPaths.length} angelegt, ${result.skippedPaths.length} übersprungen. ` +
      (result.failedPath ? `Gestoppt bei ${result.failedPath}. ` : '') + `${result.message ?? ''} Bereits angelegte Dateien bleiben erhalten.`);
    return;
  }
  void vscode.window.showInformationMessage(`AL Agentura: ${result.createdPaths.length} Einträge angelegt, ${result.skippedPaths.length} übersprungen. ` +
    `${result.openIssues.length} offene Prüfpunkte (siehe Vorschau, docs/GAPS.md und AGENT_INITIALIZATION.md). Bestehende Dateien unverändert.`);
}
