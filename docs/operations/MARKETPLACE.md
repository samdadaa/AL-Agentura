# V1 für den Visual Studio Marketplace

Stand: 02.11.2026. Die Veröffentlichung führt der Herausgeber aus. Dieser Workflow veröffentlicht nichts und speichert keine Zugangsdaten.

## Festgelegte Paketdaten
- Publisher-ID: `SamerDadah` (vom Benutzer angegeben; Besitz/Registrierung im Marketplace-Konto prüfen).
- Extension: `al-agentura`, Anzeigename AL Agentura, Version `1.0.1`.
- Lizenz: MIT (ausdrückliche Benutzerentscheidung), `LICENSE` wird als `LICENSE.txt` mitgeliefert.
- Icon: `assets/Logo.png`, maximal 1024 × 1024 Pixel (Pixelabmessungen, nicht nur Dateigröße); öffentliche Beschreibung und Changelog liegen im Paket.
- Voraussetzung: VS Code Desktop ab 1.90, native lokale Ziele zum Schreiben. Node 22 ist die Voraussetzung für die Entwicklungstools, kein separat zu installierender Runtime-Dienst der Extension.

## Technische Freigabe wiederholen

1. `npm ci` mit Node 22 oder neuer. `npm run verify` ausführen. VS Code muss installiert sein; unter macOS wird die Standardinstallation automatisch gefunden. Bei anderem Installationspfad `VSCODE_EXECUTABLE` auf die Code-CLI setzen.
2. Der Lauf prüft Compile, alle Node-Tests, npm audit, vollständigen Host, Microsoft-Adapter, echten Restricted Mode, VSIX-Inhalt und die Installation des tatsächlichen VSIX in einem isolierten Profil. Er erzeugt `al-agentura-1.0.1.vsix` sowie Nachweise unter `artifacts/quality/`.
3. `npm run release:check` muss erfolgreich sein. Es verweigert fehlende/veraltete Nachweise und ein nachträglich verändertes Paket. Nach Quell-/Test-/Tool-/Manifest-/README-/Lizenzänderungen erneut `npm run verify` ausführen. Danach nicht separat neu paketieren: die neue ZIP-Prüfsumme wäre nicht die des installierten Testpakets.
4. Der Gate-Nachweis ist technisch, keine manuelle Produktabnahme. CI ist unter `.github/workflows/quality.yml` für macOS/Windows/Linux sowie VS Code stable und mindestens Linux 1.90.2 vorbereitet. Ein noch nicht ausgeführter CI-Job ist kein bestandener Test.

`npm run verify` benötigt Registry-Zugriff für `npm audit`; die eigentliche Extension benötigt kein Netzwerk. Der VS-Code-Download ist ein separates CI-Werkzeug (`node scripts/download-vscode.cjs 1.90.2`) und verwendet Microsofts offiziellen Update-Dienst.

## Vor dem Upload manuell abnehmen

In einem separaten VS-Code-Profil das fertige VSIX installieren. Eine vorhandene Entwicklungsfassung `local-development.al-agentura` vorher deaktivieren oder entfernen, damit nicht zwei Extensions dieselben Command-IDs registrieren. Keine produktiven Kundenprojekte als Testziel verwenden.

