# Master TODO — AL Agentura

**Stand:** 02.11.2026 · EXT-001 bis EXT-010 vom Benutzer abgenommen (Erledigt). EXT-011 mit ausdrücklich erweitertem V1-/Marketplace-Scope technisch umgesetzt, Zur Prüfung; manuelle Freigabe separat. Weitere Tickets bleiben unverändert.

## Verbindliche Arbeitsregeln
- Vor Ticketbeginn `AGENTS.md`, `KONZEPT.md`, relevante Module, Architektur und Teststrategie lesen.
- **Ein Ticket pro Agentenauftrag**, außer bei ausdrücklicher gemeinsamer Auswahl durch den Nutzer; keine eigenständige Umsetzung der gesamten Roadmap.
- Nach jedem umgesetzten Einzelpunkt sofort `TODO.md` aktualisieren; Umsetzung, Tests und Abnahme getrennt dokumentieren.
- Status: `Offen` → `In Arbeit` → `Zur Prüfung` → `Erledigt`; `Blockiert` bei offenen Voraussetzungen.
- `Zur Prüfung` heißt Code umgesetzt und dokumentiert, **nicht** automatisch getestet oder vom Nutzer abgenommen.
- `Erledigt` nur nach Nutzerabnahme. Teststatus gesondert dokumentieren.
- P0 = MVP-kritisch, P1 = wichtig, P2 = nach MVP.
- Vorhandene Daten, AL-Dateien und MD-Dateien nicht stillschweigend verändern.

## Namensumstellung — ausdrücklicher Nutzerauftrag
**Status:** In Arbeit · **Name:** AL Agentura · **Technische Paket-/Repository-ID:** `al-agentura` · **Befehlspräfix:** `AL Agent:`

- [x] Manifest, Paket-ID, Lockfile und Beschreibung umbenennen.
- [ ] Verfügbare Command-Titel/-IDs und Laufzeittexte konsistent umbenennen; künftige Befehle als geplant dokumentieren.
- [ ] Quellcode, Ressourcen, Tests, Dokumentation, Debug-Konfiguration und Entwicklungs-Workspace umbenennen.
- [ ] Build, Node-Tests, echter Host und neue VSIX samt Inhalt prüfen.
- [ ] GitHub-Repository und origin auf `al-agentura` umbenennen und prüfen.
- [ ] Lokalen Projektordner in `al-agentura` umbenennen und Prüfungen aus dem neuen Pfad ausführen.
- [ ] Benutzer hat die Umbenennung ausdrücklich abgenommen.

Nachweise: `docs/quality/NAMING.md`; bestehende Ticketabnahmen bleiben unverändert.

## Paketübersicht
| Ticket | Thema | Status | Prio | Abhängigkeiten |
|---|---|---|---|---|
| EXT-001 | Extension-Fundament und Entwicklungs-Workspace | Erledigt | P0 | — |
| EXT-002 | Typisiertes Manifest, Profile und Template-Verträge | Erledigt | P0 | EXT-001 |
| EXT-003 | Workspace-Resolver und AL-Projekterkennung | Erledigt | P0 | EXT-001 |
| EXT-004 | Standard-/Modular-AL-Ordnerstruktur und Git-Regeln | Erledigt | P0 | EXT-002, EXT-003 |
| EXT-005 | Neues AL-Projekt inklusive VS-Code-Workspace erstellen | Erledigt | P0 | EXT-003, EXT-004 |
| EXT-006 | AL-app.json und Launch-Konfiguration sicher handhaben | Erledigt | P0 | EXT-003, EXT-005 |
| EXT-007 | Agenten-Dokumentation und Benutzeranleitung als hochwertige Vorlagen | Erledigt | P0 | EXT-002, EXT-004 |
| EXT-008 | Modulindex, Moduldateien und Agenten-Initialisierung für Bestandsprojekte | Erledigt | P1 | EXT-003, EXT-007 |
| EXT-009 | Änderungsplan, Vorschau, Konfliktprüfung und sichere Bestätigung | Erledigt | P0 | EXT-002, EXT-003 |
| EXT-010 | Bestandsprojekt ergänzen ohne AL-Code umzustrukturieren | Erledigt | P0 | EXT-003, EXT-007, EXT-009 |
| EXT-011 | Automatisierte Tests, Security- und Fehlerfall-Matrix | Zur Prüfung | P0 | EXT-004, EXT-006, EXT-009, EXT-010 |
| EXT-012 | VSIX-Paketierung, lokale Installation und Dokumentation | Zur Prüfung | P1 | EXT-011 |
| EXT-013 | Eigene Markdown-Vorlagen importieren und lokal wiederverwenden | Offen | P2 | EXT-002, EXT-009 |
| EXT-014 | AL-Projektcheck und neue Module als optionale Komfortfunktionen | Offen | P2 | EXT-003, EXT-008, EXT-010 |

---

## EXT-001 — Extension-Fundament und Entwicklungs-Workspace

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** Keine

### Beschreibung und Hintergrund
Die Erweiterung braucht eine reproduzierbare TypeScript-/VS-Code-Basis, bevor fachliche Generatorfunktionen implementiert werden. Das bisherige Scaffold registriert nur einen Platzhalterbefehl. Ziel ist ein stabiler lokaler Entwicklungs- und Testzyklus, nicht bereits ein fertiger Projektgenerator.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Bestehende package.json, tsconfig und VS-Code-Launch-/Task-Konfiguration prüfen und korrigieren.
- [x] Extension-Aktivierung, Commands und Logging in kleine Dateien aufteilen; `extension.ts` als Composition Root belassen.
- [x] Fehlermeldungen und Abbruchverhalten für Commands definieren.
- [x] Build, Testskript und lokale VSIX-Paketierung dokumentieren.
- [x] F5-Host und Command-Palette manuell prüfen.

### Akzeptanzkriterien
- [x] `npm run compile` und `npm test` funktionieren in sauber installierter Umgebung.
- [x] F5 startet Extension Development Host und Befehl ist sichtbar.
- [x] Noch nicht implementierte Funktionen werden als solche angezeigt; keine Erfolgsmeldung.

### Tests und Nachweise
- [x] Build: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Extension Host: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] lokale VSIX später: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

