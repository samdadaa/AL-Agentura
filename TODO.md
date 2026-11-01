# Master TODO — AL-extension

**Stand:** 01.11.2026 · **Umsetzung:** EXT-001 technisch umgesetzt und zur Prüfung; Generatorfunktionen **nicht implementiert**. Die folgenden Tickets sind spezifizierte Arbeitsaufträge, keine abgeschlossenen Features.

## Verbindliche Arbeitsregeln
- Vor Ticketbeginn `AGENTS.md`, `KONZEPT.md`, relevante Module, Architektur und Teststrategie lesen.
- **Ein Ticket pro Agentenauftrag**; keine eigenständige Umsetzung der gesamten Roadmap.
- Status: `Offen` → `In Arbeit` → `Zur Prüfung` → `Erledigt`; `Blockiert` bei offenen Voraussetzungen.
- `Zur Prüfung` heißt Code umgesetzt und dokumentiert, **nicht** automatisch getestet oder vom Nutzer abgenommen.
- `Erledigt` nur nach Nutzerabnahme. Teststatus gesondert dokumentieren.
- P0 = MVP-kritisch, P1 = wichtig, P2 = nach MVP.
- Vorhandene Daten, AL-Dateien und MD-Dateien nicht stillschweigend verändern.

## Paketübersicht
| Ticket | Thema | Prio | Abhängigkeiten |
|---|---|---|---|
| EXT-001 | Extension-Fundament und Entwicklungs-Workspace | P0 | — |
| EXT-002 | Typisiertes Manifest, Profile und Template-Verträge | P0 | EXT-001 |
| EXT-003 | Workspace-Resolver und AL-Projekterkennung | P0 | EXT-001 |
| EXT-004 | Standard-/Modular-AL-Ordnerstruktur und Git-Regeln | P0 | EXT-002, EXT-003 |
| EXT-005 | Neues AL-Projekt inklusive VS-Code-Workspace erstellen | P0 | EXT-003, EXT-004 |
| EXT-006 | AL-app.json und Launch-Konfiguration sicher handhaben | P0 | EXT-003, EXT-005 |
| EXT-007 | Agenten-Dokumentation und Benutzeranleitung als hochwertige Vorlagen | P0 | EXT-002, EXT-004 |
| EXT-008 | Modulindex, Moduldateien und Agenten-Initialisierung für Bestandsprojekte | P1 | EXT-003, EXT-007 |
| EXT-009 | Änderungsplan, Vorschau, Konfliktprüfung und sichere Bestätigung | P0 | EXT-002, EXT-003 |
| EXT-010 | Bestandsprojekt ergänzen ohne AL-Code umzustrukturieren | P0 | EXT-003, EXT-007, EXT-009 |
| EXT-011 | Automatisierte Tests, Security- und Fehlerfall-Matrix | P0 | EXT-004, EXT-006, EXT-009, EXT-010 |
| EXT-012 | VSIX-Paketierung, lokale Installation und Dokumentation | P1 | EXT-011 |
| EXT-013 | Eigene Markdown-Vorlagen importieren und lokal wiederverwenden | P2 | EXT-002, EXT-009 |
| EXT-014 | AL-Projektcheck und neue Module als optionale Komfortfunktionen | P2 | EXT-003, EXT-008, EXT-010 |

---

## EXT-001 — Extension-Fundament und Entwicklungs-Workspace

**Status:** Zur Prüfung · **Priorität:** P0 · **Abhängigkeiten:** Keine

