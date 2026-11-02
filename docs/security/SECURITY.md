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


## V1 — Restricted Mode und Release-Werkzeuge
Das Manifest deklariert eingeschränkte Unterstützung untrusted Workspaces. Microsoft-Projektbefehle und der manuelle AL-Integrationstest werden vor Extension-Aktivierung blockiert, solange `workspace.isTrusted === false`. Eigene Analyse/Planung und bestätigte lokale Textvorlagen führen keinen Workspace-Code aus. Der echte Host prüft diese Trennung.

Die Extension hat keine Runtime-Abhängigkeiten. Entwicklungswerkzeuge werden per Lockfile festgeschrieben und mit `npm audit` geprüft. vsce 4.1.0 verwendet ein auf diesen Build beschränktes minimatch-Override 11.0.1 zur Behebung von GHSA-g3hv-75wg-m249. Audit ist eine Momentaufnahme; vor Veröffentlichung erneut ausführen. Download-/Test-/Paketierungswerkzeuge unter `scripts/` werden nicht mit ausgeliefert. Das CI-Workflow enthält keinen Veröffentlichungs- oder Credential-Schritt.
