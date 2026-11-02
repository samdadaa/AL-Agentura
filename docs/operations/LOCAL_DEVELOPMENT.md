# Lokale Entwicklung und Qualitätsprüfung

Node.js >=22, npm und Desktop-VS-Code >=1.90 verwenden. `npm ci` installiert die festgeschriebenen Build-Abhängigkeiten; die eigentliche Extension hat keine Runtime-Abhängigkeiten.

## Entwicklung

- `al-agentura.code-workspace` öffnen, `npm run compile`, F5. Die Command Palette enthält die AL-Agent-Befehle.
- Compile arbeitet mit TypeScript strict und API-Typen 1.90.0. Überholte generierte JS-/Map-Dateien ohne Quelle werden nach erfolgreicher Kompilierung aus `out/` entfernt. Quellcode und Zielprojekte werden nicht gelöscht.
- `npm test` führt alle Node-Tests aus und schreibt einen Zähl-/Fingerprintnachweis nach `artifacts/quality/unit.json`.
- `npm run verify` ist der vollständige technische V1-Check einschließlich Audit, Hosts, Paket und installierter Extension. Registry-Zugriff wird nur für Buildinstallation/Audit benötigt.

macOS erkennt die Standardinstallation `/Applications/Visual Studio Code.app` automatisch. Alternativ `VSCODE_EXECUTABLE` setzen. Beispiel:

```sh
VSCODE_EXECUTABLE='/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' npm run verify
```

Unter Windows kann `VSCODE_EXECUTABLE` auf `Code.exe` aus einer VS-Code-Installation/Archivversion zeigen. Die CI lädt über `scripts/download-vscode.cjs` Microsofts offizielle Version für das jeweilige Betriebssystem. Linux ohne Bildschirm: `xvfb-run -a npm run verify`.

## Gezielte Hosts

`npm run test:host` prüft alle Produktmodule gegen echte native temporäre Projekte. `npm run test:host:microsoft` ergänzt API-Speicher und Adapter. `npm run test:restricted` startet einen tatsächlich untrusted Workspace ohne `--disable-workspace-trust`. `npm run test:installed` setzt das gebaute VSIX voraus und installiert es in ein isoliertes Extensions-Verzeichnis.

Die installierte Extension bleibt eine normale Produkt-Extension. Testdateien werden ausschließlich als temporärer Overlay in deren isolierte Installation kopiert, damit `require('vscode')` den gleichen API-Kontext wie der installierte Code erhält; die Produkt-Runtime bleibt bytegleich zum VSIX. Die `../../out`-Imports der Fixtures verwenden dadurch tatsächlich die installierten Dateien. Der zusätzliche Development-Testtreiber und alle Testdateien gehören nicht zum Releasepaket.

Hosts haben jeweils eigene Profile, Extensions und Fixtures. Sie verwenden keine persönlichen Projekte/Einstellungen. Ein Ergebnisnachweis aus dem Host ist verpflichtend; bloßes Prozessende ist kein Erfolg. Dialoge sind ersetzt; sichtbare Bedienung und Microsofts echter Assistent bleiben manuelle Abnahme.

## Paket und Veröffentlichung

`npm run package` baut `al-agentura-1.0.0.vsix`, `npm run test:package` prüft das Archiv einschließlich Quellenzuordnung, Ressourcen, Lizenz und Icon. `npm run release:check` akzeptiert nur aktuelle erfolgreiche Nachweise und die unveränderte, tatsächlich installierte Paket-SHA. Für eine komplette Freigabe `npm run verify` verwenden; danach nicht noch einmal separat paketieren, ohne den Installationsnachweis zu erneuern.

Publisher `SamerDadah`, MIT-Lizenz und Version 1.0.0 sind vom Benutzer festgelegt. Keine Veröffentlichung aus einem npm-Skript oder der CI. [Manuelle Abnahme und Marketplace-Upload](MARKETPLACE.md), [EXT-011-Matrix](../quality/EXT-011.md).