### Beschreibung und Hintergrund
Die Erweiterung braucht eine reproduzierbare TypeScript-/VS-Code-Basis, bevor fachliche Generatorfunktionen implementiert werden. Das bisherige Scaffold registriert nur einen Platzhalterbefehl. Ziel ist ein stabiler lokaler Entwicklungs- und Testzyklus, nicht bereits ein fertiger Projektgenerator.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [x] Bestehende package.json, tsconfig und VS-Code-Launch-/Task-Konfiguration prüfen und korrigieren.
- [x] Extension-Aktivierung, Commands und Logging in kleine Dateien aufteilen; `extension.ts` als Composition Root belassen.
- [x] Fehlermeldungen und Abbruchverhalten für Commands definieren.
- [x] Build, Testskript und lokale VSIX-Paketierung dokumentieren.
- [ ] F5-Host und Command-Palette manuell prüfen.

### Akzeptanzkriterien
- [x] `npm run compile` und `npm test` funktionieren in sauber installierter Umgebung.
- [ ] F5 startet Extension Development Host und Befehl ist sichtbar.
- [x] Noch nicht implementierte Funktionen werden als solche angezeigt; keine Erfolgsmeldung.

### Tests und Nachweise
- [x] Build: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] Extension Host: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [x] lokale VSIX später: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [x] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [x] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

### Umsetzungs- und Testnachweis (01.11.2026)
Siehe [EXT-001-Testbericht](docs/quality/EXT-001.md): `npm ci`, Compile, 5 Node-Tests, echter isolierter VS-Code-Host und lokale VSIX erfolgreich. Die Host-Test-Checkbox belegt den automatisierten Lauf; **manuelle F5-/Palette-Prüfung bleibt offen**, ebenso Install-from-VSIX und Benutzerabnahme. Geprüfte Launch-/Task-Konfiguration war bereits korrekt. Keine Generatorfunktionen oder weiteren Tickets bearbeitet.

---

## EXT-002 — Typisiertes Manifest, Profile und Template-Verträge

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-001

### Beschreibung und Hintergrund
Das Projekt soll nicht aus verstreuten Hardcode-Ordnerlisten bestehen. Eine deklarative, versionierte Beschreibung definiert, welche Ordner und Markdown-Dateien ein AL-Profil erzeugt. Spätere eigene Vorlagen müssen ohne Architekturbruch möglich sein.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Typen für `TemplateManifest`, `TemplateEntry`, `ProjectProfile`, `TemplateVariable`, `GenerationPlan` definieren.
- [ ] Manifestversion, IDs, relative Zielpfade, Dateitypen, optionale Elemente und Bedingungen spezifizieren.
- [ ] Standard-/Modular-Profile als Daten modellieren; Vererbung oder Komposition eindeutig festlegen.
- [ ] Eingaben und Platzhalter gegen ungültige Zeichen, unbekannte Tokens, Duplikate und Traversal validieren.
- [ ] Versionsmigration und klare Fehlermeldungen bei inkompatiblen Manifesten planen.

### Akzeptanzkriterien
- [ ] Manifest wird deterministisch geladen und validiert.
- [ ] Ungültige Pfade/IDs/Variablen werden abgelehnt, bevor geschrieben wird.
- [ ] Tests belegen Standard- und Modular-Profil.

### Tests und Nachweise
- [ ] Unit: valid/invalid manifest: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Duplikate: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Traversal: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-003 — Workspace-Resolver und AL-Projekterkennung

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-001

### Beschreibung und Hintergrund
Die Extension muss unterscheiden, ob VS Code ohne Ordner, mit einem leeren Ordner, einem bestehenden AL-Projekt oder mehreren Roots geöffnet ist. Bei vorhandenen Projekten soll sie Fakten erkennen, nicht raten.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Workspace-Folder über VS-Code-API lesen; bei Multi-Root Ziel auswählen.
- [ ] Ohne Workspace Zielordner über Dialog auswählen; URI/Remote-Kontext beachten.
- [ ] `app.json` sicher lesen, JSON-Fehler verständlich anzeigen, Name/Publisher/ID-Ranges/Runtime/Dependencies extrahieren.
- [ ] AL-Dateien und Objektordner erkennen; Projektzustand neu/bestehend/unvollständig bestimmen.
- [ ] Projektkontext als typisiertes Objekt an weitere Module liefern.
- [ ] Kein automatisch semantisches Interpretieren der Geschäftslogik.

