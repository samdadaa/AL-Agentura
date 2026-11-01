# Modul Quality

## Aufgabe und Status
EXT-001: Fundamenttests unter `tests/` implementiert und ausgeführt. Generator-/Security-Matrix sowie breite Workspace-Integrationstests aus EXT-011 und VSIX-Installationsabnahme aus EXT-012 bleiben geplant. `test/unit` und `test/integration` sind bisher leere Scaffold-Verzeichnisse.

## Schnittstellen und Testgrenzen
`npm test` kompiliert zuerst und prüft Aktivierung, Ressourcenfreigabe, wiederholte Aufrufe, Abbruch und unerwartete Fehler mit einer isolierten VS-Code-Nachbildung ohne Dateisystem-API. `tests/run-host.cjs` startet das installierte VS Code in einem isolierten Profil; `tests/host/index.cjs` prüft dort verzögerte Aktivierung und Command-Ausführung und schreibt einen Ergebnisnachweis ins temporäre Testverzeichnis.

Die Host-Prüfung ersetzt nur die Benachrichtigungsfunktion. Sichtbarkeit der Palette, F5-Debugger und Meldungsdarstellung werden dadurch nicht bewiesen. Die ursprünglichen EXT-001/003/004-Prüfungen führen keine Produkt-Schreiboperationen aus; EXT-005 testet zusätzlich den neuen Writer ausschließlich an eigenen temporären Fixtures.

## Nachweise
[EXT-001-Testbericht](../quality/EXT-001.md), [Teststrategie](../quality/TEST_STRATEGY.md) und [lokale Entwicklung](../operations/LOCAL_DEVELOPMENT.md). EXT-002 ergänzt `tests/templates.test.cjs` für Manifest-/Profilverträge, Versionen, Eingaben, Platzhalter, Duplikate und Pfadschutz. Reine Kernfunktionen brauchen keinen VS-Code-Mock. Ergebnisse: [EXT-002](../quality/EXT-002.md).

## EXT-003/004
`tests/project.test.cjs` ergänzt Metadatenparser, Standard-/Modular-Plan, Objekttypauswahl, Module, Marker, Gitignore-Snapshot, Konflikte und projizierte Wiederholung. `tests/host/project.cjs` nutzt echte temporäre VS-Code-Dateibestände und einen schreibgeschützten registrierten URI-Provider. Nur Auswahldialoge/-listen werden ersetzt; Markeranwendung ist ausschließlich ein Testfixture-Helfer. [Nachweis und Grenzen](../quality/EXT-003-004.md).

## EXT-005
`tests/new-project.test.cjs` ergänzt sieben Unit-Tests für Namen, Module, neue Entwürfe, relativen Workspace und inhaltstreue app.json. `tests/host/new-project.cjs` führt den tatsächlichen Setup-Command mit ersetzten Dialogen gegen temporäre lokale Ziele aus. Alle Abbruchpunkte, Konflikte, Zwischenbelegung, symlink-Eltern/-Quellen, Teilfehler, Provider-Ablehnung und Öffnen-Dispatch sind abgedeckt. Die Testgrenze für Dateifehler injiziert nur I/O-Fehler; sonst arbeitet der Writer gegen den echten nativen VS-Code-FileSystem-Provider. [EXT-005-Nachweis](../quality/EXT-005.md).
