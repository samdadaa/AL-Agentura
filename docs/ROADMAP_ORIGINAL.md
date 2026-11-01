# AL Project Assistant – Konzept und Entwicklungsroadmap

**Stand:** 26. Oktober 2026  
**Status:** Konzept / Planungsgrundlage – noch keine Implementierung  
**Plattform:** Visual Studio Code  
**Zielgruppe:** Entwickler von Microsoft Dynamics 365 Business Central (AL)  
**Vertrieb:** zunächst lokale Entwicklung und Installation als VSIX, später optional VS Code Marketplace  
**KI-Integration:** keine; die Extension bereitet Projekte für separat genutzte Coding-Agenten vor.

## 1. Vision

Eine VS-Code-Extension speziell für AL-Entwickler, die ein neues oder vorhandenes Business-Central-Projekt mit wenigen Klicks in einen sauberen, dokumentierten, Git-tauglichen und agentenbereiten Zustand versetzt.

**Versprechen:** AL-Projekt öffnen → Profil auswählen → Vorschau prüfen → Struktur und Dateien erzeugen → Aufgabe in `TODO.md` erfassen → vorhandenen Coding-Agenten beauftragen.

Die Extension nimmt wiederkehrende Projektvorbereitung ab. Sie soll keine KI-Plattform, kein eigenes Ticket-System und kein Ersatz für die offizielle Microsoft-AL-Extension werden.

## 2. Produktentscheidungen

- **AL-only zum Start:** keine allgemeine Multi-Language-Extension. Intern können Vorlagen später erweiterbar bleiben, aber keine andere Sprache gehört zum MVP.
- **Ohne KI-Anbindung:** kein API-Key, keine Modellkosten, keine automatische Codegenerierung durch die Extension.
- **Ein-Klick-Setup mit Vorschau:** Standardwerte sollen für einen schnellen Start reichen; vor Änderungen ist sichtbar, was erzeugt oder angepasst wird.
- **Nicht-destruktiv:** vorhandene Dateien niemals ungefragt überschreiben oder verschieben; Konflikte anzeigen und gezielt bestätigen lassen.
- **Normale Dateien:** Markdown, JSON und AL-Projektdateien bleiben im Repository editierbar und versionierbar.
- **Einfach zuerst:** kein eigener Server, keine Datenbank, kein Konto, kein komplexes Plugin-System für Version 1.
- **Agent arbeitet auf Anweisung:** offene TODOs werden nicht automatisch alle ausgeführt.

## 3. Zielgruppen und typische Anwendungsfälle

### 3.1 Neues AL-Projekt

1. Entwickler erstellt ein Projekt über `AL: Go!` oder öffnet einen leeren Ordner.
2. Startet `AL Project Assistant: Setup Project`.
3. Wählt **Standard** oder **Modular** und gibt bei Bedarf Projekt-/Modulnamen und Einstellungen an.
4. Sieht eine Vorschau der anzulegenden Dateien und Änderungen.
5. Bestätigt; die Extension erstellt die Struktur und Dokumentation.
6. Entwickler trägt das erste Ticket in `TODO.md` ein und gibt dem bevorzugten Agenten den Startprompt aus `GETTING_STARTED.md`.

**Offene Produktentscheidung:** Soll die Extension für leere Ordner selbst `AL: Go!` anstoßen bzw. ein vollständiges AL-Grundprojekt erzeugen? Für das MVP ist die sichere Integration mit bereits vorhandenem `app.json` vorzuziehen; ein eigener Neuprojekt-Wizard kann folgen.

### 3.2 Bestehendes AL-Projekt

1. Extension erkennt `app.json` und bestehende Ordner.
2. Zeigt fehlende Projektgrundlagen und mögliche Ergänzungen.
3. Fügt nur ausgewählte, fehlende Dateien hinzu.
4. Verschiebt weder `.al`-Dateien noch ändert sie bestehende Konfiguration ohne ausdrückliche Zustimmung.
5. Tiefgehende fachliche Modulbeschreibung wird **nicht** von der Extension erfunden, sondern über Anweisungen an einen externen Agenten vorbereitet.

### 3.3 Modulares Projekt

Der Entwickler nennt Fachmodule, z. B. `Finance`, `Contracts`, `MeterManagement`. Die Extension legt pro Modul die gleiche AL-Objektordnerstruktur und einen Dokumentationsplatzhalter an. Es werden nur ausgewählte Module angelegt.

