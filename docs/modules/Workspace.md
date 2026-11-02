# Modul Workspace

## Status und Verantwortung
EXT-003 ist implementiert, zur Prüfung. `src/workspace/resolveWorkspace.ts` wählt ausschließlich den Analyse-Root; keine Schreiboperationen.

`resolveWorkspaceRoot()` verwendet bei genau einem Workspace-Folder dessen URI. Bei mehreren Roots fragt `showWorkspaceFolderPick` nach; verschwindet die Auswahl währenddessen, wird sie verworfen. Ohne Workspace fragt `showOpenDialog` nach genau einem Ordner. Abbruch liefert `undefined`, keine automatische erste Root-Auswahl bei Multi-Root.

`validateRootUri` verlangt einen hierarchischen absoluten Providerpfad ohne Query, Fragment, NUL, Backslash oder Traversalsegmente. Netzwerk-/Command-/Dokument-URIs werden zurückgewiesen; lokale, vscode-remote und registrierte hierarchische Dateisystem-Provider bleiben möglich. Verzeichnisart und gemeldete Symlinks prüft der Inspector über `workspace.fs.stat`. Scheme und Authority bleiben erhalten; keine Konvertierung auf `fsPath`.

Die injizierbare `WorkspaceSelection`-Grenze ersetzt in Tests nur die Ordnerliste und Picker. Produktiv sind die echten VS-Code-APIs verbunden. Die Analyseauswahl selbst legt keine Ziele an und öffnet keine Workspaces; EXT-005 ergänzt dafür die unten beschriebenen gesonderten Neuprojekt-Schnittstellen.

## Prüfung und Grenzen
Mit `@types/vscode` 1.90.0 kompiliert und gegen die [offizielle API](https://code.visualstudio.com/api/references/vscode-api) geprüft. Der echte Host testet No-root-, Single-root-, Multi-root-, Abbruch- und veraltete Auswahl mit echten URIs und ersetzten Pickern. Sichtbare Dialoge und echte Remote-Verbindungen sind nicht manuell geprüft. [Nachweis](../quality/EXT-003-004.md), [ADR 0002](../architecture/adr/0002-readonly-inspection-structure-plans.md).

## Neuprojekt-Ziele und Workspace (EXT-005, zur Prüfung)
`src/workspace/newProject.ts` ergänzt `prepareNewProject`, die erneute Preflight-Prüfung, Prüfung aller gemeldeten Eltern-Symlinks, portable/case-insensitive Zielkonflikte und `readAppJsonSource` (höchstens 1 MiB UTF-8, BOM/Originaltext erhalten). Ein neuer Root wird nur unter einem gewählten vorhandenen Elternordner vorbereitet; bestehende Ziele werden auch bei Leere abgewiesen.

Die `.code-workspace` liegt im neuen Root und referenziert `.`. `openProjectWorkspace` ruft `vscode.openFolder(uri, true)` nur nach Wahl **Workspace öffnen** auf; der bisherige Workspace wird nicht ersetzt. Neuerstellung ist derzeit auf lokale native file-Ziele ohne Authority begrenzt; fremde Provider werden vor Dateianlage abgewiesen. Resolver/Analyse unterstützen weiterhin Remote-/Virtual-URIs. [ADR 0003](../architecture/adr/0003-new-project-creation.md), [Nachweis](../quality/EXT-005.md).


## Microsoft-Create-Project-Korrektur (01.11.2026, zur Prüfung)
`commands/microsoftProjectFlow.ts` orchestriert die automatische Fortsetzung ohne nachträgliche Bestätigung. Module werden vor Microsoft erfasst. `generation/completeMicrosoftProject.ts` übernimmt ausschließlich additive lokale Dateianlage und eine relative Workspace-Datei; vorhandene Inhalte werden nicht ersetzt. BC AI Agent bewahrt seine Struktur. Der fertige Workspace öffnet automatisch im selben Fenster. Startup, app.json-Änderungen und Polling decken verzögerte Erstellung ab; gemeinsame Promise und exklusive persistente UUID-Claim-Datei im Extension-Speicher verhindern doppelte Ausführung. Teilfehler stoppen den Ablauf mit Reparaturhinweis. Manueller Bestands-Setup und unabhängiger Generator bleiben unverändert.

[ADR 0004](../architecture/adr/0004-automatic-microsoft-completion.md) präzisiert die Bestätigungspflicht nur für diesen Nutzerauftrag. [Prüfbericht und Grenzen](../quality/MICROSOFT-AL-WORKFLOW.md). `package.json` verwendet das bestehende `assets/Logo.png` als Extension-Icon; Paketinhalt lokal geprüft.


## Bestands-Setup (EXT-009/010)
`Setup Current Project` nutzt weiterhin `resolveWorkspaceRoot` (No-root-Dialog, Single-root, explizite Auswahl bei Multi-root). URI-Adapter und Vorschau erhalten Scheme/Authority. Der Writer unterstützt vorerst nur native lokale `file`-Ziele ohne Authority; alle Zielzugriffe verwenden `workspace.fs`, Node fs nur den privaten OS-Scratch. Nicht unterstützte Provider erhalten keine Schreiboperation. [ADR 0005](../architecture/adr/0005-existing-project-generation.md).

## Verbindliche Zielbindung (02.11.2026)
Die frühere automatische Auswahl anhand irgendeiner neuen `app.json` ist ersetzt: Vor Microsoft wird der exakte lokale Zielordner gewählt, Pending enthält dessen vollständige URI. Nur das Fenster mit genau diesem einzelnen Root darf ergänzen und seinen Workspace öffnen. Fremde Fenster erwerben keinen Claim. Ohne Zielbindung keine automatische Anwendung; Abbruch startet Microsoft nicht. [ADR 0007](../architecture/adr/0007-bound-project-completion.md).
