# AL Agentura 1.0.4 – Bereinigtes Projekt

Dieses Paket basiert auf dem bereitgestellten Projekt und ersetzt die fehleranfällige Microsoft-Automatik durch ausdrücklich gestartete AL-Agentura-Befehle.

## Was wurde entfernt?

- Microsoft-Projektflow/Window-Recovery/Journal und automatische Fortsetzung
- Diagnosebefehl `AL Agent: Test AL Go Integration`
- Microsoft-spezifische Host-/Unit-Tests und ausschließlich dafür genutzte Quellen
- Alte Release-Dateien und temporäre Build-Ausgaben sind **nicht** im ZIP

## Aktuelle Befehle

- `AL Agent: Setup Open AL Project`: aktuelles AL-Projekt ergänzen (empfohlen)
- `AL Agent: Analyze Open AL Project`: lesen / prüfen
- `AL Agent: Open Project`: Ordner öffnen
- `AL Agent: Create Standalone Scaffold`: eigenständiges Projektgerüst ohne Microsoft-Integration

Die technischen IDs bleiben zur Abwärtskompatibilität erhalten.

## Installation

Bestehendes Git-Repository sichern. Diese Dateien gezielt in das Repository übernehmen, die im obigen Abschnitt gelöschten Microsoft-Dateien dort ebenfalls entfernen. **Nicht `.git` ersetzen oder entfernen.**

Nach dem Einbau im Projektordner:

```bash
npm run clean:release
```

Dieser **eine Bereinigungsbefehl** löscht nur die bekannten generierten Verzeichnisse `out`, `artifacts`, `.vscode-test` und alte `al-agentura-*.vsix`/`al-project-assistant-*.vsix`. Er löscht **keine** Quelltexte, `node_modules`, `.git`, Vorlagen oder AL-Kundenprojekte. Danach neu erstellen:

```bash
npm ci
npm run compile
npm test
npm run package
```

Die neue VSIX heißt `al-agentura-1.0.4.vsix`. Die vorhandene Marketplace-Extension aktualisieren (kein zweites Produkt).

## Prüfstand

76/76 Node-Unit-Tests erfolgreich nach TypeScript-Transpilierung. Vollständiger Typcheck und VS-Code-Host-Test waren in dieser Umgebung mangels installierter npm-Typdefinitionen nicht möglich. Bitte auf deinem Mac vor Marketplace-Upload prüfen.
