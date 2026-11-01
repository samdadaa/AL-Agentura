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
