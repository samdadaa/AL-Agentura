# Entwicklerhandbuch — AL-extension

## Projekt öffnen
Öffne `AL-extension.code-workspace` in VS Code. Lies `README.md` und `KONZEPT.md`. Das Extension-Fundament ist umgesetzt und zur Prüfung, der Generator noch **nicht fertig**; die Aufgaben stehen in `TODO.md`.

Für Installation, F5, Tests und lokale Paketierung siehe [Lokale Entwicklung](docs/operations/LOCAL_DEVELOPMENT.md). Tatsächliche Ergebnisse stehen im [EXT-001-Testbericht](docs/quality/EXT-001.md).

## Wie die Markdown-Dateien zusammenarbeiten
- `AGENTS.md`: Arbeitsvertrag für den Coding-Agenten, der diese Extension entwickelt.
- `TODO.md`: detaillierte Tickets mit Ziel, Aufgaben, Abnahme und Testnachweisen.
- `docs/architecture/`: technische Pipeline, Architekturentscheidungen und ADRs.
- `docs/modules/`: Zuständigkeiten, Verträge und offene Fragen pro Modul.
- `docs/engineering/`: Konventionen und Anforderungen an die **später generierten** AL-Agentenregeln.
- `docs/quality/`: Tests und Abnahme; ein Häkchen ist kein Testnachweis.
- `docs/security/`: Dateischutz und sichere Verarbeitung untrusted Workspaces.

## Ticket mit Agent bearbeiten
1. Ticket in `TODO.md` auswählen, etwa `EXT-001`.
2. Prompt kopieren:

> Lies `AGENTS.md`, `KONZEPT.md` und `TODO.md`. Bearbeite ausschließlich **EXT-001**. Prüfe den tatsächlichen Quellcode und die relevanten Modul-, Sicherheits- und Testdokumente. Erkläre vor Änderungen kurz Plan und Risiken. Implementiere klein und sicher. Führe verfügbare Tests aus und dokumentiere echte Ergebnisse. Aktualisiere relevante Markdown-Dateien. Setze den Status höchstens auf `Zur Prüfung`; ich übernehme die Abnahme.

3. Änderungen und Testberichte kontrollieren, dann Ticket abnehmen.

## Spätere Nutzer der Extension
Die **generierten AL-Projekte** bekommen eigene `AGENTS.md`, `TODO.md` und `GETTING_STARTED.md`. Diese Dateien sind nicht mit den Entwicklungsregeln dieses Repositories zu verwechseln.
