# Security Baseline
## Vertrauensgrenzen
Nutzer-Workspace, importierte Templates und `app.json` sind Eingaben und nicht vertrauenswürdig. Extension-Code ist vertrauenswürdige Implementierung, aber niemals automatisch zum Ausführen fremder Inhalte berechtigt.

## Mindestregeln
- Kein Ausführen von Code aus Vorlagen, Projekten oder hochgeladenen Markdown-Dateien.
- Relative Pfade validieren; absolute Pfade, Traversal, Symlink-Ausbrüche, NUL und unzulässige Namen abweisen.
- Schreibziel mit ausgewählter Root-URI und Workspace-Filesystem prüfen.
- Kein unbestätigtes Überschreiben, Löschen, Verschieben.
- `app.json` nicht zerstören; defekte JSON-Eingaben als Fehler behandeln.
- Geheimnisse nicht in `launch.json`, generierte Docs, Logs oder ZIPs schreiben.
- In Workspace Trust eingeschränkte Modi respektieren.
- Vorlagenimport (später) auf Dateigröße, Dateityp, Pfade und unerwünschte Platzhalter prüfen.
- Keine versteckte Telemetrie und keine Netzwerkanfragen im Kernablauf.

## Negative Tests
`../quality/TEST_STRATEGY.md` und Tickets EXT-002, EXT-009, EXT-011.
