# Modul Quality

## Aufgabe und Status
EXT-001: Fundamenttests unter `tests/` implementiert und ausgeführt. Generator-/Security-Matrix sowie breite Workspace-Integrationstests aus EXT-011 und VSIX-Installationsabnahme aus EXT-012 bleiben geplant. `test/unit` und `test/integration` sind bisher leere Scaffold-Verzeichnisse.

## Schnittstellen und Testgrenzen
`npm test` kompiliert zuerst und prüft Aktivierung, Ressourcenfreigabe, wiederholte Aufrufe, Abbruch und unerwartete Fehler mit einer isolierten VS-Code-Nachbildung ohne Dateisystem-API. `tests/run-host.cjs` startet das installierte VS Code in einem isolierten Profil; `tests/host/index.cjs` prüft dort verzögerte Aktivierung und Command-Ausführung und schreibt einen Ergebnisnachweis ins temporäre Testverzeichnis.

Die Host-Prüfung ersetzt nur die Benachrichtigungsfunktion. Sichtbarkeit der Palette, F5-Debugger und Meldungsdarstellung werden dadurch nicht bewiesen. Tests führen keine Generator-Schreiboperationen aus.

## Nachweise
[EXT-001-Testbericht](../quality/EXT-001.md), [Teststrategie](../quality/TEST_STRATEGY.md) und [lokale Entwicklung](../operations/LOCAL_DEVELOPMENT.md). Erweiterte Datenmodelle bleiben EXT-002 vorbehalten.