### Akzeptanzkriterien
- [ ] Leerer, bestehender, ungültiger und Multi-Root-Fall unterscheidbar.
- [ ] Keine falsche Behauptung über Module oder Fachlogik.
- [ ] Kein Schreibzugriff während Analyse.

### Tests und Nachweise
- [ ] Integration: 4 Workspace-Arten: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] ungültige JSON: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Remote URI: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-004 — Standard-/Modular-AL-Ordnerstruktur und Git-Regeln

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-002, EXT-003

### Beschreibung und Hintergrund
Die Extension soll die manuelle Anlage typischer AL-Objektordner vermeiden. Für kleine Apps ist ein zentraler `src`-Baum sinnvoll, für größere Apps eine Modulstruktur mit eigenen Objektordnern. Leere Git-Ordner brauchen gezielte Platzhalter.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Konfigurierbare AL-Objekttypen inkl. Codeunits, Pages, PageExtensions, Tables, TableExtensions, Enums, EnumExtensions, Reports, ReportExtensions, Queries, XmlPorts, Interfaces, Permissions, Profiles definieren.
- [ ] Modular-Profil erzeugt `src/<Modul>/<Objekttyp>`; Modulnamen validieren und deduplizieren.
- [ ] `.gitkeep` nur in bewusst leeren Ordnern, nicht unnötig neben echten Dateien.
- [ ] `.gitignore` für `.app`, Symbolpakete, Cache, persönliche Einstellungen und sensible lokale Artefakte projektgerecht definieren; `.vscode` nicht pauschal ignorieren.
- [ ] Bei bestehenden Projekten nur fehlende Ordner anbieten; keine AL-Dateien verschieben.

### Akzeptanzkriterien
- [ ] Standard- und Modular-Struktur entsprechen Profil.
- [ ] Wiederholung erzeugt keine Duplikate.
- [ ] Vorhandene Dateien und Git-Regeln werden nicht still überschrieben.

### Tests und Nachweise
- [ ] Unit Plan: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Integration idempotent: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Gitignore-Snapshot: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-005 — Neues AL-Projekt inklusive VS-Code-Workspace erstellen

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-003, EXT-004

### Beschreibung und Hintergrund
Ein Entwickler soll die Extension auch ohne offenen Workspace nutzen können: Projektname und Zielverzeichnis auswählen, wenige AL-spezifische Angaben machen und direkt einen geöffneten Workspace erhalten. Der Assistent ersetzt dabei nicht ungeprüft die offizielle AL-Extension.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Neuprojekt-Wizard mit Zielverzeichnis, Projektname, Profil und optional Modulen definieren.
- [ ] Zielordner nur mit Zustimmung erstellen; Namens- und Konfliktprüfung.
- [ ] `.code-workspace` mit relativem Projektpfad erstellen und über VS-Code-API öffnen.
- [ ] Interaktion mit `AL: Go!` klären: vorhandenes `app.json` übernehmen oder eigene minimal gültige Konfiguration erzeugen, nicht beide unkoordiniert.
- [ ] Fehler-/Abbruchfälle so behandeln, dass keine fremden Dateien verändert werden.
- [ ] Einstiegsdokumentation und Ergebnisübersicht nach Erstellung anzeigen.

### Akzeptanzkriterien
- [ ] Ohne geöffneten Ordner kann ein neuer Workspace vorbereitet werden.
- [ ] Workspace-Datei verweist auf korrektes Projektverzeichnis.
- [ ] Kein Überschreiben eines vorhandenen Projekts.

### Tests und Nachweise
- [ ] ohne Workspace: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] vorhandener Zielordner: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Abbruch: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Workspace öffnen: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-006 — AL-app.json und Launch-Konfiguration sicher handhaben

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-003, EXT-005

