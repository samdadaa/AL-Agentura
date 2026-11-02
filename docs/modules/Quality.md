# Modul Quality

## Aufgabe und Status
EXT-001: Fundamenttests unter `tests/` implementiert und ausgeführt. Generator-/Security-Matrix und breite Workspace-Integrationstests sind durch EXT-011 umgesetzt; EXT-012 ergänzt die sichtbare VSIX-Abnahme und Installationsanleitung. `test/unit` und `test/integration` sind bisher leere Scaffold-Verzeichnisse.

## Schnittstellen und Testgrenzen
`npm test` kompiliert zuerst und prüft Aktivierung, Ressourcenfreigabe, wiederholte Aufrufe, Abbruch und unerwartete Fehler mit einer isolierten VS-Code-Nachbildung ohne Dateisystem-API. `tests/run-host.cjs` startet das installierte VS Code in einem isolierten Profil; `tests/host/index.cjs` prüft dort verzögerte Aktivierung und Command-Ausführung und schreibt einen Ergebnisnachweis ins temporäre Testverzeichnis.

Die Host-Prüfung ersetzt nur die Benachrichtigungsfunktion. Sichtbarkeit der Palette, F5-Debugger und Meldungsdarstellung werden dadurch nicht bewiesen. Die ursprünglichen EXT-001/003/004-Prüfungen führen keine Produkt-Schreiboperationen aus; EXT-005 testet zusätzlich den neuen Writer ausschließlich an eigenen temporären Fixtures.

## Nachweise
[EXT-001-Testbericht](../quality/EXT-001.md), [Teststrategie](../quality/TEST_STRATEGY.md) und [lokale Entwicklung](../operations/LOCAL_DEVELOPMENT.md). EXT-002 ergänzt `tests/templates.test.cjs` für Manifest-/Profilverträge, Versionen, Eingaben, Platzhalter, Duplikate und Pfadschutz. Reine Kernfunktionen brauchen keinen VS-Code-Mock. Ergebnisse: [EXT-002](../quality/EXT-002.md).

## EXT-003/004
`tests/project.test.cjs` ergänzt Metadatenparser, Standard-/Modular-Plan, Objekttypauswahl, Module, Marker, Gitignore-Snapshot, Konflikte und projizierte Wiederholung. `tests/host/project.cjs` nutzt echte temporäre VS-Code-Dateibestände und einen schreibgeschützten registrierten URI-Provider. Nur Auswahldialoge/-listen werden ersetzt; Markeranwendung ist ausschließlich ein Testfixture-Helfer. [Nachweis und Grenzen](../quality/EXT-003-004.md).

## EXT-005
`tests/new-project.test.cjs` ergänzt sieben Unit-Tests für Namen, Module, neue Entwürfe, relativen Workspace und inhaltstreue app.json. `tests/host/new-project.cjs` führt den tatsächlichen Setup-Command mit ersetzten Dialogen gegen temporäre lokale Ziele aus. Alle Abbruchpunkte, Konflikte, Zwischenbelegung, symlink-Eltern/-Quellen, Teilfehler, Provider-Ablehnung und Öffnen-Dispatch sind abgedeckt. Die Testgrenze für Dateifehler injiziert nur I/O-Fehler; sonst arbeitet der Writer gegen den echten nativen VS-Code-FileSystem-Provider. [EXT-005-Nachweis](../quality/EXT-005.md).


## EXT-011 / V1
Aktueller Vertrag: [ADR 0006](../architecture/adr/0006-v1-quality-release.md). `npm run verify` führt reguläre Node-Tests mit Zähl-/Hash-Nachweis, Audit, vollständigen Host, Microsoft-Speicher/Adapter, echten Restricted Mode, native VSIX-Prüfung und eine isolierte Installation des Pakets aus. `scripts/check-release.cjs` blockiert fehlende/veraltete Nachweise und vom Installationstest abweichende Artefakte. Der zusätzliche Testtreiber wird ausschließlich im isolierten Profil verwendet; er ist nicht im VSIX.

Die Neuprojektmatrix umfasst Konfigurationsgenerierung, Launch-Eltern, alle Abbrüche und Bereinigungsfehler; alte Compiler-Ausgaben werden erkannt/entfernt. CI prüft die Matrix künftig auf macOS, Windows und Linux sowie minimalem VS Code, enthält aber keinen Publish-Schritt. [Testmatrix und tatsächliche Ergebnisse](../quality/EXT-011.md), [manuelle Abnahme und Upload](../operations/MARKETPLACE.md).


## EXT-012 / Lokale VSIX-Abnahme
`npm run smoke:manual` installiert das vorhandene Paket mit normalen VS-Code-CLI-Befehlen in eigene User-/Extensions-Verzeichnisse unter `artifacts/manual-smoke-*` und öffnet einen Demo-Workspace. Wiederholungen erhalten getrennte Ziele; persönliche Profile bleiben unberührt. `--no-open` bereitet nur die Installation vor. Fehler werden mit Exitcode gemeldet; `artifacts/manual-smoke-latest.json` bewahrt den Pfad auch bei Startfehlern.

Der Paketprüfer kontrolliert jetzt auch alle Bilddateien bytegenau; `assets` gehört zum Quellfingerprint. Node-Tests sichern Isolation/Wiederholung, fehlendes Paket und die drei PNG-/README-Verknüpfungen. Reale Screenshots, sichtbare Prüfungen und Grenzen stehen im [EXT-012-Bericht](../quality/EXT-012.md). Keine Änderung der Produktarchitektur; ADR 0006 bleibt maßgeblich.


Upload-Korrektur EXT-012: Die VSIX-Prüfung liest den PNG-IHDR des tatsächlich verpackten Icons und weist leere/ungültige Header sowie Abmessungen außerhalb 1–1024 Pixel je Achse ab. Grenz- und Negativtests sichern den Marketplace-Fehlerfall. Das Paketprotokoll enthält die geprüften Abmessungen; Bildkompression allein genügt nicht.
