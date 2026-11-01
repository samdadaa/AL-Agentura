# Lokale Entwicklung und VSIX

Voraussetzungen: Node.js >=22, npm, VS Code >=1.90.0. Für reproduzierbare Installationen ist `package-lock.json` eingecheckt. Die API-Typen sind auf die Mindestversion 1.90.0 festgelegt; die Extension enthält keine Laufzeitabhängigkeiten.

## Entwicklungszyklus
1. `AL-extension.code-workspace` in VS Code öffnen.
2. `npm ci` installiert Entwicklungsabhängigkeiten; dieser Schritt benötigt Netzwerk oder einen gefüllten npm-Cache. Die Extension selbst bleibt offline.
3. `npm run compile` baut ausschließlich `src/**/*.ts` nach `out/`; `npm run watch` baut bei Änderungen.
4. `npm test` kompiliert und startet die Node-Tests mit isolierter VS-Code-API-Nachbildung.
5. F5 mit **Run AL Project Assistant** startet den Extension Development Host. Die bestehende Launch-Konfiguration nutzt `npm: compile` und die Source Maps unter `out/`.
6. Im Host die Command Palette öffnen (macOS: Cmd+Shift+P, Windows: Ctrl+Shift+P) und **AL Project Assistant: Setup Project** ausführen. Erwartet: Auswahl des Elternordners. Abbruch legt keine Projektdateien an. Für den vollständigen Test den Neuprojektablauf unten verwenden.
7. Unter **Ausgabe → AL Project Assistant** stehen feste Aktivierungs-/Aufrufmeldungen. Keine Exception-Texte oder Workspace-Inhalte werden protokolliert. Beim Deaktivieren entsorgt VS Code Command und Kanal über `context.subscriptions`.

## Echter Extension-Host-Test
`npm run test:host` startet das installierte `code` in einem separaten Fenster mit temporärem Benutzer-/Extension-Verzeichnis und ohne Workspace. Es verändert keine persönlichen VS-Code-Einstellungen oder Projekte. Der Test wartet maximal 120 Sekunden, prüft einen Ergebnisnachweis aus dem Host und entfernt anschließend seine temporären Dateien.

Falls `code` nicht im PATH liegt, unter macOS:

```sh
VSCODE_EXECUTABLE='/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' npm run test:host
```

Unter PowerShell zuerst `$env:VSCODE_EXECUTABLE` auf den vollständigen Pfad von `code.cmd` setzen. Der Test prüft tatsächliche Aktivierung, Manifest-Beitrag, Registrierung und zwei Command-Aufrufe. Die Benachrichtigungsfunktion wird im Test ersetzt, damit keine Interaktion zum Schließen nötig ist. Sichtbare Palette, Meldungsdarstellung und F5 bleiben manuelle Prüfungen.

## Lokale Paketierung
`npm run package` kompiliert über `vscode:prepublish` und erzeugt `al-project-assistant-0.0.1.vsix`. Kein Publishing. `local-development` ist der lokale Publisher-Platzhalter. `.vscodeignore` schließt Quellcode, Tests, Entwicklungsdokumente und Metadaten aus; `out/**/*.js` und `resources/templates` werden ausgeliefert. Die Vorlagen sind vorbereitet und werden noch nicht angewendet.

Paketinhalt mit `unzip -l al-project-assistant-0.0.1.vsix` oder einem ZIP-Programm prüfen. Die fehlende Lizenzdatei führt derzeit zu einer Warnung; eine Lizenzentscheidung wird nicht erfunden. Vollständige Installations-/Generatorabnahme bleibt EXT-012.

Für eine manuelle lokale Installation in einem separaten VS-Code-Profil **Extensions → … → Install from VSIX** wählen, VSIX öffnen und den Setup-Befehl wie oben prüfen. Noch nicht als durchgeführt dokumentiert.

## Fehler und Abbruch
Der Platzhalter besitzt keinen Wizard und schreibt keine Dateien. Schließen der Informationsmeldung beendet den Aufruf. Ein `CancellationError` wird still als Abbruch behandelt; andere Fehler liefern eine feste deutsche Fehlermeldung mit Wiederholungs-/Meldehinweis. Zur Reproduktion nur bereinigte Schritte melden. Bei „command not found“ Build, aktiven Development Host und Command-ID `alProjectAssistant.setup` prüfen; für Host-Tests muss die CLI erreichbar sein.

