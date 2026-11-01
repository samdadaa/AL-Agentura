# Technische Zielarchitektur

## Pipeline
`Command` → `WorkspaceResolver` → `ALProjectInspector` → `ProjectModel` → `ProfileResolver` → `TemplateRenderer` → `GenerationPlan` → `Preview` → `SafeWriter` → `ResultReport`.

## Module und Verantwortung
- `src/commands`: VS-Code-Befehle, Nutzerinteraktion anstoßen; keine direkten Schreiboperationen.
- `src/ui`: QuickPick/InputBox/Vorschau und Bestätigung; UI ist austauschbar.
- `src/workspace`: Auswahl von Root, Multi-Root, Remote-URI und Workspace-Datei.
- `src/analysis`: `app.json` lesen, AL-Dateien/Ordner erkennen, Projektstatus bestimmen; keine Fachsemantik behaupten.
- `src/core`: Modelle, Profile, Manifestvalidierung, sichere Pfade, deterministischer Plan.
- `src/templates`: deklarative AL- und Markdown-Vorlagen, Token-Rendering, Versionsinformationen.
- `src/generation`: Planbewertung, Konfliktbehandlung, sequenzielles sicheres Schreiben, Bericht.
- `src/testing`: später Integrationstest-Hilfen.
- `resources/templates`: unveränderliche ausgelieferte Vorlagendaten.

## Datenmodelle
`ProjectContext` (rootUri, appJson?, detectedModules[], existingFiles[], confidence), `ProjectProfile` (standard/modular), `TemplateManifest` (id, version, entries[], variables), `GenerationPlan` (operations mit Status create/skip/conflict), `GenerationResult` (created/skipped/failed, keine falsche Vollständigkeit).

## Dateigrenzen
Neue AL-Projekte werden in **einem neu gewählten Ordner** vorbereitet und als `.code-workspace` geöffnet. Bei vorhandenen Projekten werden nur fehlende Elemente ergänzt; `.al`-Dateien bleiben unverändert. `app.json` ist konfigurationssensitiv; niemals automatisch überschreiben. `.vscode/launch.json` ist optional, da Umgebung/Authentifizierung variieren.

## Entscheidungen
`docs/architecture/DECISIONS.md` enthält verbindliche Entscheidungen; Änderungen benötigen ein ADR unter `docs/architecture/adr/`.