### Beschreibung und Hintergrund
Business-Central-Projekte benötigen eine korrekte `app.json`. Falsche IDs, unpassende Versionen oder frei erfundene BC-Serverdaten machen einen Generator unzuverlässig. Deshalb müssen Pflichtangaben bewusst erfasst und bestehende Konfigurationen geschützt werden.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Für neue Projekte erforderliche `app.json`-Felder und valide Defaultwerte gemäß unterstützter AL-Version definieren.
- [ ] Publisher, App-ID, Name, Version, Runtime, ID-Ranges und Dependencies konfigurieren bzw. bewusst leer lassen.
- [ ] Vorhandene `app.json` nur analysieren; Änderungen nur als selektiven Diff mit Zustimmung.
- [ ] `.vscode/launch.json` als optionales Profil anbieten, keine realen Zugangsdaten eintragen.
- [ ] Bei nicht unterstützten Kombinationen Warnung statt stiller Korrektur.

### Akzeptanzkriterien
- [ ] Neue Konfiguration ist parsebar und AL-konform für gewähltes Profil.
- [ ] Bestehende Konfiguration bleibt unverändert ohne explizite Zustimmung.
- [ ] Keine Credentials oder Kundendaten in Vorlagen.

### Tests und Nachweise
- [ ] JSON Schema/Fixture: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Konfliktfälle: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] optionale Launch-Datei: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-007 — Agenten-Dokumentation und Benutzeranleitung als hochwertige Vorlagen

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-002, EXT-004

### Beschreibung und Hintergrund
Das zentrale Produktversprechen ist nicht nur Ordneranlage, sondern ein agentenbereiter Projektstart. Die erzeugten MD-Dateien sollen unerfahrenen Entwicklern erklären, wie sie mit einem Coding-Agenten sicher arbeiten, ohne dass die Extension selbst KI benötigt.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Generierte `AGENTS.md` mit verpflichtender Lesereihenfolge, Ticketgrenzen, AL-Regeln, Nicht-Überschreiben und Testpflicht erstellen.
- [ ] `TODO.md` mit Ticket-ID, Ziel, Beschreibung, Anforderungen, Akzeptanz, Tests, Status und Beispiel definieren.
- [ ] `GETTING_STARTED.md` für Menschen mit Dateiverzeichnis, Startprompt, Ticketbeispiel und Prüfschritten erstellen.
- [ ] `docs/PROJECT.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`, `SECURITY.md`, `TESTS.md`, `modules/INDEX.md` als sinnvolle, nicht erfundene Platzhalter erzeugen.
- [ ] Konfigurationswerte aus Projektkontext einsetzen, Unbekanntes als `Zu prüfen` markieren.
- [ ] Vorlagen mit AL-Fachwissen und vorhandenen Projektmustern gegenprüfen; keine fremden Projektdaten übernehmen.

### Akzeptanzkriterien
- [ ] Alle Dateien haben substanziellen, verständlichen Inhalt statt Einzeilern.
- [ ] AGENTS verweist auf tatsächliche Dateien; Startprompt funktioniert ohne agentenspezifische Integration.
- [ ] Kein erfundener fachlicher Projektinhalt.

### Tests und Nachweise
- [ ] Snapshot-Tests Vorlagen: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Platzhalter vollständig: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] manuelle AL-Fachprüfung: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-008 — Modulindex, Moduldateien und Agenten-Initialisierung für Bestandsprojekte

**Status:** Offen · **Priorität:** P1 · **Abhängigkeiten:** EXT-003, EXT-007

