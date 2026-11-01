# Modul Extension-Fundament

## Status und Verantwortung
EXT-001 ist technisch umgesetzt und zur Prüfung. Kein Generator vorhanden. `src/extension.ts` ist der Composition Root; er erzeugt Logger und Setup-Command und hinterlegt beide Disposables in `context.subscriptions`.

## Dateien und Verträge
- `src/commands/setupProject.ts`: registriert `alProjectAssistant.setup`; meldet ausschließlich den fehlenden Generator. Keine Dateizugriffe.
- `src/commands/runCommand.ts`: führt die Aktion aus, behandelt `vscode.CancellationError` ohne Fehlerbenachrichtigung und meldet unerwartete Fehler mit festem deutschem Text.
- `src/logging/logger.ts`: `Logger` mit `info`, `error`, `dispose`; VS-Code-OutputChannel **AL Project Assistant**, nur feste Betriebsnachrichten ohne Fehlerobjekte, Pfade oder Workspace-Inhalte.

Die Aktivierung erfolgt beim contributed Command. Der explizite `onCommand`-Eintrag bleibt zulässig, ist seit VS Code 1.74 redundant. Verwendete APIs wurden gegen `@types/vscode` 1.90.0 und die [offizielle API](https://code.visualstudio.com/api/references/vscode-api) geprüft; [Command-Aktivierung](https://code.visualstudio.com/api/get-started/extension-anatomy). Es gibt keine Änderung an der vereinbarten Architektur und damit kein neues ADR.

## Tests und Grenzen
Node-Tests prüfen Aktivierung, Entsorgung, wiederholten Aufruf, Abbruch und Fehler ohne Datenoffenlegung. Ein separater Test prüft die Verdrahtung im echten VS-Code-Host. Ergebnisse und offene manuelle Prüfung: [EXT-001](../quality/EXT-001.md). Workspace-Erkennung, Wizard, Planung und Schreiben bleiben den Folgetickets vorbehalten.
