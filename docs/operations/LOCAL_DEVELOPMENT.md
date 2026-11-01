# Lokale Entwicklung und VSIX

Voraussetzungen: Node.js >=22, npm, VS Code >=1.90.0. Für reproduzierbare Installationen ist `package-lock.json` eingecheckt. Die API-Typen sind auf die Mindestversion 1.90.0 festgelegt; die Extension enthält keine Laufzeitabhängigkeiten.

## Entwicklungszyklus
1. `AL-extension.code-workspace` in VS Code öffnen.
2. `npm ci` installiert Entwicklungsabhängigkeiten; dieser Schritt benötigt Netzwerk oder einen gefüllten npm-Cache. Die Extension selbst bleibt offline.
3. `npm run compile` baut ausschließlich `src/**/*.ts` nach `out/`; `npm run watch` baut bei Änderungen.
4. `npm test` kompiliert und startet die Node-Tests mit isolierter VS-Code-API-Nachbildung.
5. F5 mit **Run AL Project Assistant** startet den Extension Development Host. Die bestehende Launch-Konfiguration nutzt `npm: compile` und die Source Maps unter `out/`.
6. Im Host die Command Palette öffnen (macOS: Cmd+Shift+P, Windows: Ctrl+Shift+P) und **AL Project Assistant: Setup Project** ausführen. Erwartet: Generator „noch nicht implementiert“, keine geänderten Dateien. Meldung schließen und wiederholen.
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