### Beschreibung und Hintergrund
Bei bestehenden AL-Apps können viele Module existieren. Die Extension erkennt Ordner und AL-Objekte, erstellt zuerst eine belastbare Übersicht und überlässt die schrittweise fachliche Interpretation einem separat verwendeten Agenten.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Ordner- und AL-Dateistruktur zu Modulkandidaten aggregieren; Erkennungsquelle ausweisen.
- [ ] `docs/modules/INDEX.md` mit Modulnamen, Pfaden, erkanntem Status und offenen Fragen erzeugen.
- [ ] Nur für bestätigte/ausgewählte Module MD-Gerüste mit Zweck, Objekten, Datenfluss, Abhängigkeiten, Tests, offenen Fragen erzeugen.
- [ ] Initialisierungsprompt bereitstellen: Agent liest Projekt, verifiziert Modulübersicht, ergänzt fehlende Fakten schrittweise.
- [ ] Nicht bei jedem Start komplette semantische Dokumentation versprechen oder 100 generische Dateien erzeugen.

### Akzeptanzkriterien
- [ ] Index nennt erkannte Module samt Quellen; unbekannte Fachlogik als offen.
- [ ] Bestehende Modul-Dokumentation bleibt erhalten.
- [ ] Agent-Prompt beauftragt schrittweises Ergänzen, keine automatische TODO-Abarbeitung.

### Tests und Nachweise
- [ ] Fixture modulare App: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] keine Module: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] bestehende MDs: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-009 — Änderungsplan, Vorschau, Konfliktprüfung und sichere Bestätigung

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-002, EXT-003

### Beschreibung und Hintergrund
Ein-Klick darf niemals Datenverlust bedeuten. Vor jeder Dateierzeugung muss der Nutzer verstehen, was neu angelegt, übersprungen oder als Konflikt erkannt wird. Eine abbrechbare Vorschau trennt Analyse von Schreiben.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Reinen `GenerationPlan` aus Kontext + Profil + Vorlagen erzeugen.
- [ ] Pro Operation Ziel-URI, Aktion, Grund, Konfliktstatus und optional Vorschauinhalt ausweisen.
- [ ] UI mit Kategorien Neu/Vorhanden/Konflikt/Überspringen implementieren.
- [ ] Default: vorhandene Dateien überspringen; gezielte Änderungen nur mit ausdrücklicher Zustimmung.
- [ ] Abbruch vor Bestätigung führt zu null Änderungen; Plan nach Zustimmung erneut auf Konflikte prüfen.
- [ ] Teilweise Fehler und veraltete Pläne klar melden.

### Akzeptanzkriterien
- [ ] Abbruch erzeugt keine Datei.
- [ ] Kein vorhandener Inhalt wird still ersetzt.
- [ ] Wiederholter Plan ist deterministisch und nachvollziehbar.

### Tests und Nachweise
- [ ] Unit Plan: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Integration Abbruch: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Race/Conflict: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-010 — Bestandsprojekt ergänzen ohne AL-Code umzustrukturieren

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-003, EXT-007, EXT-009

### Beschreibung und Hintergrund
Bestehende BC-Apps sind oft unvollständig dokumentiert, aber funktionierend. Die Extension soll fehlende Git-/Agenten-/Dokumentationsdateien ergänzen, ohne bestehende Architektur, AL-Code oder persönliche Konfiguration zu beschädigen.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] `app.json` und vorhandene Ordner/Markdown-Dateien erfassen.
- [ ] Fehlende Standard-/Modul-Dateien planen, bestehende MD-Inhalte nicht normalisieren.
- [ ] Vorhandene Namenskonventionen und Modulstruktur respektieren; keine automatische Verschiebung.
- [ ] Konflikte bei `.gitignore`, `AGENTS.md`, `TODO.md` nur anzeigen; optional später Merge-Strategie.
- [ ] Zweiten Durchlauf ohne Duplikate/Überschreibung testen.
- [ ] Ergebnis mit erstellten, übersprungenen und offenen Punkten ausgeben.

### Akzeptanzkriterien
- [ ] Bestehende `.al`-Dateien sind byte-identisch.
- [ ] Bestehende MDs bleiben unverändert.
- [ ] Fehlende Dateien werden nur nach Bestätigung ergänzt.

