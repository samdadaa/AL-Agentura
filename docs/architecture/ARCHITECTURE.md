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

## Implementierte Verträge (EXT-002, zur Prüfung)
Die Modelle in `src/core/templateModels.ts` konkretisieren Manifest, Variablen, Einträge, Profile und den künftigen GenerationPlan. Reine Kernvalidierung liegt in `src/core/`; `src/templates/catalog.ts` lädt übergebenen JSON-Text ohne Datei-/VS-Code-Zugriff. Profilkomposition und Versionierung sind in [ADR 0001](adr/0001-template-manifest-contract.md) festgehalten. Der URI-Ressourcenadapter und reine Strukturplaner sind durch EXT-003/004 ergänzt; allgemeiner Renderer, Vorschau und Writer bleiben offen; [Modulvertrag](../modules/Templates.md).

## Workspace-Analyse und Strukturplan (EXT-003/004, zur Prüfung)
`alAgentura.analyzeExistingProject` verbindet URI-Resolver, Ressourcenloader und lesenden Inspector. `ProjectContext` dokumentiert Metadaten, Eintragsarten, vollständigen/partiellen Scan und bloße Strukturkandidaten. Der reine Strukturplaner verwendet diesen Kontext und deklarative AL-Profile für create/skip/conflict. Der Struktur-Generation-Adapter ergänzt Ziel-URIs; allgemeine Bestandsanwendung fehlt. Lokale Neuanlage siehe EXT-005 unten. [ADR 0002](adr/0002-readonly-inspection-structure-plans.md) trennt diese Arbeit von EXT-009.

## Neuprojekt-Wizard und begrenzter Writer (EXT-005, zur Prüfung)
Setup orchestriert `ui/newProjectWizard` → `workspace/newProject`/Core-Entwurf → Textvorschau und modale Zustimmung → `generation/createNewProject` → Einstieg/Ergebnis → optionales Workspace-Öffnen. Ausschließlich noch fehlende lokale file-Ziele; keine Bestandsanwendung. Inhalte werden über einen eigenen OS-Scratch und native Provider-Copy ohne Überschreiben angelegt. [ADR 0003](adr/0003-new-project-creation.md) dokumentiert die notwendige Präzisierung zu ADR 0002 und den abgewiesenen providerübergreifenden Copy-Fallback.


## Automatischer Microsoft-Abschluss
Der explizit gewählte Microsoft-Erstellungsmodus nutzt einen begrenzten additiven Writer aus `generation/completeMicrosoftProject.ts` und öffnet automatisch den erzeugten relativen Workspace. Er ersetzt keine Bestandsdateien; die allgemeine Bestandsvorschau bleibt getrennt. [ADR 0004](adr/0004-automatic-microsoft-completion.md) dokumentiert Nutzerautorisierung, Ereignisse, persistente Claims und Teilfehlerverhalten.


## Bestandsdokumentation und SafeWriter (EXT-008 bis EXT-010)
Die oben als künftig beschriebene Bestandsanwendung ist jetzt umgesetzt: Modulbelege und Dokumentrenderer → reiner Ergänzungsplan → URI-Adapter → Inhaltsvorschau/Zustimmung → frischer Planvergleich → lokaler additiver Writer → Ergebnis. Konkrete Schnittstellen, Dateischutz und Providergrenze stehen in [ADR 0005](adr/0005-existing-project-generation.md) und [Generation](../modules/Generation.md). Keine automatische Bestandsanwendung beim Start; Microsofts ausdrücklich gewählte Neuanlage bleibt separat.


## V1-Qualitäts- und Release-Gate (EXT-011)
`verify` kombiniert reguläre Tests, reale isolierte Hosts, Restricted Mode, Paket-/Installationsprüfung und Audit. Nachweise sind an Quell-/Test-/Tool-Stand und Paket-SHA gebunden. Der Installationshost testet normale installierte Produktdateien unter einem separaten API-Testtreiber. Stale Build-Ausgaben werden vor Paketierung entfernt. [ADR 0006](adr/0006-v1-quality-release.md) dokumentiert die beiden notwendigen Fehlerkorrekturen sowie Publisher-/Lizenzentscheidung und den manuellen Upload.
