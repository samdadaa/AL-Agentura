# ADR 0007 — Microsoft-Fortsetzung an ein ausdrückliches Projektziel binden

**Status:** Implementiert, zur Prüfung (02.11.2026), ausdrücklicher Fehlerkorrekturauftrag.

## Fehler und Entscheidung
ADR 0004 schloss nur die im Startfenster bekannten AL-Roots aus. `globalState` ist zwischen Fenstern geteilt. Ein anderes Bestandsfenster konnte daher die Fortsetzung übernehmen und sein eigenes Projekt ergänzen. Eine exklusive Claim-Datei verhindert doppelte Ausführung, beweist aber nicht das richtige Ziel.

Vor Aufruf des Microsoft-Befehls wählt der Anwender deshalb den exakten lokalen Projektordner ohne vorhandene `app.json` mit `window.showOpenDialog`. Im Microsoft-Assistenten muss derselbe Ordner verwendet werden. Pending speichert `targetRoot` als vollständige URI. Nur ein Fenster mit genau diesem einzelnen Workspace-Root darf nach lesbarer `app.json` die Sperre erwerben und ergänzen. Der fertige Workspace wird dort mit `forceReuseWindow` geöffnet. Andere Roots und Multi-Root-Fenster werden ignoriert, ohne Claim oder Projektzugriff durch den Writer. Alte Fortsetzungen ohne Zielbindung werden verworfen. URI und Root werden nach der asynchronen Metadatenprüfung erneut abgeglichen.

Dies ersetzt die heuristische Root-Ausnahme aus ADR 0004. Keine erfundenen Parameter für Microsoft-Befehle und kein Raten des neuen Ordners: eine dokumentierte Ziel-/Abschluss-API steht nicht zur Verfügung. Ein abweichend gewähltes Microsoft-Ziel wird nicht automatisch ergänzt; manuelles Setup bleibt möglich. Zielauswahlabbruch startet Microsoft nicht. Untrusted-/Provider-/Symlink-/Skip-Schutz bleibt bestehen.

## Dokumente bei Neuanlage
Beide modularen Neuanlagewege verwenden dieselbe deklarative Modulvorlage und erzeugen `docs/modules/details/src/<Modul>.md` plus verlinktem Index. Modulnamen stammen ausschließlich aus ausdrücklicher Auswahl, Fachinhalte bleiben zu prüfen. Die gemeinsame Agenten-Dokumentvorlage enthält nun `README.md`; alle schreibenden Setup-/Neuanlagewege ergänzen sie additiv. Lesende Befehle bleiben lesend.

## API und Nachweise
`showOpenDialog`, `workspaceFolders`, `globalState`, `Uri` und `executeCommand` sind in den installierten VS-Code-1.90-Typen vorhanden; regulärer Compile prüft diese Baseline. Referenz: [offizielle VS-Code-API](https://code.visualstudio.com/api/references/vscode-api). Tests und verbleibende manuelle Prüfungen: [Fehlerkorrekturbericht](../../quality/PROJECT-CREATION-FIXES.md).
