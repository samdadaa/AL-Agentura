# AL Agentura — Microsoft-Projektintegration (01.11.2026)

## Verhalten und Bedienprüfung

1. `AL Agent: Create Project` starten und Standard AL, Modular AL oder BC AI Agent wählen. AL Language muss installiert sein. Der Microsoft-Befehl wird aus dem tatsächlich installierten Manifest und den registrierten Commands ermittelt.
2. Bei Modular die Modulnamen vor Microsoft eingeben. Anschließend Microsofts notwendige Eingaben abschließen und dessen Zielprojekt öffnen lassen. Auch ein bereits geöffneter leerer Ordner wird unterstützt, wenn Microsoft dort erstmals app.json erzeugt.
3. Agentura ergänzt automatisch fehlende Struktur und neun Agenten-MDs, erzeugt `<Ordnername>.code-workspace` mit `folders: [{path: '.'}]` und öffnet ihn im selben Fenster. Keine nachträgliche Bestätigung, Vorschau oder Öffnen-Schaltfläche. Vorhandene Dateien bleiben unverändert.
4. BC AI Agent bewahrt Microsofts Struktur und ergänzt nur Agentura-Dokumentation und Workspace. Kein zusätzlicher `src`-Baum oder Gitignore. Diese Coding-Agent-Dokumente sind keine Business-Central-Agent-Instruktionen.
5. Manuell prüfen: AL-Quellen, app.json, launch.json und vorhandene MD-Dateien bytegleich; Workspace zeigt den gesamten Projektordner. Standard und Modular mit mehreren Modulen sowie BC AI Agent prüfen. Nach einem Microsoft-Update die tatsächlichen Projektbefehle erneut prüfen.

Ohne AL Language bzw. bei Wahl „Agentura allein“ bleibt der bestehende unabhängige Generator mit seinen bisherigen Dialogen unverändert. Auch `Setup Current Project` bleibt ein separat bestätigter Bestandsablauf.

## Sicherheit und Grenzen

Fortsetzung über `globalState` für 15 Minuten, Startup, Workspace-Ereignisse, app.json-Anlage/-Änderung und sekündliches Polling. Teilweise geschriebene JSON wird erneut geprüft. Multi-Root, Remote-Ziele, gemeldete Symlinks, unvollständige Analyse und zuvor geöffnete AL-Projekte werden nicht automatisch ergänzt. Typ-/Schreibweisenkonflikte und vorhandene Workspaces ohne relativen `.`-Projektbezug stoppen die Fertigstellung. Kein Überschreiben, Löschen oder Verschieben vorhandener Dateien.

Promise-Sperre im Host plus exklusive persistente UUID-Claim-Datei im Extension-Speicher verhindern doppelte Ausführung durch Ereignisse, Fenster oder veralteten globalState. Nach einem Teilfehler bleiben bereits erstellte Dateien erhalten, eine konkrete Fehlermeldung erscheint und es erfolgt keine automatische Wiederholung. Bei fehlgeschlagener Workspace-Öffnung wird die manuell zu öffnende URI genannt.

Microsofts Promise ist kein dokumentiertes Fertigsignal. Ein einzelner lokaler Root mit lesbarer, gültiger app.json dient als Signal. Während des offenen Ablaufs kein fremdes AL-Projekt öffnen. Ein stiller Abbruch ohne neues Projekt bleibt bis zum Ablauf ausstehend; Ablauf wird gemeldet. Ein neues Profil/Fenster ohne gemeinsamen Extension-Speicher kann nicht automatisch fortsetzen. Bei diesen Grenzen manuell `Setup Current Project` verwenden. [ADR 0004](../architecture/adr/0004-automatic-microsoft-completion.md).

## Tatsächlich ausgeführte Prüfungen

- `npm run compile`: erfolgreich gegen festgeschriebene VS-Code-Typen 1.90.0.
- `npm test`: 63 Node-Tests bestanden. Neue Flow-Tests: automatische Ergänzung/Öffnung ohne Rückfragen, Profile/Module, leeres Ausgangsroot, verzögerte/partielle app.json, Polling, parallele Ereignisse, zweiter Host mit veraltetem Zustand, Ablauf, Abbruch, Teilfehler, Öffnungsfehler und erneuter Start.
- `AL_EXTENSION_HOST_SUITE=microsoft VSCODE_EXECUTABLE='/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' npm run test:host`: erfolgreich im echten installierten VS Code. Native temporäre Ziele: Standard, Modular, BC AI Agent, relative Workspace-Datei, bytegleicher Bestand, Wiederholung ohne Creates, exklusive parallele Claims, blockierender Dateityp, vorhandener fremder Workspace, konkurrierende Zieldatei, injizierter Schreibfehler und realer Symlink.
- Vollständiges `npm run test:host`: ausgeführt, **fehlgeschlagen im unveränderten unabhängigen Generator**, `tests/host/new-project.cjs:71`. Dessen Writer stoppt bei `docs/PROJECT.md`, weil das Elternverzeichnis fehlt. Nicht Teil dieses Auftrags und nicht korrigiert. Erster Aufruf ohne absoluten VS-Code-Pfad scheiterte bereits an fehlendem `code` im PATH.
- `npm run package`: lokale VSIX erstellt; Logo und Icon-Verknüpfung im ZIP/VSIX-Manifest geprüft. Keine Veröffentlichung oder Installation vorgenommen.

**Offen:** Manuelle Bedienung des tatsächlichen Microsoft-Assistenten, echte Microsoft-Fensterübergabe und visuelle Installationsprüfung; Benutzerabnahme. Der isolierte Host enthält keine AL-Language-Installation. Die Node-Tests ersetzen Microsoft-Aufrufe, die Host-Tests prüfen Agenturas echte Dateisystemanwendung. Kein vollständiger Microsoft-End-to-End-Nachweis.


## Nachprüfung nach Benutzerfehler im Standardmodus
Die konkrete Meldung wurde auf den Claim vor der Projektanalyse eingegrenzt (kein Start-Log der Dateianlage). Der erweiterte Host-Test mit dem echten `ExtensionContext` reproduzierte: `globalStorageUri.scheme` ist `vscode-userdata`; die alte Sperre verlangte `file` und warf „Ungültiger Fortsetzungsspeicher“.

Korrektur: lokalen Desktop-Profilalias für die exklusive Sperre akzeptieren; unbekannte Schemes und Authorities weiterhin ablehnen. Native Speicherfehler werden als kontrollierter `NewProjectError` ohne Pfade weitergegeben; die UI benennt zusätzlich den fehlgeschlagenen Schritt. Vorhandene Projektdateien sind von dieser Speicherkorrektur nicht betroffen.

Erneut ausgeführt: Compile und 64 Node-Tests bestanden; echter Microsoft-Abschluss-Host prüft zusätzlich den realen Aktivierungskontext, doppelte Claims und abgewiesene Speicher-URIs. Lokale VSIX erneut gebaut. Die reale Microsoft-Bedienung bleibt separat durch den Benutzer zu prüfen; der bestehende Fehler im unabhängigen Generator bleibt unberührt.