### Umsetzungs- und Testnachweis (01.11.2026)
Siehe [EXT-001-Testbericht](docs/quality/EXT-001.md): `npm ci`, Compile, 5 Node-Tests, echter isolierter VS-Code-Host und lokale VSIX erfolgreich. Die Host-Test-Checkbox belegt den automatisierten Lauf; **manuelle F5-/Palette-Prüfung bleibt offen**, ebenso Install-from-VSIX; Benutzerabnahme am 01.11.2026 bestätigt. Geprüfte Launch-/Task-Konfiguration war bereits korrekt. Keine Generatorfunktionen oder weiteren Tickets bearbeitet.

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-002 — Typisiertes Manifest, Profile und Template-Verträge

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-001

### Beschreibung und Hintergrund
Das Projekt soll nicht aus verstreuten Hardcode-Ordnerlisten bestehen. Eine deklarative, versionierte Beschreibung definiert, welche Ordner und Markdown-Dateien ein AL-Profil erzeugt. Spätere eigene Vorlagen müssen ohne Architekturbruch möglich sein.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Typen für `TemplateManifest`, `TemplateEntry`, `ProjectProfile`, `TemplateVariable`, `GenerationPlan` definieren.
- [x] Manifestversion, IDs, relative Zielpfade, Dateitypen, optionale Elemente und Bedingungen spezifizieren.
- [x] Standard-/Modular-Profile als Daten modellieren; Vererbung oder Komposition eindeutig festlegen.
- [x] Eingaben und Platzhalter gegen ungültige Zeichen, unbekannte Tokens, Duplikate und Traversal validieren.
- [x] Versionsmigration und klare Fehlermeldungen bei inkompatiblen Manifesten planen.

### Akzeptanzkriterien
- [x] Manifest wird deterministisch geladen und validiert.
- [x] Ungültige Pfade/IDs/Variablen werden abgelehnt, bevor geschrieben wird.
- [x] Tests belegen Standard- und Modular-Profil.

### Tests und Nachweise
- [x] Unit: valid/invalid manifest: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Duplikate: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Traversal: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

### Umsetzungs- und Testnachweis (01.11.2026)
Typisierte Modelle, Schema-1-Loader, Manifest-/Profilvalidierung und deklarative Standard-/Modular-Profile implementiert. Nachweis: [EXT-002](docs/quality/EXT-002.md). Folgeprüfung mit EXT-003/004: Compile, 35 Node-Tests einschließlich der 19 Manifesttests, echter Extension-Host und VSIX-Inhalt erfolgreich. Benutzerabnahme am 01.11.2026 ausdrücklich bestätigt.

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-003 — Workspace-Resolver und AL-Projekterkennung

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-001

### Beschreibung und Hintergrund
Die Extension muss unterscheiden, ob VS Code ohne Ordner, mit einem leeren Ordner, einem bestehenden AL-Projekt oder mehreren Roots geöffnet ist. Bei vorhandenen Projekten soll sie Fakten erkennen, nicht raten.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Workspace-Folder über VS-Code-API lesen; bei Multi-Root Ziel auswählen.
- [x] Ohne Workspace Zielordner über Dialog auswählen; URI/Remote-Kontext beachten.
- [x] `app.json` sicher lesen, JSON-Fehler verständlich anzeigen, Name/Publisher/ID-Ranges/Runtime/Dependencies extrahieren.
- [x] AL-Dateien und Objektordner erkennen; Projektzustand neu/bestehend/unvollständig bestimmen.
- [x] Projektkontext als typisiertes Objekt an weitere Module liefern.
- [x] Kein automatisch semantisches Interpretieren der Geschäftslogik.

### Akzeptanzkriterien
- [x] Leerer, bestehender, ungültiger und Multi-Root-Fall unterscheidbar.
- [x] Keine falsche Behauptung über Module oder Fachlogik.
- [x] Kein Schreibzugriff während Analyse.

### Tests und Nachweise
- [x] Integration: 4 Workspace-Arten: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] ungültige JSON: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Remote URI: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

### Umsetzungs- und Testnachweis (01.11.2026)
Workspace-Resolver, lesende app.json-/AL-Projekterkennung, typisierter Kontext und Command **AL Agent: Analyze Existing Project** implementiert. Lokale Bestände, No-root-/Single-/Multi-root-Auswahl mit ersetzten Pickern, Abbruch, JSON-Fehler und schreibgeschützter URI-Provider geprüft. Kein echter SSH-Server oder manuell bediente Picker behauptet. [Dateien, Ergebnisse und Grenzen](docs/quality/EXT-003-004.md). Benutzerabnahme am 01.11.2026 ausdrücklich bestätigt.

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-004 — Standard-/Modular-AL-Ordnerstruktur und Git-Regeln

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-002, EXT-003

### Beschreibung und Hintergrund
Die Extension soll die manuelle Anlage typischer AL-Objektordner vermeiden. Für kleine Apps ist ein zentraler `src`-Baum sinnvoll, für größere Apps eine Modulstruktur mit eigenen Objektordnern. Leere Git-Ordner brauchen gezielte Platzhalter.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Konfigurierbare AL-Objekttypen inkl. Codeunits, Pages, PageExtensions, Tables, TableExtensions, Enums, EnumExtensions, Reports, ReportExtensions, Queries, XmlPorts, Interfaces, Permissions, Profiles definieren.
- [x] Modular-Profil erzeugt `src/<Modul>/<Objekttyp>`; Modulnamen validieren und deduplizieren.
- [x] `.gitkeep` nur in bewusst leeren Ordnern, nicht unnötig neben echten Dateien.
- [x] `.gitignore` für `.app`, Symbolpakete, Cache, persönliche Einstellungen und sensible lokale Artefakte projektgerecht definieren; `.vscode` nicht pauschal ignorieren.
- [x] Bei bestehenden Projekten nur fehlende Ordner anbieten; keine AL-Dateien verschieben.

### Akzeptanzkriterien
- [x] Standard- und Modular-Struktur entsprechen Profil.
- [x] Wiederholung erzeugt keine Duplikate.
- [x] Vorhandene Dateien und Git-Regeln werden nicht still überschrieben.

### Tests und Nachweise
- [x] Unit Plan: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Integration idempotent: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Gitignore-Snapshot: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