### Tests und Nachweise
- [ ] Fixture bestehendes Projekt: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Bytevergleich: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Idempotenz: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-011 — Automatisierte Tests, Security- und Fehlerfall-Matrix

**Status:** Offen · **Priorität:** P0 · **Abhängigkeiten:** EXT-004, EXT-006, EXT-009, EXT-010

### Beschreibung und Hintergrund
Ein Generator muss zuverlässiger sein als ein großer manueller Prompt. Die wichtigsten Risiken sind Datenverlust, falsche Pfade, defekte Konfiguration und irreführende Erfolgsmeldungen. Qualität ist deshalb eine eigenständige Umsetzungseinheit.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] Unit-Tests für Manifest, Pfade, Variablen, Profile, Plan, Template-Rendering und Status schreiben.
- [ ] Integrationstests mit VS-Code-Host und Test-Workspaces vorbereiten.
- [ ] Leerer, modularer, bestehender, ungültiger, schreibgeschützter und Multi-Root-Fall abdecken.
- [ ] Traversal, absolute Pfade, problematische Modulnamen, Symlinks und untrusted Workspace testen.
- [ ] Testbericht mit tatsächlichen Ergebnissen, nicht nur Checkboxes erstellen.
- [ ] Manuelle macOS-/Windows-/VSIX-Abnahme definieren.

### Akzeptanzkriterien
- [ ] Kritische Negativfälle automatisiert abgedeckt.
- [ ] Build/Test-Ergebnisse dokumentiert.
- [ ] Keine Behauptung einer Produktfreigabe ohne manuelle Abnahme.

### Tests und Nachweise
- [ ] Unit: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Integration: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Security: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] manuell: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
- [ ] Nutzer hat Ergebnis ausdrücklich abgenommen (erst dann `Erledigt`).

---

## EXT-012 — VSIX-Paketierung, lokale Installation und Dokumentation

**Status:** Offen · **Priorität:** P1 · **Abhängigkeiten:** EXT-011

### Beschreibung und Hintergrund
Die Extension soll vor einer Marketplace-Veröffentlichung wie eine normale Erweiterung lokal testbar sein. Das Paket darf keine unnötigen Entwicklungsdateien oder vertraulichen Informationen enthalten.

### Ziel / erwartetes Ergebnis
Nach Umsetzung kann ein Entwickler die beschriebene Funktion zuverlässig nutzen, ohne weitere nicht dokumentierte Produktentscheidungen erraten zu müssen. Die Umsetzung hält die Sicherheits- und Architekturgrenzen aus `AGENTS.md` ein.

### Konkrete TODOs
- [ ] `@vscode/vsce`, `.vscodeignore`, Publisher-Platzhalter und Extension-Metadaten prüfen.
- [ ] VSIX bauen, Paketinhalt inspizieren, Vorlagen und Ressourcen einschließen.
- [ ] Install-from-VSIX auf sauberem VS Code testen; Command Palette, Neuprojekt, Bestandsprojekt.
- [ ] README mit Screenshots/Bedienung und Troubleshooting vorbereiten.
- [ ] Marketplace-Publikation ausdrücklich nicht als Teil dieses Tickets durchführen.

### Akzeptanzkriterien
- [ ] VSIX lokal installierbar und aktivierbar.
- [ ] Alle benötigten Templates im Paket.
- [ ] Kein automatisches Publishing.

### Tests und Nachweise
- [ ] VSIX-Paketinhalt: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Clean Install: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.
- [ ] Smoke: tatsächliche Ausführung, Ergebnis und ggf. offene Einschränkungen dokumentieren.

### Abnahme / Dokumentation
- [ ] Relevante Moduldateien, ggf. ADR, Benutzeranleitung und Ticketstatus aktualisiert.
- [ ] Änderungen und offene Risiken für Nutzerprüfung zusammengefasst.
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
