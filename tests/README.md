# Tests

- `npm test`: Build und Node-Tests (`*.test.cjs`), einschließlich Command-Lebenszyklus, Wiederholung, Abbruch und Fehler ohne vertrauliche Inhalte.
- `npm run test:host`: echter installierter VS-Code-Host mit temporärem isoliertem Profil; kein zusätzlicher Test-Runner als Abhängigkeit nötig. Prüft verzögerte Aktivierung, Command-Beitrag und wiederholte Ausführung. Benachrichtigungen werden abgefangen.

Voraussetzungen und manuelle F5-Prüfung: [Lokale Entwicklung](../docs/operations/LOCAL_DEVELOPMENT.md). Tatsächliche Ergebnisse: [EXT-001](../docs/quality/EXT-001.md).

Generator-, Workspace- und Security-Integrationstests folgen in den jeweiligen Implementierungstickets und EXT-011.
