# Konzept — AL Agentura
## Ziel
Eine **offlinefähige, KI-freie** VS-Code-Extension, die mit wenigen Klicks neue AL-Projekte inklusive Workspace und robuster AL-Ordnerstruktur vorbereitet und bestehende AL-Projekte sicher ergänzt.

## Kernabläufe
**Neues Projekt:** Zielordner wählen → Name, Profil (Standard/Modular), optional Module und AL-Einstellungen erfassen → Vorschau → bestätigen → Ordner, Workspace, Konfiguration, Git-Dateien und Agenten-MD erzeugen → Projekt öffnen.

**Bestehendes Projekt:** Workspace auswählen → `app.json`, AL-Dateien, Modul-/Ordnerstruktur erkennen → fehlende Dateien und Ordner als Vorschau → nur fehlende ergänzen; vorhandene Dateien nicht überschreiben oder verschieben.

**Agenten:** `AGENTS.md` gibt Arbeitsregeln, `TODO.md` Aufgaben und `GETTING_STARTED.md` eine kopierbare Initialisierung. Bei bestehenden Projekten zuerst Modulindex, dann fachliche Dokumentation schrittweise durch externen Agenten.

## Profile
Standard: `src/{Codeunits,Pages,PageExtensions,Tables,TableExtensions,Enums,EnumExtensions,Reports,ReportExtensions,Queries,XmlPorts,Interfaces,Permissions,Profiles}`.
Modular: `src/<Modul>/<Objekttyp>` für ausgewählte Module. `.gitkeep` hält bewusst leere Ordner in Git.

## Dateien im Zielprojekt
`app.json` (sicher erstellen/prüfen), `.gitignore`, optional `.vscode/launch.json`, `AGENTS.md`, `TODO.md`, `GETTING_STARTED.md`, `docs/{PROJECT,ARCHITECTURE,CONVENTIONS,SECURITY,TESTS}.md`, `docs/modules/INDEX.md`, optionale Modul-MDs.

## Architektur
VS Code API + TypeScript; Workspace-Erkennung, AL-Analyzer (strukturell, keine fachliche KI-Interpretation), Profil-/Manifest-Engine, Vorschau, sicherer Generator, Vorlagen und Tests getrennt.

## Nicht-Ziele MVP
Kein LLM, keine automatisierte fachliche Codeerklärung, kein eigenes Ticketsystem, kein Server, keine fremden Programmiersprachen, keine stillschweigende Umstrukturierung.

## Qualität
Idempotent, offline, keine Datenverluste, Multi-Root-Unterstützung, Pfadvalidierung, sichere Fehlerbehandlung, transparente Vorschau und Tests.

## Erweiterungen
Eigene MD-Templates unverändert importieren, lokale Template-Bibliothek, neues Modul anlegen, Objekt-ID-Checks, Regelpakete.

Siehe `docs/ROADMAP_ORIGINAL.md` für das ursprüngliche ausführliche Konzept.

## Ergänzung: Qualitätsanforderungen aus früheren Projekten
- Ausführliche, einzeln abnehmbare Tickets statt Schlagwortlisten.
- Agentenverträge mit Lesereihenfolge, Projektgrenzen, Testpflicht und ehrlichen Statusmeldungen.
- Moduldokumentation und Architekturentscheidungen statt aufgeblähter Root-Dateien.
- Fachliche Fakten nur aus tatsächlichem AL-Projekt; zunächst Struktur- und Modulübersicht.
- Vorlage und Benutzerdokumentation getrennt von internen Entwicklungsregeln.
- Keine automatische Abarbeitung der gesamten TODO-Liste.