## 4. Projektprofile

### Standard – kleine AL-App

```text
MyALApp/
├── .gitignore
├── .vscode/
│   └── launch.json                 # optional, je nach Umgebung
├── app.json                        # aus AL: Go!; nur mit Zustimmung ändern
├── AGENTS.md
├── TODO.md
├── GETTING_STARTED.md
├── docs/
│   ├── PROJECT.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   └── modules/
│       └── INDEX.md
└── src/
    ├── Codeunits/
    ├── Pages/
    ├── PageExtensions/
    ├── Tables/
    ├── TableExtensions/
    ├── Enums/
    ├── EnumExtensions/
    ├── Reports/
    ├── ReportExtensions/
    ├── Queries/
    ├── XmlPorts/
    ├── Interfaces/
    ├── Permissions/
    └── Profiles/
```

**Hinweis:** Die Liste ist eine konfigurierbare Ausgangsvorlage, kein Anspruch auf Vollständigkeit aller AL-Objekttypen. Nicht benötigte Ordner können abgewählt werden. Leere, in Git gewünschte Ordner erhalten `.gitkeep`.

### Modular – größere AL-App

```text
MyALApp/
├── app.json
├── .gitignore
├── AGENTS.md
├── TODO.md
├── GETTING_STARTED.md
├── docs/
│   ├── PROJECT.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   └── modules/
│       ├── INDEX.md
│       ├── Finance.md
│       └── Contracts.md
└── src/
    ├── Finance/
    │   ├── Codeunits/
    │   ├── Tables/
    │   ├── Pages/
    │   └── ...
    └── Contracts/
        ├── Codeunits/
        ├── Tables/
        ├── Pages/
        └── ...
```

## 5. Dateikonzept

### `AGENTS.md`

Zentrale, kurze Arbeitsanweisung für externe Coding-Agenten:
- Projekt und `app.json` vor Änderungen prüfen.
- `docs/CONVENTIONS.md` und relevante Moduldateien lesen.
- Nur explizit ausgewähltes Ticket aus `TODO.md` bearbeiten.
- Vorhandene Muster bevorzugen, keine unnötigen Änderungen.
- AL-Objekttypen im vorgesehenen Ordner anlegen; Projektstruktur beachten.
- AL-spezifische Regeln beachten (IDs, Namensgebung, Erweiterbarkeit, Events, Performance, Tests).
- Nach Umsetzung geänderte Architektur-/Moduldokumentation aktualisieren.
- Ticketstatus nur nach nachvollziehbarer Prüfung aktualisieren; bei Unsicherheit Rückfrage stellen.
- Bei bestehendem Projekt zuerst Übersicht erstellen und bei Bedarf Modulbeschreibungen schrittweise ergänzen.

**Kompatibilität:** Nicht jeder Coding-Agent liest `AGENTS.md` automatisch. `GETTING_STARTED.md` enthält deshalb einen kopierbaren Initialisierungsprompt.

### `TODO.md`

Leicht verständliche Ticketliste, kein vollwertiges Issue-Tracking. Empfohlenes Format:

```md
# TODO

## AL-001 – Beispiel: Kundentabelle anlegen
- Status: Offen
- Priorität: Mittel
- Ziel: Eine neue Kundentabelle bereitstellen.
- Anforderungen:
  - Feld Kundennummer
  - Feld Name
  - Feld Adresse
- Akzeptanzkriterien:
  - Objekt-ID liegt im erlaubten Bereich.
  - AL-Projekt kompiliert erfolgreich.
  - Dokumentation ist aktualisiert.
- Hinweise/Abhängigkeiten: Keine
```

Empfohlene Statuswerte: `Offen`, `In Arbeit`, `Blockiert`, `Zur Prüfung`, `Erledigt`. Nur ein ausgewähltes Ticket wird dem Agenten übergeben.

### `GETTING_STARTED.md`

Kurze Anleitung für den Entwickler:
- Welche Dateien wofür da sind.
- Wie ein gutes AL-Ticket mit Ziel, Anforderungen und Akzeptanzkriterien aussieht.
- Wie ein Coding-Agent auf `AGENTS.md` und das konkrete Ticket verwiesen wird.
- Wie man Änderungen und Tests prüft.
- Was bei neuen Modulen und bei bestehenden Projekten zu tun ist.