- [ ] macOS: Anzeigename, Publisher, MIT-Lizenz und Logo in Extensions sichtbar; Command Palette korrekt.
- [ ] Windows: gleiche Installations-/Command-Prüfung; Projektpfade mit Leerzeichen und Umlauten testen. Tatsächliche Symlink-Tests benötigen passende Windows-Rechte/Developer Mode, ansonsten den fehlenden Nachweis dokumentieren.
- [ ] Ohne AL Language: Standard-/Modulgerüst inklusive Workspace, vollständiger MD-Unterordner und Einstieg; bei Abbruch keine Dateien.
- [ ] Mit AL Language: Standard und Modular über Microsoft abschließen; Agentura ergänzt automatisch und öffnet die Workspace-Datei. Bestehende AL-/MD-/Konfigurationsdateien unverändert. Bei Abbruch/Verzögerung keine fremden Projekte öffnen.
- [ ] BC AI Agent nur mit einer AL-Version testen, die diesen Microsoft-Befehl tatsächlich anbietet; andernfalls muss die Nichtverfügbarkeit verständlich gemeldet werden.
- [ ] Bestandsprojektkopie: Vorschau abbrechen, erneut bestätigen, ausgewählte Modulgerüste prüfen, wiederholen ohne Überschreibungen. In einer weiteren Kopie Datei `docs` als Konflikt: keine Anlage.
- [ ] Multi-Root: richtigen Root auswählen, anderer Root unverändert. Restricted Mode: Analyse und lokale Textvorlagen funktionieren; Microsoft-Befehle bleiben gesperrt.
- [ ] Read-only-/Fehlerfall: klare Meldung, kein falscher Erfolg; bereits angelegte Dateien werden nicht automatisch gelöscht. Unterschied zwischen Projektgerüst und kompilierbarer AL-App prüfen.

Ein AL-Compiler-/Sandbox-Test und Microsofts sichtbarer Assistent werden nicht durch die simulierten Host-Dialoge ersetzt. Die Projektregeln und fachliche Eignung generierter Dokumente separat prüfen.

## Lokale Installation für EXT-012

Nach `npm run verify`: `npm run smoke:manual`. Das öffnet ein frisches, getrenntes Profil mit normal installiertem VSIX und dem Demo-Bestandsprojekt. Den ausgegebenen Pfad aufbewahren; neue Projekte ausschließlich im dortigen `NewProjects` anlegen. `npm run smoke:manual -- --no-open` installiert ohne Fensterstart. Fehlendes VSIX und CLI-Fehler führen zu einem Fehlercode; bei abweichender Installation `VSCODE_EXECUTABLE` setzen.

In der Palette `AL Agent:` suchen, **Setup Current Project** erst abbrechen, dann bestätigen und wiederholen. Die bestehende Demo-README und AL-Datei müssen unverändert bleiben, der zweite bestätigte Lauf legt nichts neu an. **Create Project** ohne Microsoft AL erzeugt ein Gerüst; nach Bestätigung den Workspace über **Workspace öffnen** öffnen. Der automatische Microsoft-Ablauf benötigt separat eine passende AL-Language-Installation. [Tatsächliche Nachweise und Screenshots](../quality/EXT-012.md).

Die README verwendet HTTPS-URLs für Screenshots nach Microsofts Marketplace-Vorgaben. Vor Upload müssen die drei Dateien aus `assets/screenshots/` unter den dort angegebenen öffentlichen Repository-URLs erreichbar sein; auch die Bildvorschau im Marketplace prüfen. Die PNGs sind zusätzlich im VSIX enthalten. Dieses Ticket lädt nichts hoch; öffentliche Erreichbarkeit ist noch nicht nachgewiesen.

## Upload durch den Herausgeber

1. Auf der [Publisher-Verwaltungsseite](https://marketplace.visualstudio.com/manage) mit dem eigenen Konto anmelden und die Publisher-ID `SamerDadah` bestätigen. Bei abweichender ID Manifest anpassen und alle Prüfungen wiederholen.
2. **New extension → Visual Studio Code** wählen und genau das geprüfte `al-agentura-1.0.1.vsix` hochladen. Bei späteren Versionen die vorhandene Extension aktualisieren und die Version vorher erhöhen.
3. Beschreibung, Logo, Lizenz und Kompatibilität in der Marketplace-Vorschau prüfen. Erst nach manueller Abnahme veröffentlichen; anschließend Installation aus dem Marketplace selbst prüfen.

Kein PAT, Token oder Passwort gehört in dieses Repository oder eine Testdatei. Eine automatisierte Veröffentlichung ist bewusst nicht eingerichtet. Referenz: [Microsofts Publishing-Anleitung](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