### Umsetzungs- und Testnachweis (01.11.2026)
Standard-/Modular-Strukturpläne mit Objekttypauswahl, validierten/deduplizierten Modulen, gezielten .gitkeep-Dateien und Gitignore-Empfehlung implementiert. Unit-Pläne, Gitignore-Snapshot und echte Host-Idempotenz für Standard und Modular bestanden; Bestandsdateien bleiben unverändert. Produktive Vorschau/Zustimmung/Dateianwendung folgt mit EXT-009. [Dateien, Ergebnisse und Grenzen](docs/quality/EXT-003-004.md). Benutzerabnahme am 01.11.2026 ausdrücklich bestätigt.

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-005 — Neues AL-Projekt inklusive VS-Code-Workspace erstellen

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-003, EXT-004

### Beschreibung und Hintergrund
Ein Entwickler soll die Extension auch ohne offenen Workspace nutzen können: Projektname und Zielverzeichnis auswählen, wenige AL-spezifische Angaben machen und direkt einen geöffneten Workspace erhalten. Der Assistent ersetzt dabei nicht ungeprüft die offizielle AL-Extension.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Neuprojekt-Wizard mit Zielverzeichnis, Projektname, Profil und optional Modulen definieren.
- [x] Zielordner nur mit Zustimmung erstellen; Namens- und Konfliktprüfung.
- [x] `.code-workspace` mit relativem Projektpfad erstellen und über VS-Code-API öffnen.
- [x] Interaktion mit `AL: Go!` klären: vorhandenes `app.json` übernehmen oder eigene minimal gültige Konfiguration erzeugen, nicht beide unkoordiniert.
- [x] Fehler-/Abbruchfälle so behandeln, dass keine fremden Dateien verändert werden.
- [x] Einstiegsdokumentation und Ergebnisübersicht nach Erstellung anzeigen.

### Akzeptanzkriterien
- [x] Ohne geöffneten Ordner kann ein neuer Workspace vorbereitet werden.
- [x] Workspace-Datei verweist auf korrektes Projektverzeichnis.
- [x] Kein Überschreiben eines vorhandenen Projekts.

### Tests und Nachweise
- [x] ohne Workspace: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] vorhandener Zielordner: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Abbruch: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Workspace öffnen: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

### Umsetzungs- und Testnachweis (01.11.2026)
Neuprojekt-Wizard mit vollständiger Vorschau/Zustimmung, tatsächlicher lokaler Anlage, relativem Workspace, Einstieg und optional inhaltstreuer app.json-Übernahme implementiert. 42 Node-Tests, erweiterter echter Host und VSIX-Inhaltsprüfung erfolgreich. Alle sieben Abbruchstellen, Ziel-/Namenskonflikte, nachträgliche Belegung, reale Symlinks, Quelltreue und Teilfehler geprüft. Workspace-Öffnen als API-Dispatch geprüft; sichtbare Fenster/Picker nicht manuell bedient. Neuanlage nur native lokale file-Ziele: der anfänglich fehlgeschlagene Copy-Fallback-Race-Test führte zur expliziten Provider-Sperre. Ohne app.json-Quelle bleibt die AL-Konfiguration ausstehend; keine erfundenen Versions-/Serverdaten. [Dateien, genaue Ergebnisse und offene Prüfungen](docs/quality/EXT-005.md), [ADR 0003](docs/architecture/adr/0003-new-project-creation.md). Benutzerabnahme am 01.11.2026 ausdrücklich bestätigt.

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-006 — AL-app.json und Launch-Konfiguration sicher handhaben

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-003, EXT-005

### Beschreibung und Hintergrund
Business-Central-Projekte benötigen eine korrekte `app.json`. Falsche IDs, unpassende Versionen oder frei erfundene BC-Serverdaten machen einen Generator unzuverlässig. Deshalb müssen Pflichtangaben bewusst erfasst und bestehende Konfigurationen geschützt werden.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Für neue Projekte erforderliche `app.json`-Felder und valide Defaultwerte gemäß unterstützter AL-Version definieren.
- [x] Publisher, App-ID, Name, Version, Runtime, ID-Ranges und Dependencies konfigurieren bzw. bewusst leer lassen.
- [x] Vorhandene `app.json` ausschließlich lesen/kopieren, nie automatisch ändern; selektive Diffs für Bestandsprojekte bleiben abhängig von EXT-009/010.
- [x] `.vscode/launch.json` als optionales Profil anbieten, keine realen Zugangsdaten eintragen.
- [x] Bei nicht unterstützten Kombinationen Warnung statt stiller Korrektur.

### Akzeptanzkriterien
- [x] Neue Konfiguration ist parsebar und AL-konform für gewähltes Profil.
- [x] Bestehende Konfiguration bleibt unverändert ohne explizite Zustimmung.
- [x] Keine Credentials oder Kundendaten in Vorlagen.

### Tests und Nachweise
- [x] JSON Schema/Fixture: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Konfliktfälle: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] optionale Launch-Datei: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-007 — Agenten-Dokumentation und Benutzeranleitung als hochwertige Vorlagen

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-002, EXT-004

### Beschreibung und Hintergrund
Das zentrale Produktversprechen ist nicht nur Ordneranlage, sondern ein agentenbereiter Projektstart. Die erzeugten MD-Dateien sollen unerfahrenen Entwicklern erklären, wie sie mit einem Coding-Agenten sicher arbeiten, ohne dass die Extension selbst KI benötigt.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Generierte `AGENTS.md` mit verpflichtender Lesereihenfolge, Ticketgrenzen, AL-Regeln, Nicht-Überschreiben und Testpflicht erstellen.
- [x] `TODO.md` mit Ticket-ID, Ziel, Beschreibung, Anforderungen, Akzeptanz, Tests, Status und Beispiel definieren.
- [x] `GETTING_STARTED.md` für Menschen mit Dateiverzeichnis, Startprompt, Ticketbeispiel und Prüfschritten erstellen.
- [x] `docs/PROJECT.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`, `SECURITY.md`, `TESTS.md`, `modules/INDEX.md` als sinnvolle, nicht erfundene Platzhalter erzeugen.
- [x] Konfigurationswerte aus Projektkontext einsetzen, Unbekanntes als `Zu prüfen` markieren.
- [x] Vorlagen mit AL-Fachwissen und vorhandenen Projektmustern gegenprüfen; keine fremden Projektdaten übernehmen.

### Akzeptanzkriterien
- [x] Alle Dateien haben substanziellen, verständlichen Inhalt statt Einzeilern.
- [x] AGENTS verweist auf tatsächliche Dateien; Startprompt funktioniert ohne agentenspezifische Integration.
- [x] Kein erfundener fachlicher Projektinhalt.

