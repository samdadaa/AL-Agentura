# AL-extension — AL Project Assistant

VS-Code-Extension für Business-Central-/AL-Entwickler: **neue AL-Projekte mit Workspace, AL-Ordnerstruktur, Git und Agenten-Markdown vorbereiten** sowie **bestehende Projekte sicher ergänzen**.

## Aktueller Stand (01.11.2026)
**Entwicklungsgrundgerüst, kein fertiger Generator.** Ein Platzhalter-Command ist registriert. Die ausführlichen 14 Tickets stehen in `TODO.md`; der ursprüngliche Gesprächsplan in `docs/ROADMAP_ORIGINAL.md`.

## Einstieg
1. `AL-extension.code-workspace` in VS Code öffnen.
2. `npm install` (für lokale Entwicklungsabhängigkeiten).
3. `npm run compile` und `npm test`.
4. F5 für Extension Development Host. `AL Project Assistant: Setup Project` zeigt derzeit nur einen Hinweis.
5. Mit **EXT-001** beginnen, dann Abhängigkeiten laut TODO beachten.

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
