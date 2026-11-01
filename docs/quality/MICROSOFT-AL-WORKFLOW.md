# AL Agentura – Microsoft-Projektintegration (Teststand)

## Verhalten

- **AL Language installiert:** `AL Agent: Create Project` bietet `Standard AL`, `Modular AL`, `BC AI Agent` und den bisherigen eigenständigen Generator.
- `Standard` und `Modular` rufen einen aus Microsofts `packageJSON.contributes.commands` ausgelesenen, tatsächlich registrierten `AL: Go!`-Befehl auf.
- `BC AI Agent` ruft den tatsächlichen Microsoft-Befehl zur Erstellung eines Agent-Projekts auf. Microsoft behält sämtliche AL-Quellen und seine Projektstruktur; Agentura ergänzt **nur** fehlende Agenten-Dokumentation. Das sind Coding-Agent-Dokumente, keine Business-Central-Agent-Instruktionsdateien.
- **Ohne AL Language:** alter Agentura-Generator ist unverändert verfügbar; für ein reines Gerüst im Wizard `AL-Konfiguration später ergänzen` und `Ohne launch.json` wählen.

## Fortsetzen nach Microsoft

Microsoft kann den Workspace wechseln und dabei das aktuelle Extension-Host-Fenster verlassen. Deshalb wird ein kurzlebiger Fortsetzungswunsch (`globalState`, 15 min) gespeichert. Im neuen Fenster (Aktivierung `onStartupFinished`) bzw. bei Workspace-Wechsel/`app.json`-Anlage wird die Fertigstellung **nur** angenommen, wenn exakt **ein neuer, lokaler Ordner** geöffnet ist und dessen `app.json` als reguläre Datei vorliegt. Anschließend erscheint eine **Bestätigungsfrage**. Der bestehende Befehl `Setup Current Project` übernimmt sichere, nicht überschreibende Planung mit Vorschau.

**Grenzen:** Die Befehlsnamen sind nicht als stabile Microsoft-API dokumentiert und können sich mit AL-Versionen ändern. Das `executeCommand`-Promise ist kein verlässliches Fertigsignal. Wird kein neuer Workspace im selben VS-Code-Profil erkannt, den Befehl `AL Agent: Setup Current Project` manuell verwenden. Der 15-Minuten-Fortsetzungswunsch ist bewusst kein unbefristeter Hintergrundjob. Bei Cancel des Microsoft-Dialogs kann der Wunsch bis zum Ablauf bestehen; die Zielprüfung verhindert automatische Anlage in alten Ordnern.

## Testmatrix im Development Host

1. Ohne AL Language: `Create Project` → eigener Generator; dabei keine AL-`app.json` wählen.
2. Mit AL Language: `Create Project` → Standard → Microsoft AL: Go! vollständig durchlaufen → neues Projekt öffnen → Agentura-Ergänzung bestätigen → Vorschau prüfen → Dateien erstellen.
3. Modular analog, mit tatsächlichen Modulnamen.
4. `BC AI Agent` → Microsoft-Agent-Projekt erstellen → im neuen VS Code öffnen → Agentura ergänzt ausschließlich MD-Dateien; `app/Setup`, `app/Integration`, `.resources` und sämtliche Microsoft-AL-Dateien bleiben erhalten.
5. Microsoft-Assistent abbrechen → keinerlei Agentura-Schreiboperationen.
6. `Setup Current Project` mehrfach ausführen → keine Überschreibungen.
7. Nach Microsoft-Update prüfen, ob die Befehle noch im Manifest stehen; ggf. manuelle Fallback-Funktion nutzen.

**Teststatus:** Programmintegration vorbereitet; tatsächliches Verhalten im VS Code Extension Development Host ist noch zu prüfen. Nicht als vollständig end-to-end validiert ausgeben.