Aktuelle Ergebnisse und Einschränkungen: [EXT-001](../quality/EXT-001.md).

## Manifest-/Profilverträge prüfen (EXT-002)
`npm run compile` und anschließend `node --test tests/templates.test.cjs` prüfen gezielt die neuen Datenverträge. Vollständiger Lauf weiterhin `npm test`. Der Setup-Command wendet noch keine Profile an.

Entwicklerbeispiel nach dem Build, vom Repository-Root aus:

```js
const fs = require('node:fs');
const { loadManifest, loadProfileCatalog } = require('./out/templates/catalog');
const { validateProfileInputs } = require('./out/core/profileValidation');
const base = 'resources/templates';
const catalog = loadProfileCatalog(fs.readFileSync(`${base}/profiles.json`, 'utf8'));
const manifests = ['al-standard', 'al-modular'].map(id =>
  loadManifest(fs.readFileSync(`${base}/${id}/manifest.json`, 'utf8')));
validateProfileInputs('modular', catalog, manifests, { MODULES: ['Sales', 'Purchasing'] });
// { MODULES: ['../escape'] } wird vor jedem späteren Schreibzugriff abgewiesen.
```

Hier liest Node nur die lokalen Entwicklungsressourcen. Ein späterer Extension-Adapter muss Ressourcen und Zielprojekte URI-basiert mit `vscode.workspace.fs` lesen. Die neuen Loader/Validatoren selbst verwenden kein Dateisystem. Format: [Templates](../modules/Templates.md), Entscheidung: [ADR 0001](../architecture/adr/0001-template-manifest-contract.md).

## Projektanalyse und Strukturplanung (EXT-003/004)
Im Extension Development Host die Command Palette öffnen und **AL Project Assistant: Projekt analysieren** starten. Ohne Workspace wird ein Ordnerdialog angeboten; mit einem Root wird dieser verwendet, bei mehreren Roots ist eine Auswahl erforderlich. Abbruch verändert nichts. Die Meldung unterscheidet leeren Zielordner, Projekt mit lesbarer app.json und unvollständigen Bestand. AL-Dateien und Strukturkandidaten werden gezählt; ungültige JSON, Scanlimits, Symlinks und Lesefehler bleiben sichtbar. Es werden keine Dateien angelegt oder geändert.

**Setup Project** bietet seit EXT-005 den unten beschriebenen lokalen Neuprojekt-Wizard. EXT-004 stellt vorerst eine Modulschnittstelle zur Strukturplanung bereit; keine sichtbare Vorschau oder Anwendung. In Extension-Code kann nach `loadBundledTemplates(context.extensionUri)` und `inspectProject(root, { objectTypes: objectTypesFromManifest(standardManifest) })` folgendes geplant werden:

```ts
const plan = createStructurePlan(projectContext, modularManifest, {
  profile: 'modular', modules: ['Sales', 'Purchasing', 'Sales'],
  objectTypes: ['Tables', 'Codeunits']
}, bundle.gitignore);
```

`modules` werden validiert und dedupliziert, `objectTypes` ist eine optionale Teilmenge der deklarierten AL-Typen. Der Plan enthält absolute Ziel-URIs und create/skip/conflict mit Gründen. Er schreibt nichts. Bestehende `.gitignore` bleibt unverändert; Empfehlungen stehen in `resources/templates/al.gitignore`. Lokale `.vscode/*.local.json` werden ignoriert, gemeinsame Einstellungen/Launch-Dateien bleiben versionierbar. Das ist eine anpassbare Projektkonvention, keine Microsoft-Pflicht.

`npm test` prüft Metadaten und reine Pläne. `npm run test:host` prüft zusätzlich echte temporäre Ordner, No-root-/Single-/Multi-root-Auswahl mit ersetzten Pickern, Analyse-Command, Abbruch, Plan-Wiederholung nach Testfixture-Anwendung und einen schreibgeschützten registrierten URI-Provider. Eine echte SSH-Verbindung oder manuell bediente Picker werden dadurch nicht bewiesen. Manuell: leeren Ordner, vorhandene AL-App und fehlerhafte app.json wählen, Meldungen und unveränderte Dateien prüfen; zusätzlich einen Multi-Root-Workspace öffnen und die richtige Root auswählen.

