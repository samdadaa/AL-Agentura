# Modul Extension-Fundament

## Status und Verantwortung
EXT-001 ist technisch umgesetzt und zur Prüfung. EXT-005 ergänzt inzwischen den lokalen Neuprojekt-Wizard; die allgemeine Bestandsanwendung fehlt weiterhin. `src/extension.ts` ist der Composition Root; er erzeugt Logger, Setup- und Analyse-Command und hinterlegt alle Disposables in `context.subscriptions`.

## Dateien und Verträge
- `src/commands/createProject.ts`: registriert `alAgentura.createProject`; orchestriert seit EXT-005 Wizard, Planung, Zustimmung, Neuprojekt-Writer und Ergebnis. Keine Datei-Schreiblogik im Command.
- `src/commands/runCommand.ts`: führt die Aktion aus, behandelt `vscode.CancellationError` ohne Fehlerbenachrichtigung und meldet unerwartete Fehler mit festem deutschem Text.
- `src/logging/logger.ts`: `Logger` mit `info`, `error`, `dispose`; VS-Code-OutputChannel **AL Agentura**, nur feste Betriebsnachrichten ohne Fehlerobjekte, Pfade oder Workspace-Inhalte.

Die Aktivierung erfolgt beim contributed Command. Der explizite `onCommand`-Eintrag bleibt zulässig, ist seit VS Code 1.74 redundant. Verwendete APIs wurden gegen `@types/vscode` 1.90.0 und die [offizielle API](https://code.visualstudio.com/api/references/vscode-api) geprüft; [Command-Aktivierung](https://code.visualstudio.com/api/get-started/extension-anatomy). Es gibt keine Änderung an der vereinbarten Architektur und damit kein neues ADR.

## Tests und Grenzen
Node-Tests prüfen Aktivierung, Entsorgung, wiederholten Aufruf, Abbruch und Fehler ohne Datenoffenlegung. Ein separater Test prüft die Verdrahtung im echten VS-Code-Host. Ergebnisse und offene manuelle Prüfung: [EXT-001](../quality/EXT-001.md). Workspace-Erkennung und Strukturplanung sind durch EXT-003/004 ergänzt, der bestätigte lokale Neuprojektablauf durch EXT-005. Allgemeine Bestandsanwendung bleibt EXT-009/010 vorbehalten.


## Microsoft-Create-Project-Korrektur (01.11.2026, zur Prüfung)
`commands/microsoftProjectFlow.ts` orchestriert die automatische Fortsetzung ohne nachträgliche Bestätigung. Module werden vor Microsoft erfasst. `generation/completeMicrosoftProject.ts` übernimmt ausschließlich additive lokale Dateianlage und eine relative Workspace-Datei; vorhandene Inhalte werden nicht ersetzt. BC AI Agent bewahrt seine Struktur. Der fertige Workspace öffnet automatisch im selben Fenster. Startup, app.json-Änderungen und Polling decken verzögerte Erstellung ab; gemeinsame Promise und exklusive persistente UUID-Claim-Datei im Extension-Speicher verhindern doppelte Ausführung. Teilfehler stoppen den Ablauf mit Reparaturhinweis. Manueller Bestands-Setup und unabhängiger Generator bleiben unverändert.

[ADR 0004](../architecture/adr/0004-automatic-microsoft-completion.md) präzisiert die Bestätigungspflicht nur für diesen Nutzerauftrag. [Prüfbericht und Grenzen](../quality/MICROSOFT-AL-WORKFLOW.md). `package.json` verwendet das bestehende `assets/Logo.png` als Extension-Icon; Paketinhalt lokal geprüft.
