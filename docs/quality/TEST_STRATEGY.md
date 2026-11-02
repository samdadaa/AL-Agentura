# Teststrategie
## Testpyramide
1. Unit: Parser, Manifest, Pfadvalidierung, Platzhalter, Profil, deterministischer GenerationPlan.
2. Integration: VS-Code-Host mit echten Workspace-URIs; neue/leere/bestehende AL-Projekte.
3. Manuell: macOS/Windows, F5 und lokal installierte VSIX, Standard/Modular, Remote-Workspace soweit unterstützt.

## Kritische Matrix
- Leerer Ordner, gültige/ungültige `app.json`, mehrere Roots, schreibgeschütztes Ziel.
- Vorhandene `AGENTS.md`, `TODO.md`, `.gitignore`, `app.json` dürfen nicht verändert werden.
- Zweiter Setup-Lauf ist idempotent.
- Benutzerabbruch vor Bestätigung: **0 Schreibvorgänge**.
- `../` und absolute Zielpfade werden blockiert.
- Fehlender Objekt-ID-Bereich wird abgefragt, nicht erfunden.
- Modular mit 0, 1 und mehreren Modulen; Duplikate und ungültige Modulnamen.
- Unvollständige Erstellung wird korrekt als teilweise fehlgeschlagen gemeldet.

## Nachweisformat
Ticket-ID, Build-/Testkommando, Datum, Umgebung, Ergebnis, offene manuelle Abnahme. Kein `[x]` als Ersatz für Nachweise.


## V1-Gesamtprüfung
`npm run verify` ist das technische Gate. Erforderlich sind Node >=22, ein installiertes Desktop-VS-Code und Registry-Zugriff für Audit. Die Extension selbst bleibt offline. Hash-gebundene Nachweise liegen in `artifacts/quality/`, Paket unter `al-agentura-1.0.0.vsix`. Einzelne Suites können gezielt über `test:host`, `test:host:microsoft`, `test:restricted` und `test:installed` gestartet werden. `test:installed` setzt ein gebautes VSIX voraus.

Der reale Restricted-Mode-Host darf Workspace Trust nicht durch einen Mock ersetzen. Der Installationshost muss die URI des normalen installierten Produkts prüfen. Vorlagen-/Quell-/Paketänderungen erfordern neue Nachweise. [EXT-011-Matrix](EXT-011.md) und [manuelle Plattformabnahme](../operations/MARKETPLACE.md) unterscheiden automatische, visuelle und fachliche Tests.