### Tests und Nachweise
- [x] Vorlagen-/Inhalts- und Determinismus-Tests: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Platzhalter vollständig: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] manuelle AL-Fachprüfung: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).


### Umsetzung und Prüfnachweis (01.11.2026)
- Neun ausführliche AL-Guidelines-orientierte Vorlagen aus `resources/templates/agent-docs/` werden bei neuen Projekten gebündelt, mit `{{PROJECT_NAME}}` gerendert und im bestätigten Neuprojekt angelegt.
- Validierung verhindert fehlende/zusätzliche Vorlagen, leere Inhalte und unbekannte Platzhalter; kein Zugriff auf externe Agenten oder KI-Dienste.
- Bestehender Projektbefehl `AL Agent: Setup Current Project` ergänzt ausschließlich fehlende Dateien/Ordner nach Analyse, Vorschau und ausdrücklicher Bestätigung; er ersetzt keine vorhandenen Dateien. `AL Agent: Open Project` ermöglicht die direkte Ordneröffnung.
- 48 Node-Tests nach isolierter TypeScript-Transpilierung bestanden, davon drei neue gezielte Template-Tests. **Vollständiges `npm ci`, regulärer `npm run compile`, VS-Code-Host und manuelle Business-Central-Fachprüfung in dieser Umgebung nicht abschließend nachgewiesen** (fehlende npm-Abhängigkeiten/offline). Vor Freigabe lokal ausführen.
- Nicht Bestandteil dieses Tickets: semantische Analyse vorhandener Module, automatisches Übersetzen bestehender Agent-Dateien und komplexe Bestandsprojekt-Migrationen (EXT-008/009/010).

---

Benutzerabnahme: am 01.11.2026 ausdrücklich für EXT-001 bis EXT-007 bestätigt; historische Testnachweise bleiben unverändert.

## EXT-008 — Modulindex, Moduldateien und Agenten-Initialisierung für Bestandsprojekte

**Status:** Erledigt · **Priorität:** P1 · **Abhängigkeiten:** EXT-003, EXT-007

### Beschreibung und Hintergrund
Bei bestehenden AL-Apps können viele Module existieren. Die Extension erkennt Ordner und AL-Objekte, erstellt zuerst eine belastbare Übersicht und überlässt die schrittweise fachliche Interpretation einem separat verwendeten Agenten.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Ordner- und AL-Dateistruktur zu Modulkandidaten aggregieren; Erkennungsquelle ausweisen. Umsetzung: `core/moduleDocumentation.ts`; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] `docs/modules/INDEX.md` mit Modulnamen, Pfaden, erkanntem Status und offenen Fragen erzeugen. Reiner Renderer vorhanden; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Nur für bestätigte/ausgewählte Module MD-Gerüste mit Zweck, Objekten, Datenfluss, Abhängigkeiten, Tests, offenen Fragen erzeugen. Auswahlvalidierter Renderer vorhanden; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Initialisierungsprompt bereitstellen: Agent liest Projekt, verifiziert Modulübersicht, ergänzt fehlende Fakten schrittweise. `AGENT_INITIALIZATION.md` und `docs/GAPS.md` im Renderer; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Nicht bei jedem Start komplette semantische Dokumentation versprechen oder 100 generische Dateien erzeugen. Renderer erzeugt Modulgerüste ausschließlich für bestätigte Auswahl und kennzeichnet Fachfragen offen.

### Akzeptanzkriterien
- [x] Index nennt erkannte Module samt Quellen; unbekannte Fachlogik als offen.
- [x] Bestehende Modul-Dokumentation bleibt erhalten.
- [x] Agent-Prompt beauftragt schrittweises Ergänzen, keine automatische TODO-Abarbeitung.

### Tests und Nachweise
- [x] Fixture modulare App: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] keine Module: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] bestehende MDs: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

### Technischer Nachweis (01.11.2026)
Gemeinsamer ausdrücklicher Auftrag EXT-008–010 technisch umgesetzt. Compile und 78 Node-Tests erfolgreich; echte Bestands-Host-Suite erfolgreich (Bytevergleich, Abbruch, Wiederholung, Konflikte, Stale/Race, Symlinks, Providergrenze und Command). Versionierte Vorlagen und Architekturentscheidung ADR 0005 dokumentiert. Gesamter Hostlauf scheitert weiterhin am zuvor bekannten, unveränderten Neuprojektfehler bei `docs/PROJECT.md`; dieser gehört nicht zu EXT-008–010. Benutzerabnahme der neuen Tickets bleibt offen. Details: [Prüfbericht](docs/quality/EXT-008-010.md).

Benutzerabnahme: am 01.11.2026 mit „okay funktioniert“ bestätigt; historische Testnachweise bleiben erhalten.

## EXT-009 — Änderungsplan, Vorschau, Konfliktprüfung und sichere Bestätigung

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-002, EXT-003

### Beschreibung und Hintergrund
Ein-Klick darf niemals Datenverlust bedeuten. Vor jeder Dateierzeugung muss der Nutzer verstehen, was neu angelegt, übersprungen oder als Konflikt erkannt wird. Eine abbrechbare Vorschau trennt Analyse von Schreiben.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Reinen `GenerationPlan` aus Kontext + Profil + Vorlagen erzeugen. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Pro Operation Ziel-URI, Aktion, Grund, Konfliktstatus und optional Vorschauinhalt ausweisen. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] UI mit Kategorien Neu/Vorhanden/Konflikt/Überspringen implementieren. Writer/UI/Command getrennt implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Default: vorhandene Dateien überspringen; gezielte Änderungen nur mit ausdrücklicher Zustimmung. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Abbruch vor Bestätigung führt zu null Änderungen; Plan nach Zustimmung erneut auf Konflikte prüfen. Writer/UI/Command getrennt implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Teilweise Fehler und veraltete Pläne klar melden. Writer/UI/Command getrennt implementiert; Nachweis: `docs/quality/EXT-008-010.md`.

### Akzeptanzkriterien
- [x] Abbruch erzeugt keine Datei.
- [x] Kein vorhandener Inhalt wird still ersetzt.
- [x] Wiederholter Plan ist deterministisch und nachvollziehbar.

