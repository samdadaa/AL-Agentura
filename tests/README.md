# Tests

- `npm test`: Build und Node-Tests (`*.test.cjs`), einschließlich Command-Lebenszyklus, Wiederholung, Abbruch und Fehler ohne vertrauliche Inhalte.
- Nach dem Build gezielt `node --test tests/templates.test.cjs`: Manifest-/Profilverträge, Versionen, Defaults, Platzhalter, Komposition, Duplikate und Pfadschutz (EXT-002).
- `npm run test:host`: echter installierter VS-Code-Host mit temporärem isoliertem Profil; kein zusätzlicher Test-Runner als Abhängigkeit nötig. Prüft verzögerte Aktivierung, Command-Beitrag und wiederholte Ausführung. Benachrichtigungen werden abgefangen.

Voraussetzungen und manuelle F5-Prüfung: [Lokale Entwicklung](../docs/operations/LOCAL_DEVELOPMENT.md). Tatsächliche Ergebnisse: [EXT-001](../docs/quality/EXT-001.md).

Weitere Ergebnisse: [EXT-002](../docs/quality/EXT-002.md).

Generator-, Workspace- und Security-Integrationstests folgen in den jeweiligen Implementierungstickets und EXT-011.

EXT-003/004: `tests/project.test.cjs` prüft Metadaten und reine Strukturpläne/Gitignore. `tests/host/project.cjs` ergänzt echte temporäre Dateibestände, ersetzte Picker, Analyse-Command, einen schreibgeschützten URI-Provider und Testfixture-Idempotenz. Kein Produkt-Writer; keine echte SSH-Verbindung oder manuelle Pickerbedienung behauptet. [Ergebnisse](../docs/quality/EXT-003-004.md).

EXT-005: `tests/new-project.test.cjs` prüft neue Entwürfe; `tests/host/new-project.cjs` führt Wizard und Writer auf eigenen temporären lokalen Zielen aus. UI-Eingaben/Workspace-Öffnen werden abgefangen, Dateianlage ist real. Sieben Abbruchstellen, Quelle/Ziel, Zwischenbelegung, Fehler/Teilstatus, echte Symlinks und gesperrte Fremdprovider werden geprüft. [Nachweis](../docs/quality/EXT-005.md).