**Beispielprompt:** „Lies `AGENTS.md`, `docs/CONVENTIONS.md` und Ticket `AL-001` aus `TODO.md`. Prüfe den vorhandenen Code und setze ausschließlich dieses Ticket um. Beschreibe Änderungen und Tests und aktualisiere betroffene Dokumentation.“

### Weitere Dokumente

- `docs/PROJECT.md`: Projektzweck, Umfang, Zielumgebung, Abhängigkeiten; unbekannte Werte als Platzhalter.
- `docs/ARCHITECTURE.md`: Aufbau, Schichten, Modulgrenzen, zentrale Entscheidungen.
- `docs/CONVENTIONS.md`: AL-Konventionen und Teamregeln.
- `docs/modules/INDEX.md`: Modulverzeichnis; bei bestehendem Projekt zunächst bewusst unvollständig, bis ein Agent die Codebasis geprüft hat.
- `docs/modules/<Modul>.md`: Modulzweck, Objekte, Datenfluss, Abhängigkeiten, offene Fragen.

## 6. AL-spezifische Entwicklungsregeln (Template-Inhalte)

Regeln sollen überprüfbar, anpassbar und nicht als universelle Microsoft-Vorgabe ausgegeben werden:

- Objekt-IDs: konfigurierter Bereich; neue IDs nicht blind vergeben; bei bestehendem Projekt auf belegte IDs prüfen.
- Benennung: Präfix/Suffix und Objektbezeichnungen nach Teamvorgaben; konsistente Datei- und Objektbezeichnungen.
- Standardobjekte: Erweiterungsobjekte statt unnötiger Änderungen an Basisobjekten.
- Events/Subscriber: klare Zuständigkeiten, keine unnötige Kopplung.
- Performance: `SetLoadFields`, Filter, Datenzugriff und Transaktionsgrenzen bewusst einsetzen; keine pauschalen Regeln ohne Kontext.
- Sicherheit: Berechtigungssätze, Geheimnisse nicht ins Repository, Konfiguration statt fest codierter Zugangsdaten.
- Tests: passende AL-Tests und Compiler/Analyzer nutzen, wenn im Projekt verfügbar.
- Versionen: Runtime-/BC-Kompatibilität anhand `app.json` und tatsächlicher Umgebung prüfen.
- Dokumentation: Architektur und Modulübersichten bei relevanten Änderungen aktuell halten.

## 7. Git und Konfiguration

- `.gitignore` zentral am Projektroot, mit bewusst gewählten Regeln für generierte Dateien, lokale Artefakte und Secrets.
- `.gitkeep` in leeren Ordnern, die in Git sichtbar sein sollen.
- `launch.json` **nicht pauschal ignorieren**: Team- und lokale Debug-Konfiguration unterscheiden; Benutzer entscheidet.
- `.app`-Pakete, Symbol-/Cachedateien und temporäre Build-Artefakte gemäß tatsächlichem AL-Workflow behandeln.
- `app.json` nicht unbemerkt überschreiben; wichtige Werte wie `id`, `name`, `publisher`, `version`, `platform`, `application`, `runtime`, `idRanges` validieren, soweit vorhanden.
- Konfigurationsdateien und Vorlagen lokal mitliefern; kein Download aus unbekannten Quellen als Voraussetzung.

## 8. Bedienoberfläche und Befehle

### MVP

- Command Palette: `AL Project Assistant: Setup Project`.
- Projekterkennung anhand `app.json`.
- Auswahl `Standard` / `Modular` / `Bestehendes Projekt ergänzen`.
- Eingabe der Modulnamen bei modularen Projekten.
- Vorschau: **Neu**, **Vorhanden**, **Konflikt**, **Wird geändert**.
- Bestätigung und verständliche Zusammenfassung nach Ausführung.
- Optional: Befehl `Open TODO`.

### Später

- Seitenleiste mit Setup-Status.
- `New AL Module`.
- `Project Check` (fehlende Dateien, doppelte Objekt-IDs, Git-/Konfigurationshinweise).
- Eigene Vorlagen importieren, benennen, lokal speichern, manuell anwenden; Markdown-Inhalte unverändert übernehmen.
- Teamvorlagen und konfigurierbare Profile.
- Befehl `Copy Agent Prompt for Selected Ticket` ohne KI-Anbindung.

