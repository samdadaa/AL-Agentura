# Namensumstellung — AL Agentura

01.11.2026. Ausdrücklicher Nutzerauftrag; zunächst **In Arbeit**.

## Bestand und Plan vor Codeeingriff
Git-Arbeitsverzeichnis zu Beginn sauber; EXT-002 bis EXT-005 inzwischen durch den Nutzer eingecheckt. Vorhanden sind Manifest, zwei funktionsfähige Commands, Logging, Code, Ressourcen, Tests, interne Dokumentation und ein Entwicklungs-Workspace. Diese verwenden bisher eine andere Produktidentität. Ein angemeldeter Git-Credential-Helper erlaubt lesenden GitHub-API-Zugriff mit bestätigtem Admin-Recht; die CLI gh ist nicht installiert.

Ziel: Displayname **AL Agentura**, Paket-/Repository-/Ordnername **al-agentura**, Beschreibung **AL Project Scaffolding & AI Agent Workspace Setup**, Befehlspräfix **AL Agent:**. Die beiden vorhandenen Commands erhalten passende neue IDs und Palette-Titel. Fünf weitere Wunschbefehle werden nur als geplant dokumentiert, ohne Scheinregistrierung. Der Publisher bleibt bis zu einer gesonderten Entscheidung `local-development`; vollständige lokale VS-Code-ID damit `local-development.al-agentura`.

Betroffen: Manifest/Lockfile, Command-Dateien/Composition Root, Meldungen/OutputChannel, Tests, Ressourcen und Projektdokumente sowie Debug-/Workspace-Dateinamen, GitHub-Repository/origin und lokaler Root. Keine fachlichen Generatoränderungen und keine neuen Abhängigkeiten. Risiken: veraltete Aktivierungs-/Command-IDs, Host-Extension-Lookup, alte Build-Artefakte und absolute Arbeitsverzeichnisverweise nach dem Ordnerwechsel. Testplan: Compile, sämtliche Node-Tests, echter isolierter Host, neue VSIX mit Manifest-/Ressourcenprüfung, Namenssuche, GitHub-/Remote-Prüfung und erneuter Lauf aus dem neuen Root.

Die Produktbeschreibung bezieht sich auf die Vorbereitung externer Agenten. Die Extension selbst bleibt KI-frei, offline und ohne neue Accounts/API-Kosten. Die Umbenennung ändert diese Produktgrenze nicht. GitHub wird über den dokumentierten Repository-Update-Endpunkt umbenannt; es wird nur der Name geändert, keine Sichtbarkeit, Berechtigungen oder Branches. Keine automatische Veröffentlichung oder Push der Quellcodeänderungen.

## Fortsetzung aus dem ZIP
Die lokalen Quellcode-, Workspace-, Paket- und Command-Umbenennungen sind in der Arbeitskopie vorhanden. Die Git-Arbeitskopie enthält absichtlich die uncommitteten Änderungen aus dem Nutzer-ZIP.
**Offen:** GitHub-Repository serverseitig umbenennen und `origin` aktualisieren (keine GitHub-Anmeldung in dieser Umgebung), vollständiger `npm ci`/TypeScript-Build/Extension-Host (fehlende npm-Pakete, Offline-Cache unvollständig), frische VSIX. Der lokale Ordner wurde im ZIP auf `al-agentura` normalisiert. Kein Commit, kein Branch-Wechsel, kein Push.