### Tests und Nachweise
- [x] Unit Plan: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Integration Abbruch: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Race/Conflict: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

### Technischer Nachweis (01.11.2026)
Gemeinsamer ausdrücklicher Auftrag EXT-008–010 technisch umgesetzt. Compile und 78 Node-Tests erfolgreich; echte Bestands-Host-Suite erfolgreich (Bytevergleich, Abbruch, Wiederholung, Konflikte, Stale/Race, Symlinks, Providergrenze und Command). Versionierte Vorlagen und Architekturentscheidung ADR 0005 dokumentiert. Gesamter Hostlauf scheitert weiterhin am zuvor bekannten, unveränderten Neuprojektfehler bei `docs/PROJECT.md`; dieser gehört nicht zu EXT-008–010. Benutzerabnahme der neuen Tickets bleibt offen. Details: [Prüfbericht](docs/quality/EXT-008-010.md).

Benutzerabnahme: am 01.11.2026 mit „okay funktioniert“ bestätigt; historische Testnachweise bleiben erhalten.

## EXT-010 — Bestandsprojekt ergänzen ohne AL-Code umzustrukturieren

**Status:** Erledigt · **Priorität:** P0 · **Abhängigkeiten:** EXT-003, EXT-007, EXT-009

### Beschreibung und Hintergrund
Bestehende BC-Apps sind oft unvollständig dokumentiert, aber funktionierend. Die Extension soll fehlende Git-/Agenten-/Dokumentationsdateien ergänzen, ohne bestehende Architektur, AL-Code oder persönliche Konfiguration zu beschädigen.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] `app.json` und vorhandene Ordner/Markdown-Dateien erfassen. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Fehlende Standard-/Modul-Dateien planen, bestehende MD-Inhalte nicht normalisieren. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Vorhandene Namenskonventionen und Modulstruktur respektieren; keine automatische Verschiebung. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Konflikte bei `.gitignore`, `AGENTS.md`, `TODO.md` nur anzeigen; optional später Merge-Strategie. Reiner Bestandsplan/URI-Adapter implementiert; Nachweis: `docs/quality/EXT-008-010.md`.
- [x] Zweiten Durchlauf ohne Duplikate/Überschreibung testen. Unit-Projektion und echter Host mit Bytevergleich erfolgreich; 76 Node-Tests und erste echte Bestands-Host-Suite bestanden.
- [x] Ergebnis mit erstellten, übersprungenen und offenen Punkten ausgeben. Writer/UI/Command getrennt implementiert; Nachweis: `docs/quality/EXT-008-010.md`.

### Akzeptanzkriterien
- [x] Bestehende `.al`-Dateien sind byte-identisch.
- [x] Bestehende MDs bleiben unverändert.
- [x] Fehlende Dateien werden nur nach Bestätigung ergänzt.

### Tests und Nachweise
- [x] Fixture bestehendes Projekt: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Bytevergleich: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Idempotenz: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [x] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

### Technischer Nachweis (01.11.2026)
Gemeinsamer ausdrücklicher Auftrag EXT-008–010 technisch umgesetzt. Compile und 78 Node-Tests erfolgreich; echte Bestands-Host-Suite erfolgreich (Bytevergleich, Abbruch, Wiederholung, Konflikte, Stale/Race, Symlinks, Providergrenze und Command). Versionierte Vorlagen und Architekturentscheidung ADR 0005 dokumentiert. Gesamter Hostlauf scheitert weiterhin am zuvor bekannten, unveränderten Neuprojektfehler bei `docs/PROJECT.md`; dieser gehört nicht zu EXT-008–010. Benutzerabnahme der neuen Tickets bleibt offen. Details: [Prüfbericht](docs/quality/EXT-008-010.md).

Benutzerabnahme: am 01.11.2026 mit „okay funktioniert“ bestätigt; historische Testnachweise bleiben erhalten.

## EXT-011 — Automatisierte Tests, Security- und Fehlerfall-Matrix

**Status:** Zur Prüfung · **Priorität:** P0 · **Abhängigkeiten:** EXT-004, EXT-006, EXT-009, EXT-010

### Beschreibung und Hintergrund
Ein Generator muss zuverlässiger sein als ein großer manueller Prompt. Die wichtigsten Risiken sind Datenverlust, falsche Pfade, defekte Konfiguration und irreführende Erfolgsmeldungen. Qualität ist deshalb eine eigenständige Umsetzungseinheit.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Unit-Tests für Manifest, Pfade, Variablen, Profile, Plan, Template-Rendering und Status schreiben.
- [x] Integrationstests mit VS-Code-Host und Test-Workspaces vorbereiten.
- [x] Leerer, modularer, bestehender, ungültiger, schreibgeschützter und Multi-Root-Fall abdecken.
- [x] Traversal, absolute Pfade, problematische Modulnamen, Symlinks und untrusted Workspace testen.
- [x] Testbericht mit tatsächlichen Ergebnissen, nicht nur Checkboxes erstellen.
- [x] Manuelle macOS-/Windows-/VSIX-Abnahme definieren.

### Akzeptanzkriterien
- [x] Kritische Negativfälle automatisiert abgedeckt.
- [x] Build/Test-Ergebnisse dokumentiert.
- [x] Keine Behauptung einer Produktfreigabe ohne manuelle Abnahme.

### Tests und Nachweise
- [x] Unit: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Integration: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Security: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] manuell: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren. Nicht als durchgeführt markiert; sichtbare Plattform-/Microsoft-Abnahme gemäß `docs/operations/MARKETPLACE.md` offen.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

### V1-Abschlussnachweis (02.11.2026)
Technisch umgesetzt und Zur Prüfung: 86/86 Node-Tests, kompletter `verify` auf VS Code 1.90.2 und 1.142.0, echter Restricted Mode, Audit mit 0 bekannten Schwachstellen, isolierte Installation des tatsächlichen VSIX und strikter Release-Check erfolgreich. Früherer docs-Elternfehler behoben; alte Build-Commands werden nicht mitgeliefert. Version 1.0.0, Publisher SamerDadah, MIT vom Benutzer festgelegt. Paket-SHA und Testmatrix: [EXT-011](docs/quality/EXT-011.md). Visuelle Windows-/Microsoft-Abnahme und Benutzerfreigabe bleiben offen. Keine Veröffentlichung oder Git-Aktionen.

## EXT-012 — VSIX-Paketierung, lokale Installation und Dokumentation