## 9. Sicherheits- und Qualitätsanforderungen

- **Idempotenz:** wiederholtes Setup darf keine doppelten Inhalte erzeugen.
- **Keine Datenverluste:** bestehende Dateien nur nach Vorschau und expliziter Bestätigung verändern.
- **Pfadsicherheit:** keine Schreiboperationen außerhalb des gewählten Workspace-Ordners.
- **Multi-Root-Workspaces:** bei mehreren Ordnern Zielordner auswählen.
- **Fehlerbehandlung:** ungültige `app.json`, schreibgeschützte Dateien, Abbruch, unvollständige Erstellung.
- **Offline nutzbar:** Grundfunktion ohne Internet.
- **Kein Telemetriezwang:** keine Konten, keine Cloud-Datenübertragung für das Setup.
- **Tests:** Generator-Tests, Konflikttests, erneute Ausführung, Windows/macOS, AL-Standard- und modulare Projekte.

## 10. Technischer Ansatz

- VS-Code-Extension in TypeScript mit VS Code Extension API.
- Dateierzeugung über `vscode.workspace.fs`; keine externe KI oder Backend-Infrastruktur.
- Projektvorlagen als gebündelte Dateien, mit internem Manifest für Pfade, Profile und Optionen.
- Strikte Trennung zwischen Generator, Vorlagen, AL-Projektprüfung und UI.
- Keine automatische semantische Analyse von Geschäftslogik ohne KI.
- Bestehende AL-Dateien nur lesen/prüfen, nicht ungefragt umorganisieren.

## 11. Große TODO / Umsetzungspakete

Die folgende Roadmap ist eine Arbeitsliste für kommende Gespräche. **Noch nicht implementiert.** Priorität und genaue Regeln werden paketweise festgelegt.

### Paket 00 – Grundlagen und Architektur
- [ ] Repository und Extension-Projekt erstellen.
- [ ] Name, Publisher, Lizenz und Zielversionen festlegen.
- [ ] VS-Code-Commands und Projektstruktur der Extension definieren.
- [ ] Template-Manifest und Profile modellieren.
- [ ] Tests und Build/VSIX-Prozess vorbereiten.

### Paket 01 – AL-Projekterkennung
- [ ] Workspace/Ordner auswählen.
- [ ] `app.json` erkennen und vorsichtig lesen.
- [ ] Leeren Ordner, neues AL-Projekt und bestehendes Projekt unterscheiden.
- [ ] Fehlende oder ungültige Konfiguration verständlich melden.
- [ ] Verhalten bei mehreren Workspace-Roots testen.

### Paket 02 – Ordnergenerator
- [ ] Standard-Profil definieren.
- [ ] Modulares Profil definieren.
- [ ] Objektordner konfigurierbar machen.
- [ ] `.gitkeep` in ausgewählten leeren Ordnern erzeugen.
- [ ] Wiederholte Ausführung ohne Duplikate gewährleisten.

### Paket 03 – Git und AL-Projektdateien
- [ ] `.gitignore`-Vorlage für AL abstimmen.
- [ ] `launch.json` als optionalen Baustein definieren.
- [ ] `app.json`-Prüfung und sichere Änderungsoptionen implementieren.
- [ ] Keine Secrets oder lokale Artefakte versehentlich versionieren.

### Paket 04 – Agenten- und Dokumentationsvorlagen
- [ ] `AGENTS.md` mit AL-spezifischen Regeln erstellen.
- [ ] `TODO.md` mit Ticketvorlage und Statuskonzept erstellen.
- [ ] `GETTING_STARTED.md` mit Anleitung und Startprompt erstellen.
- [ ] `docs/PROJECT.md`, `ARCHITECTURE.md`, `CONVENTIONS.md` erstellen.
- [ ] Modulindex und Moduldateien vorbereiten.
- [ ] Inhalt der Vorlagen anhand realer AL-Projekte überprüfen.

### Paket 05 – Setup-Workflow und Vorschau
- [ ] Befehl `Setup Project` bereitstellen.
- [ ] Profilwahl und Modulnamen erfassen.
- [ ] Änderungen vor dem Schreiben als Vorschau anzeigen.
- [ ] Konflikte selektiv bestätigen/überspringen.
- [ ] Ergebnis mit neu angelegten und übersprungenen Dateien anzeigen.

