# AL Agentura

**AL-Projektstruktur und Agenten-Dokumentation für Microsoft Dynamics 365 Business Central.**

AL Agentura ergänzt neue **oder bereits bestehende** AL-Projekte nach ausdrücklicher Auswahl um eine wartbare Ordnerstruktur, Markdown-Dokumentation und klare Regeln für Coding-Agenten. Ein Projekt, das eben mit Microsoft **AL: Go!** erstellt wurde, ist dabei genauso geeignet wie eine langjährig gewachsene AL-App.

**Keine automatische Microsoft-Integration:** AL Agentura startet, überwacht oder wartet nicht auf `AL: Go!`, verwaltet keine Microsoft-Projektaufträge und aktiviert keine fremden Extensions. AL Language kann unabhängig installiert sein, ist aber keine Voraussetzung für die Agentura-Funktionen.

## Schnellstart: AL-Projekt ergänzen

1. AL-Projekt im VS-Code-Explorer öffnen, z. B. einen Ordner mit `app.json`. Bei Bedarf zuvor **AL: Go!** selbst in Microsoft AL Language ausführen.
2. `Cmd/Ctrl + Shift + P` → **AL Agent: Setup Open AL Project**.
3. Modus auswählen: vorhandene Struktur bewahren (empfohlen), Standardordner ergänzen, fachliche Module ergänzen oder nur Dokumentation für ein BC-AI-Agent-Projekt.
4. Optionale erkannte Module auswählen, Vorschau prüfen und fehlende Dateien bestätigen.

Vorhandene `app.json`, `.vscode/launch.json`, `.al`-Dateien und Dokumente werden nicht überschrieben. Die Extension verwendet kein eigenes KI-Modell, benötigt keinen Account und führt keine AL-Kompilierung aus.

## Befehle

| Command Palette | Zweck |
| --- | --- |
| **AL Agent: Setup Open AL Project** | Fehlende Struktur und Dokumentation im geöffneten AL-Projekt ergänzen |
| **AL Agent: Analyze Open AL Project** | Vorhandene AL-Struktur und Metadaten ausschließlich lesen |
| **AL Agent: Open Project** | AL-Projektordner in VS Code öffnen |
| **AL Agent: Create Standalone Scaffold** | Unabhängiges neues Projektgerüst mit Dokumentation und `.code-workspace` erstellen; keine Microsoft-Automatisierung |

Beim Standalone-Scaffold ohne explizite AL-Konfiguration entsteht noch keine kompilierbare AL-App. Eine eigene `app.json` bzw. Sandbox-Konfiguration kann im dortigen Assistenten bewusst erstellt oder übernommen werden.

## Was wird ergänzt?

- `AGENTS.md`, `TODO.md`, `GETTING_STARTED.md` sowie zusätzliche Projekt- und Modul-Dokumentation.
- `docs/` mit Architektur, Konventionen, Sicherheit, Tests, Projektinformationen und Modulübersicht.
- Optional eine klassische `src/`-Objektstruktur oder bewusst ausgewählte fachliche Module.
- Wiederholbare, idempotente Generierung mit Vorschau, Konfliktprüfung und Schutz vorhandener Dateien.
- Vorlagen nach den Grundgedanken von [AL Guidelines](https://alguidelines.dev/). Die Dateien enthalten an Projekt und Kontext anzupassende Platzhalter; fachliche Inhalte werden nicht erfunden.

## Grenzen und Sicherheit

- Lokale Dateierzeugung, keine Cloud-Übertragung durch AL Agentura. Native lokale `file:`-Ziele sind für Schreibvorgänge erforderlich.
- Andere Erweiterungen, Microsoft-Projektassistenten und KI-Agenten werden weder automatisch aufgerufen noch konfiguriert.
- Keine eigenständige AL-Entwicklungsumgebung: Compiler, Symboldownload und Debugging bleiben Aufgabe der Microsoft AL Language Extension.
- Kein Überschreiben bestehender Dokumente oder AL-/BC-Konfigurationen. Bei Konflikten wird die Anlage gestoppt.
- Das manuelle Ergänzen eines Projekts erfolgt mit Vorschau und ausdrücklicher Zustimmung; es gibt keine Hintergrundaufträge.

## Screenshots

![Befehle](https://github.com/samdadaa/al-agentura/raw/HEAD/assets/screenshots/command-palette.png)

![Vorschau](https://github.com/samdadaa/al-agentura/raw/HEAD/assets/screenshots/existing-project-preview.png)

![Installation](https://github.com/samdadaa/al-agentura/raw/HEAD/assets/screenshots/installed-extension.png)

## Installation und Entwicklung

Visual Studio Marketplace: **AL Agentura**, Publisher **SamerDadah**. VS Code Desktop ab Version 1.90.

Entwicklung: `npm ci`, `npm run compile`, `npm test`, mit **F5** den Extension Development Host starten.

Lokale VSIX erstellen: `npm run package`. Vor der Marketplace-Aktualisierung Tests und optional `npm run verify` durchführen.

Temporäre Build-/Testdaten und alte VSIX-Dateien: `npm run clean:release` (löscht **nicht** Projektquellen, `node_modules` oder Git-Historie). **Danach erneut kompilieren und paketieren.**

Fehler und Vorschläge: [GitHub Issues](https://github.com/samdadaa/al-agentura/issues). Bitte keine Tokens, Secrets oder Kundendaten hochladen.

## Lizenz

MIT – Copyright © 2026 Samer Dadah.
