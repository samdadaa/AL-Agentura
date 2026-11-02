# Visual Studio Marketplace – AL Agentura v1.0.4

## Produktumfang

AL Agentura ergänzt ausdrücklich geöffnete AL-Projekte um sichere Ordner- und Markdown-Strukturen für die Zusammenarbeit mit Coding-Agenten. Sie unterstützt auch unabhängig erzeugte AL-Projektgerüste. **Keine automatische Übergabe von Microsoft AL: Go!, keine Auftragsjournale, keine Fensterüberwachung.**

Publisher: `SamerDadah` · Extension-ID: `al-agentura` · Version: `1.0.4` · Lizenz: MIT · VS Code Desktop ab 1.90.

### Marketplace-Kurzbeschreibung

AL project scaffolding and agent-ready Markdown documentation for Microsoft Dynamics 365 Business Central. Safely enrich existing projects without overwriting code.

### Kurzfunktionen

- Existing AL project setup with preview and conflict protection
- AL Guidelines-informed AGENTS.md, TODO.md and project documentation
- Standard, modular and documentation-only project structure options
- Offline standalone project scaffold and workspace generation
- Read-only project analysis; no automatic Microsoft AL Language integration

## Veröffentlichung

1. `npm ci && npm run compile && npm test` erfolgreich ausführen.
2. `npm run package` erzeugt `al-agentura-1.0.4.vsix`.
3. Optional den erweiterten Qualitätspfad mit `npm run verify` durchführen; die Host-Suites benötigen VS Code auf dem ausführenden Rechner.
4. VSIX lokal installieren und den Workflow `AL Agent: Setup Open AL Project` mit einer Testprojektkopie prüfen.
5. Im [Publisher-Portal](https://marketplace.visualstudio.com/manage) die **bestehende** Extension aktualisieren. Kein neues Marketplace-Produkt anlegen.

Hinweis: `npm run clean:release` entfernt `out`, `artifacts`, `.vscode-test` und alte VSIX-Pakete. Danach muss neu kompiliert und paketiert werden.

Vor Upload README, Screenshots, GitHub-URL, Icon und Lizenz im Paket kontrollieren. Microsoft AL Language darf installiert sein, wird aber von AL Agentura nicht automatisch aufgerufen.