### Paket 06 – Bestehende Projekte
- [ ] Fehlende Dateien und Ordner erkennen.
- [ ] Ergänzungen ohne Verschieben bestehender `.al`-Dateien anbieten.
- [ ] Vorhandene Teamkonventionen nicht überschreiben.
- [ ] Initialisierungsprompt zur späteren Agenten-Analyse vorbereiten.
- [ ] Tests mit kleinen und großen AL-Repositories durchführen.

### Paket 07 – Qualität und Veröffentlichungsvorbereitung
- [ ] Automatisierte Tests für Dateigenerator und Konflikte.
- [ ] Windows/macOS testen.
- [ ] Dokumentation, README, Screenshots und Beispielprojekt erstellen.
- [ ] F5-Test im Extension Development Host.
- [ ] VSIX lokal bauen und installieren.
- [ ] Intern testen, Fehler beheben, erst danach Marketplace erwägen.

### Paket 08 – Erweiterungen nach MVP
- [ ] Projektcheck mit Objekt-ID-Analyse.
- [ ] Neues Modul per Befehl anlegen.
- [ ] Eigene Markdown-Vorlagen unverändert importieren und speichern.
- [ ] Teamprofile/Template-Pakete unterstützen.
- [ ] Kopierbaren Prompt für ein ausgewähltes TODO-Ticket anbieten.
- [ ] Optionaler Workspace-/Projekt-Wizard für leere Ordner.
- [ ] Optionale Integration vorhandener AL-Compiler/Analyzer-Ergebnisse prüfen.

## 12. Abnahmekriterien für MVP

Ein AL-Entwickler kann in einem vorhandenen, gültigen AL-Projekt:

1. die Extension per F5 starten oder lokal als VSIX installieren;
2. das Projekt erkennen lassen;
3. Standard- oder Modular-Profil auswählen;
4. vor der Erstellung alle geplanten Änderungen prüfen;
5. AL-Ordner, Git-Dateien und alle vorgesehenen Markdown-Dateien erzeugen;
6. `TODO.md` öffnen, ein Ticket schreiben und mit einem vorhandenen Agenten arbeiten;
7. Setup erneut ausführen, ohne vorhandene Arbeit zu verlieren.

## 13. Bewusste Nicht-Ziele des MVP

- Keine Unterstützung für Python, C#, React oder andere Sprachen.
- Kein eingebautes LLM und keine API-Anbindung.
- Keine automatische vollständige Code- oder Business-Logik-Dokumentation.
- Kein automatisches Abarbeiten aller TODO-Tickets.
- Kein komplexes Ticket-Management, keine Cloud-Synchronisation.
- Keine automatische Umstrukturierung bestehender AL-Dateien.
- Kein umfassender AL-Linter als Eigenentwicklung.

## 14. Zeitrahmen (unverbindliche Schätzung)

- **3–4 Arbeitstage:** einfacher, lokal testbarer Prototyp für neue AL-Projekte.
- **Ca. 2–3 Wochen bei 4–5 Stunden täglich:** erste solide VSIX mit Projektprofilen, Vorschau, sicherer Ergänzung bestehender Projekte, Tests und Dokumentation.
- Zusätzliche Prüfungen, individuelle Vorlagen und Teamfunktionen verlängern den Umfang.

## 15. Entscheidungen für das nächste Gespräch

1. Endgültiger Extension-Name und Projektlizenz.
2. Exakte Standard-AL-Objektordner und Benennung (`src`/`Src`, Singular/Plural).
3. Welche `app.json`-Felder die Extension anfassen darf.
4. Konkrete `.gitignore`- und `launch.json`-Vorgaben.
5. Inhalt und Verbindlichkeit der AL-Agentenregeln.
6. Genaue Bedienoberfläche: Quick Pick, Wizard oder Webview.
7. Ob `AL: Go!` Voraussetzung bleibt oder ein eigener Projektgenerator hinzukommt.

---

**Leitgedanke:** Ein fokussierter AL-Projektassistent, der einem BC-Entwickler die wiederkehrende Startarbeit abnimmt und das Projekt sofort für strukturiertes Arbeiten mit einem beliebigen externen Coding-Agenten vorbereitet.