**Status:** Zur Prüfung · **Priorität:** P1 · **Abhängigkeiten:** EXT-011

### Beschreibung und Hintergrund
Die Extension soll vor einer Marketplace-Veröffentlichung wie eine normale Erweiterung lokal testbar sein. Das Paket darf keine unnötigen Entwicklungsdateien oder vertraulichen Informationen enthalten.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] `@vscode/vsce`, `.vscodeignore`, Publisher-Platzhalter und Extension-Metadaten prüfen. Vorhandener V1-Vertrag bestätigt: vsce 4.1.0, SamerDadah, MIT, Version 1.0.0; keine zusätzlichen Runtime-Abhängigkeiten.
- [x] VSIX gebaut und native ZIP-Inhaltsprüfung bestanden: 69 kontrollierte Einträge, alle Runtime-/Vorlagendateien, Lizenz, Logo und drei Screenshots bytegleich. Testprofile/Entwicklungstools ausgeschlossen; finale SHA im EXT-012-Bericht.
- [x] Normale VSIX-Installation in frischem Profil sichtbar geprüft: Logo/Publisher/Version, Command Palette, Standard-Neugerüst mit relativem Workspace, Bestands-Setup und Wiederholung (0 neue Einträge). Finale Paketinstallation zusätzlich im Host-Gate; siehe `docs/quality/EXT-012.md`.
- [x] README mit drei echten Demo-Screenshots, VSIX-Installation, Bedienung und Troubleshooting ergänzt; Bilder unter `assets/screenshots/`. HTTPS-Bilder vor Upload öffentlich bereitstellen (siehe EXT-012-Nachweis).
- [x] Marketplace-Publikation ausdrücklich nicht als Teil dieses Tickets durchführen. Kein Publish-Befehl, keine Zugangsdaten, keine Git-Aktionen.

### Akzeptanzkriterien
- [x] VSIX lokal installierbar und aktivierbar.
- [x] Alle benötigten Templates im Paket.
- [x] Kein automatisches Publishing.

### Tests und Nachweise

02.11.2026, macOS arm64: `npm run verify` mit VS Code 1.144.0 und 1.90.2 bestanden (Compile, 89/89 Node-Tests, Audit ohne bekannte Schwachstellen, vier reale Host-/Installations-Suites, Paket-/Release-Check). Finales VSIX erneut mit 1.144.0 installiert, unveränderte SHA bestätigt. Sichtbarer Demo-Smoke und drei Screenshots dokumentiert in [EXT-012](docs/quality/EXT-012.md). Windows-/Microsoft-Assistenten-/Marketplace-Abnahme bleibt separat offen.

- [x] VSIX-Paketinhalt: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Clean Install: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Smoke: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-013 — Eigene Markdown-Vorlagen importieren und lokal wiederverwenden

**Status:** Offen · **Priorität:** P2 · **Abhängigkeiten:** EXT-002, EXT-009

### Beschreibung und Hintergrund
Ein erfahrener Entwickler soll seine bewährten Markdown-Dateien unverändert als benanntes Template-Paket speichern und später manuell auf Projekte anwenden. Diese Funktion ist nach MVP vorgesehen, darf aber architektonisch nicht verbaut werden.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Wizard: Paketname, Dateien auswählen, Zielpfade und optionale Kategorien zuordnen.
- [ ] Originalinhalte unverändert speichern; nur Metadaten im Manifest führen.
- [ ] Lokale Bibliothek über VS-Code-Storage/konfigurierten Ordner entwerfen; kein Server.
- [ ] Aus Liste Paket auswählen und mit Vorschau manuell anwenden.
- [ ] Kollisionen und unzulässige Pfade erkennen; keine fremden Scripts ausführen.
- [ ] Später optional Projekt als Vorlage ableiten, aber nicht Teil dieses Tickets.

### Akzeptanzkriterien
- [ ] Importierte Dateien bleiben byte-/inhaltstreu.
- [ ] Pakete lassen sich benennen, speichern, auswählen und konfliktfrei anwenden.
- [ ] Kein automatisches Anwenden beim Speichern.

### Tests und Nachweise
- [ ] Roundtrip: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Pfadschutz: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Konflikte: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-014 — AL-Projektcheck und neue Module als optionale Komfortfunktionen

**Status:** Offen · **Priorität:** P2 · **Abhängigkeiten:** EXT-003, EXT-008, EXT-010

### Beschreibung und Hintergrund
Nach dem ersten Setup kann die Extension als leichtgewichtiger Projektassistent fehlende Dokumentation und Strukturabweichungen melden. Sie ersetzt keinen AL-Compiler und führt keine tiefgehende fachliche Analyse ohne KI aus.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Projektcheck für fehlende MDs, fehlende Objektordner, `app.json`-Probleme und Modulindex anbieten.
- [ ] AL-Objekt-IDs nur soweit zuverlässig statisch erkennbar auswerten; Unsicherheiten ausweisen.
- [ ] Befehl `New AL Module`: Name validieren, passende Ordner und Modul-MD planen, Vorschau.
- [ ] Check-Bericht ohne automatische Reparatur erstellen; Reparatur separat bestätigen.
- [ ] Performance bei großen Repositories und Ausnahmen/Ignore-Patterns testen.

### Akzeptanzkriterien
- [ ] Check meldet belegbare Fakten und Unsicherheiten.
- [ ] Neues Modul wird nur nach Vorschau erstellt.
- [ ] Keine AL-Dateien automatisch umorganisiert.

### Tests und Nachweise
- [ ] großes Repository: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Objekt-ID-Parser: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Modul-Erstellung: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## Microsoft-Projektintegration – Teststand (01.11.2026)
- Ein gemeinsamer Einstiegspunkt `AL Agent: Create Project` bietet mit installierter AL Language **Standard**, **Modular**, **BC AI Agent** sowie den bisherigen unabhängigen Generator an.
- Microsoft-Befehl wird zur Laufzeit aus dem Manifest der installierten Erweiterung ermittelt, nicht hart codiert.
- Nach Microsofts Projekterstellung ergänzt Agentura automatisch fehlende Struktur und MDs sowie einen relativen Workspace und öffnet diesen ohne weitere Rückfrage. BC AI Agent erhält MDs und Workspace unter Beibehaltung seiner Struktur.
- Ohne AL Language wird nur ein Gerüst angelegt; keine `app.json`, `launch.json` oder `.alpackages` generiert.
- Aktueller Korrekturstand: regulärer Compile und 63 Node-Tests erfolgreich; gezielter echter Microsoft-Abschluss-Host erfolgreich. Vollständiger Host scheitert im unveränderten unabhängigen Generator (fehlender docs-Elternordner).
- **Noch zu testen:** Reale Microsoft-Command-IDs pro AL-Version, neue Host-Fenster mit geteiltem `globalState`, ggf. Verzögerung beim Erzeugen von `app.json`, Nutzerabbruch, tatsächliche Agent-Vorlage.
- Details und Testschritte: `docs/quality/MICROSOFT-AL-WORKFLOW.md`.


