# AL-extension — AL Project Assistant

VS-Code-Extension für Business-Central-/AL-Entwickler: **neue AL-Projekte mit Workspace, AL-Ordnerstruktur, Git und Agenten-Markdown vorbereiten** sowie **bestehende Projekte sicher ergänzen**.

## Aktueller Stand (01.11.2026)
**Extension-Fundament umgesetzt, zur Prüfung; kein fertiger Generator.** Der Setup-Platzhalter ist mit Logging, Fehler-/Abbruchbehandlung und automatisierten Tests registriert. Die ausführlichen 14 Tickets stehen in `TODO.md`; der ursprüngliche Gesprächsplan in `docs/ROADMAP_ORIGINAL.md`.

## Einstieg
1. `AL-extension.code-workspace` in VS Code öffnen.
2. Node.js ab Version 22 und npm verwenden; `npm ci` installiert die festgeschriebenen Entwicklungsabhängigkeiten.
3. `npm run compile` und `npm test`.
4. F5 für Extension Development Host. `AL Project Assistant: Setup Project` zeigt derzeit nur einen Hinweis.
5. `npm run test:host` prüft Aktivierung und Command im installierten VS Code (`code` im PATH).
6. `npm run package` baut lokal eine VSIX; keine Veröffentlichung. Details und manuelle Prüfschritte: `docs/operations/LOCAL_DEVELOPMENT.md`.

Nachweise und offene Abnahme zu **EXT-001**: `docs/quality/EXT-001.md`.

## Dokumentation
- `AGENTS.md`: verbindliche Regeln für Coding-Agenten, die **diese Extension** entwickeln.
- `TODO.md`: 14 ausführliche Tickets mit Beschreibung, Ziel, Aufgaben, Tests, Abnahme.
- `KONZEPT.md`: Produktvision, Workflows, Profile, Nicht-Ziele.
- `docs/architecture/`: Architektur und Entscheidungen.
- `docs/engineering/`: Konventionen, Agentenworkflow, generierte AL-Regeln.
- `docs/security/`: Dateischutz und Vertrauensgrenzen.
- `docs/quality/`: Teststrategie und Definition of Done.
- `docs/modules/`: Verantwortlichkeiten und künftige Modul-Schnittstellen.
- `docs/research/`: ausgewertete Muster der hochgeladenen Markdown-Sammlung.
- `resources/templates/`: zukünftige **generierte** AL-Projektdateien.

## Architekturgrundsatz
Die Extension selbst benötigt keine KI. Sie erstellt Projektstrukturen und Markdown-Anweisungen, die externe Coding-Agenten lesen können. Kein unbestätigtes Überschreiben und keine erfundene Code-/Fachanalyse.
