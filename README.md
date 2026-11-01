# AL Agentura

**AL Project Scaffolding & AI Agent Workspace Setup**

VS-Code-Extension für Business-Central-/AL-Entwickler: **neue AL-Projekte mit Workspace, AL-Ordnerstruktur, Git und Agenten-Markdown vorbereiten** sowie **bestehende Projekte sicher ergänzen**.

## Aktueller Stand (01.11.2026)
**EXT-001 bis EXT-007 sind vom Benutzer abgenommen. EXT-008 bis EXT-010 sind umgesetzt und zur Prüfung.** Neue AL-Projekte und Microsoft-Projektintegration bleiben verfügbar. `AL Agent: Setup Current Project` ergänzt jetzt lokale Bestandsprojekte mit dynamischem Modulindex, Erkennungsbericht, ausgewählten Modulgerüsten, Lückenliste und kopierbarem Agenten-Initialisierungsprompt. Vorher erscheint eine vollständige Vorschau; vorhandene Dateien werden bewahrt, nach Bestätigung wird der Bestand erneut geprüft. Analyse/Planung unterstützen URI-Provider, sicheres Schreiben derzeit native lokale `file`-Ziele. Weitere Tickets bleiben offen.

## Einstieg
1. `al-agentura.code-workspace` in VS Code öffnen.
2. Node.js ab Version 22 und npm verwenden; `npm ci` installiert die festgeschriebenen Entwicklungsabhängigkeiten.
3. `npm run compile` und `npm test`.
4. F5 für Extension Development Host. `AL Agent: Analyze Existing Project` wählt den Root und meldet erkannte Struktur/Metadaten oder Lücken, ohne Dateien zu ändern. `AL Agent: Create Project` führt durch die Neuanlage. Im Microsoft-Modus werden nach dessen Eingaben Struktur, Agenten-MDs und Workspace automatisch ergänzt und geöffnet. Der eigenständige Generator behält Vorschau und Zustimmung.
5. `npm run test:host` prüft Aktivierung und Command im installierten VS Code (`code` im PATH).
6. `npm run package` baut lokal eine VSIX; keine Veröffentlichung. Details und manuelle Prüfschritte: `docs/operations/LOCAL_DEVELOPMENT.md`.

Historische Prüfnachweise (Abnahme EXT-001 bis EXT-007 am 01.11.2026 bestätigt): `docs/quality/EXT-001.md`, `docs/quality/EXT-002.md` und `docs/quality/EXT-003-004.md` und `docs/quality/EXT-005.md`. Manifestformat und Entwicklerbeispiel: `docs/modules/Templates.md` und `docs/operations/LOCAL_DEVELOPMENT.md`.

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

## Bestehendes AL-Projekt ergänzen (EXT-008 bis EXT-010)
1. Lokales AL-Projekt öffnen → **AL Agent: Setup Current Project**.
2. **Bestehende Struktur bewahren** wählen; nur gewünschte Kandidaten für Modulgerüste auswählen. Standard/Modular legt nur auf ausdrückliche Wahl zusätzliche AL-Ordner an.
3. Vorschau mit neuen Inhalten, Zielpfaden, vorhandenen Dateien und Konflikten prüfen. **Fehlende Dateien anlegen** bestätigen; Abbruch verändert keine Projektdateien.
4. `AGENT_INITIALIZATION.md`, `docs/GAPS.md` und `docs/modules/INDEX.md`/`DISCOVERY.md` lesen. Modulgerüste liegen unter `docs/modules/details/<erkannter Pfad>.md`. Vorhandene Dokumente bleiben erhalten.

Ein weiterer Lauf überschreibt nichts. Veränderte Pläne müssen erneut geprüft werden; Konflikte oder Teilfehler werden ausdrücklich gemeldet. [Prüfnachweise, Grenzen und kurze Testanleitung](docs/quality/EXT-008-010.md).

## Microsoft-Projekterstellung und Logo
Mit installierter AL Language: `AL Agent: Create Project` → Standard AL, Modular AL oder BC AI Agent → notwendige Eingaben bei Microsoft abschließen. Module werden vorher erfasst. Anschließend ergänzt Agentura automatisch fehlende Dateien und öffnet `<Ordnername>.code-workspace`, ohne weitere Rückfrage. Vorhandene Dateien bleiben erhalten; BC AI Agent erhält Agentura-MDs und Workspace unter Beibehaltung von Microsofts Struktur. Die lokale Fortsetzung unterstützt auch VS Codes `vscode-userdata`-Profilspeicher. Grenzen, Testnachweise und manuelle Prüfschritte: [Microsoft-Workflow](docs/quality/MICROSOFT-AL-WORKFLOW.md).

`assets/Logo.png` ist als Extension-Icon eingebunden und wird im VSIX für Installation und Marketplace mitgeliefert. Es wurde nichts veröffentlicht.

## Architekturgrundsatz
Die Extension selbst benötigt keine KI. Sie erstellt Projektstrukturen und Markdown-Anweisungen, die externe Coding-Agenten lesen können. Kein unbestätigtes Überschreiben und keine erfundene Code-/Fachanalyse.