## Create-Project-Korrektur und Logo — ausdrücklicher Nutzerauftrag (01.11.2026)
**Status:** Zur Prüfung · Nur Microsoft-Create-Project-Ablauf und Paketlogo; keine weiteren Tickets, keine Git-Aktionen.
- [x] Automatische Ergänzung ohne nachträgliche Dialoge implementiert; Module vor Microsoft erfasst. Neuer begrenzter Writer mit Skip, nativer Copy ohne Überschreiben und transparenter Teilfehlermeldung.
- [x] Relative `.code-workspace` im Microsoft-Projekt erzeugen und automatisch im selben Fenster öffnen; vorhandene Workspace-Datei bewahren und Projektbezug prüfen.
- [x] Gemeinsame Ereignissperre und exklusive persistente Claim-Datei im Extension-Speicher gegen doppelte Ausführung implementiert; App-JSON-Änderungen und Polling berücksichtigen verzögerte Erstellung.
- [x] Vorhandenes `assets/Logo.png` als Extension-Icon im Manifest verknüpft.
- [x] Compile, 63 Node-Tests, gezielten echten Host und VSIX-Logo erfolgreich geprüft; vollständigen Host ausgeführt und bestehenden Fehler im unabhängigen Generator dokumentiert. Microsoft-Assistent und sichtbare Installation noch manuell zu prüfen.
- [ ] Benutzerabnahme (noch offen).

Implementierungsnachweis: `src/commands/microsoftProjectFlow.ts`, `src/generation/completeMicrosoftProject.ts`, `package.json`. Ergebnisse und offene Prüfungen: `docs/quality/MICROSOFT-AL-WORKFLOW.md`; Architekturentscheidung: ADR 0004. Technische Umsetzung und Tests sind keine Benutzerfreigabe.


### Nachbesserung nach fehlgeschlagenem Standard-Durchlauf
**Status:** Zur Prüfung · Benutzerfehler reproduziert, keine Git-Aktionen.
- [x] Echter Aktivierungskontext im isolierten Host geprüft: `globalStorageUri.scheme === 'vscode-userdata'`. Vorheriger Code verweigerte diese lokale Speicher-URI vor jedem Projektzugriff; Regressionstest scheiterte nachweislich mit „Ungültiger Fortsetzungsspeicher“.
- [x] Lokalen `vscode-userdata`-Speicher für die exklusive Sperre unterstützen; fremde Schemes/Authorities bleiben ausgeschlossen. Speicherfehler enthalten kontrollierte Ursachen, die Fortsetzungsfehlermeldung nennt den betroffenen Schritt.
- [x] Compile und 64 Node-Tests erfolgreich; gezielter echter Host inklusive realem `vscode-userdata`-Kontext, doppelter Sperre, unzulässigen Speicher-URIs und blockierten Speicherverzeichnissen erfolgreich. VSIX neu gebaut und Inhalt geprüft.
- [ ] Benutzerprüfung mit Microsoft Standard AL; keine Abnahme behauptet.


## Gemeinsamer Auftrag EXT-008 bis EXT-010 (01.11.2026)
**Bestand:** Struktur-/Metadatenanalyse und reiner Strukturplan implementiert; Modulindex nur statische Vorlage. Bestehender Setup-Command teilweise implementiert, schreibt noch selbst und prüft keinen vollständig erneuerten Plan.
**Ziel/Dateien:** Modulbelege und Dokumente in `core/`, reiner Ergänzungsplan, URI-Adapter und sicherer Writer in `generation/`, Vorschau in `ui/`, Setup-Command nur Orchestrierung; Tests und relevante Dokumente ergänzen.
**Risiken/Testplan:** vorhandene AL-/MD-/Konfigurationsdateien bytegleich halten; Konflikte, Pfade/Symlinks, veraltete Pläne, Abbruch, Teilfehler, Wiederholung und parallele Aufrufe mit Unit- und echten Host-Tests prüfen. Keine Git-Aktionen. Microsoft-Neuprojektablauf bleibt unverändert.

Nachweisfortschritt EXT-008–010: erste 76 Node-Tests und echte Bestands-Host-Suite bestanden (Modulbelege, Auswahl, reiner Plan, Abbruch, Bestandsschutz, Wiederholung, Stale/Race, Symlink, Providergrenze, Command und Doppelklick). Zusätzlicher `docs/modules/DISCOVERY.md` bewahrt erkannte Modulbelege neben einem vorhandenen, unveränderten Index; Abschlussprüfungen folgen.

Abschluss EXT-008–010: Bestandsplan, Writer, Inhaltsvorschau und Modulbelege implementiert; regulärer Compile, 78 Node-Tests und gezielter Bestands-Host erfolgreich. Ergänzende Microsoft-Suite und neue VSIX werden im Prüfbericht separat nachgewiesen. Keine weiteren Tickets umgesetzt; keine Git-Aktionen.

Abschlussnachweis: ergänzende echte Microsoft-Host-Suite erfolgreich; `npm run package` erfolgreich; neuer Bestands-Command, Planer/Writer/UI, sämtliche Bestandsvorlagen und Logo bytegleich im VSIX geprüft. Neue Tickets EXT-008 bis EXT-010 bleiben Zur Prüfung; Benutzerabnahme offen. EXT-001 bis EXT-007 sind Erledigt. [Vollständiger Bericht und kurze Bedienprüfung](docs/quality/EXT-008-010.md).