[Verträge Workspace](../modules/Workspace.md), [Analysis](../modules/Analysis.md), [Generation](../modules/Generation.md), [Testnachweis](../quality/EXT-003-004.md).

## Neuprojekt-Wizard (EXT-005)
1. **AL Project Assistant: Setup Project** starten. Der Ablauf benötigt keinen geöffneten Workspace.
2. Einen vorhandenen lokalen Elternordner wählen und einen neuen Projektnamen eingeben. Auch vorhandene leere Zielordner werden abgewiesen. Name maximal 128 Zeichen; keine Traversal-/URI-/Gerätenamen. Symlinks in der erkannten Elternkette werden abgewiesen.
3. Standard oder Modular wählen. Module optional kommagetrennt eingeben; Wiederholungen werden case-insensitiv dedupliziert, höchstens 50 Einträge.
4. Eine vorhandene app.json als Quelle wählen oder die AL-Konfiguration ausdrücklich für später lassen. Die Quelle wird typ-/JSON-geprüft und inhaltstreu kopiert; keine Compiler-/vollständige AL-Schema-Garantie. Ohne Quelle ist die App noch nicht kompilierbar. AL: Go! und Launch-Konfiguration werden nicht automatisch erzeugt/gestartet.
5. Die geöffnete Textvorschau mit allen Ordnern/Dateien und dem Zielroot prüfen. Erst **Projekt anlegen** im modalen Dialog startet die Erstellung. Schließen/Abbrechen vorher verändert keine Projektdatei.
6. Nach Erfolg wird die neue GETTING_STARTED.md geöffnet und der Umfang gemeldet. **Workspace öffnen** öffnet `<Name>/<Name>.code-workspace` über `vscode.openFolder` in einem neuen Fenster. **Später** oder Schließen erhält den bisherigen Workspace. Die neue Workspace-Datei referenziert `.`.

Neuanlage unterstützt vorerst ausschließlich native lokale `file`-Ziele ohne Authority. Ein sicherheitsrelevanter Host-Test hat den providerübergreifenden Copy-Fallback ausgeschlossen; andere Provider werden vor der Anlage abgewiesen. Remote-/Virtual-Analyse und Planer bleiben nutzbar, aber keine Remote-Neuanlage in diesem Schritt. Temporäre Dateiinhalte werden in einem exklusiven OS-Scratch-Verzeichnis bereitgestellt; nur dessen Erstellung nutzt Node fs, niemals Zielprojektzugriffe. Zieldateien entstehen über native `workspace.fs.copy` mit `overwrite: false`. Temporäre Daten werden anschließend entfernt.

Fehlt eine Konfiguration, kann AL: Go! separat in einem neuen leeren Ordner eine Quelle erzeugen; nicht unkoordiniert über dem bereits vorbereiteten Root ausführen. Danach die Konfiguration bewusst prüfen/übernehmen. Eine eigene app.json-/Launch-Generierung folgt mit EXT-006, vollständige Agenten-Dokumentation mit EXT-007.

Teilweiser Fehler: keine Erfolgsmeldung für vollständige Anlage und kein automatisches Löschen bereits erstellter Dateien. Ziel und gestoppter Pfad werden gemeldet. Bestand und eventuelle konkurrierende Dateien bleiben erhalten. Ein erneuter Neuprojektlauf auf diesen Root wird abgewiesen; zuerst Bestand prüfen. Bei fehlgeschlagener Workspace-Öffnung bleiben die angelegten Dateien bestehen; `.code-workspace` manuell öffnen.

Automatisch: `npm test`, `npm run test:host`. Manuell: Wizard ohne Workspace durchlaufen, jeden Dialog abbrechen, vorhandenes Ziel wählen, Standard/Modular erstellen, Workspace in neuem Fenster öffnen, Quelle/Ziel/relative Pfade prüfen. Diese sichtbare Bedienprüfung wurde in dieser Sitzung nicht ausgeführt. [Nachweise](../quality/EXT-005.md), [ADR 0003](../architecture/adr/0003-new-project-creation.md).