## EXT-011 — zusätzlicher ausdrücklicher V1-/Marketplace-Auftrag
**Bestand:** 78 Node-Tests, echte Host-Suites und lokale VSIX vorhanden. Gesamthost scheitert bisher an fehlenden Elternordnern der generierten Dokumente. Manifest hat 0.0.1 / local-development; Lizenz, Changelog, Release-Gate und Untrusted-Host-Prüfung fehlen.
**Ziel/Dateien/Risiken:** reproduzierbare vollständige Test-/Security-Matrix, notwendige Generatorfehler beheben, V1-Metadaten/README/Release-Artefakte ergänzen, Paketinhalt und saubere VSIX-Installation prüfen. Publisher-ID und Lizenz werden ausdrücklich abgefragt, nicht erfunden. Lokale Dateien und Git unverändert schützen; keine Veröffentlichung.
**Testplan:** Compile, Node-Tests, voller Host, Restricted-Mode-Host, isolierte Installation des tatsächlichen VSIX und automatischer Release-/Paketcheck; manuelle macOS-/Windows-/Microsoft-Abnahme gesondert.
- [x] V1-Blocker fehlender docs-/Launch-Elternordner mit Regressionstests beheben. Reiner Plan ergänzt Eltern vor Dateien; vollständiger Host erstmals erfolgreich.
- [x] Untrusted Workspace: externe Microsoft-Ausführung blockieren, datenbasierte Funktionen testen. Echter Restricted-Mode-Host mit `isTrusted === false` erfolgreich; keine AL-Aktivierung, lokale Textgenerierung funktioniert.
- [x] Version 1.0.0, MIT-Lizenz und Publisher `SamerDadah` nach ausdrücklicher Benutzerangabe, öffentliche README und Changelog vorbereitet.
- [x] Wiederholbaren Release-Check, Paketprüfung und isolierten Installationsnachweis ergänzen. Nachweise und offene manuelle Schritte: `docs/quality/EXT-011.md`.
- [x] CI und konkrete manuelle Release-Abnahme dokumentieren; keine Veröffentlichung. Nachweise und offene manuelle Schritte: `docs/quality/EXT-011.md`.

EXT-011-Abhängigkeitsprüfung: vorhandenes Buildwerkzeug vsce auf 4.1.0 aktualisiert; gezieltes `@vscode/vsce`-Override auf minimatch 11.0.1 schließt GHSA-g3hv-75wg-m249. Keine Runtime-Abhängigkeit hinzugefügt. Nach Installation meldet npm audit 0 bekannte Schwachstellen; Release-Lauf prüft Audit erneut.

V1-Abschluss 02.11.2026: technische Gates vollständig erfolgreich, Paket `al-agentura-1.0.0.vsix` erstellt und installiert geprüft. CI vorbereitet, nicht ausgeführt. Echte visuelle/Windows-/Microsoft-Abnahme und Benutzerfreigabe vor Marketplace-Upload bleiben offen.


## Auftrag EXT-012 (02.11.2026)
**Bestand:** Paketierung, Metadaten, Lizenz, ZIP-Prüfung und automatisierter Clean-Install aus EXT-011 implementiert und nachgewiesen. README enthält Bedienung, aber keine echten Screenshots und nur allgemeine Fehlerhinweise.
**Ziel/Dateien:** reproduzierbare Paket-/Clean-Install-Abnahme, tatsächliche UI-Bilder aus einem isolierten Profil, konkrete Installations-/Fehleranleitung, README und Paketprüfung für mitgelieferte Dokumentationsbilder ergänzen. Kein Produktumbau, keine Veröffentlichung, keine Git-Aktionen.
**Risiken/Testplan:** ausschließlich eigene Demo-Projekte; keine persönlichen Fenster/Projektinhalte aufnehmen. Bildlinks und Paketressourcen prüfen, vollständiger Build-/Test-/Installationslauf auf aktuellem und minimal unterstütztem VS Code. Manuelle Windows-/Marketplace-Abnahme getrennt halten. UI-Skill erfordert normalerweise node_repl; Tool fehlt. Nutzer hat alternative macOS-Werkzeuge ausdrücklich erlaubt. Eigener Electron-Renderer lieferte echte Screenshots; OS-Rechte blieben unverändert.


Abschluss EXT-012: technisch Zur Prüfung. Wiederholbarer isolierter VSIX-Smoke, drei reale Screenshots, README-Installation/Fehlerhilfe und Bild-Paketprüfung ergänzt. 89 Node-Tests, vollständige Gates auf VS Code 1.144.0 und 1.90.2 sowie erneute Installation desselben finalen Pakets unter 1.144.0 erfolgreich. Finale SHA und Grenzen: [EXT-012-Nachweis](docs/quality/EXT-012.md). Öffentliche Bild-URLs und verbleibende Plattform-/Microsoft-Abnahme vor Veröffentlichung prüfen; Nutzerabnahme offen. Keine Git-Aktionen, keine Publikation, keine weiteren Tickets bearbeitet.

## EXT-012 — Upload-Korrektur Icon (02.11.2026)
Bestand: aktuelles Benutzerlogo noch 1254 × 1254 Pixel; Marketplace meldet maximal 1024 × 1024. Manifest/Lockfile wurden zwischenzeitlich vom Benutzer auf 1.0.1 gesetzt; diese Version bleibt erhalten. Ziel: proportional verkleinertes Original, Paket-Abmessungsprüfung mit Grenz-/Negativtests, neues VSIX und echte Installation. Keine Produktfunktionen, Git-Aktionen oder Veröffentlichung.
- [x] Logo nach ausdrücklicher Zustimmung mit macOS `sips` auf 1024 × 1024 verkleinert.
- [x] Paketprüfung für PNG-IHDR und maximal 1024 Pixel je Achse samt Grenz-/Negativtests ergänzt; V1-Versionstest akzeptiert die vorhandene Patchversion 1.0.1. Changelog, Quality-Modul und Upload-Anleitung aktualisiert.
- [x] Compile, 90/90 Node-Tests, Audit (0 bekannte Schwachstellen), alle Host-Suites und echte VSIX-Installation mit VS Code 1.144.0 bestanden; finaler Paket-/Release-Check erfolgreich. Version 1.0.1, Icon 1024 × 1024, SHA `197286709f01588c64efbfad58a5662aab31ac13c886043190575beb2b4659e3`. Nach Aktualisierung der README wurden veraltete Testnachweise gezielt erneuert. Technisch Zur Prüfung; Upload-Annahme/Benutzerabnahme offen.
- [ ] Benutzerabnahme der Upload-Korrektur.
