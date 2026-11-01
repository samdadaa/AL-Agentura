# ADR 0002 — Lesende Projektanalyse und bestandsschonende Strukturpläne

**Status:** Implementiert, zur Prüfung mit EXT-003/004 (01.11.2026).

## Kontext
EXT-003 benötigt Fakten über den gewählten Zielordner, EXT-004 daraus Standard-/Modular-Struktur und Git-Regeln. Die allgemeine Vorschau-/Bestätigungs-/SafeWriter-Pipeline gehört ausdrücklich zu EXT-009. Die gemeinsame Auswahl von EXT-003/004 erweitert diesen Scope nicht.

## Entscheidung
Workspace-Auswahl und Ressourcenadapter verwenden VS-Code-URIs und `workspace.fs`; die Analyse liest ausschließlich. Ein eigener Command **Projekt analysieren** stellt die Erkennung bereits bereit. Setup bleibt bis zum Projektwizard/Writer ein ehrlicher Platzhalter. Metadaten werden nur aus der Root-`app.json` extrahiert; AL-Dateien werden anhand ihrer Pfade erfasst, ihr Inhalt wird nicht semantisch interpretiert.

Der Kontext enthält Scanvollständigkeit, Eintragsarten, bekannte Verzeichnisinhalte und Diagnosen. Gemeldete Symlinks werden nicht verfolgt. `.git`, `node_modules`, `.alpackages`, `.alcache` und `.snapshots` werden als bewusste Grenzen erfasst; ihr Inhalt bleibt unbekannt. Grenzen/Lesefehler/unsichere Namen/unbekannte Dateitypen ergeben keinen vollständigen Bestand. Ein vollständiger Scan meint Vollständigkeit innerhalb dieser expliziten Grenzen. Ein unvollständiger Scan sperrt Strukturplanung.

Der reine Planer erhält den Kontext und ein validiertes deklaratives AL-Strukturmanifest. Objekttypen können als Teilmenge ausgewählt werden; Reihenfolge und kanonische Schreibweise kommen aus dem Manifest. Modulnamen werden portabel geprüft und case-insensitiv dedupliziert, erste Schreibweise bleibt erhalten. Verzeichnisse und Dateien im Bestand bleiben erhalten. Unterschiedliche Zielarten, Schreibweisen, Symlinks oder unbekannte Elterninhalte führen zu Konflikten. Neue `.gitkeep`-Dateien sind nur in bewusst leeren Blattordnern vorgesehen. Eine bestehende `.gitignore` wird immer übersprungen; keine automatische Zusammenführung.

Produktcode erstellt nur einen Plan. Die URI-Materialisierung verwendet `Uri.joinPath` und erhält Scheme/Authority. Sie erteilt keine Freigabe und schreibt nichts. Erst EXT-009 darf nach Vorschau/Zustimmung und frischer Bestandsprüfung anwenden. Integrationstests wenden eigene Pläne ausschließlich durch einen Testfixture-Helfer auf neue temporäre Testordner an, um Wiederholbarkeit zu prüfen.

## Alternativen
- Direkte Ordneranlage in EXT-004 ohne die spätere Bestätigungspipeline würde D-010 verletzen.
- Node-fs für Zielprojekte würde Remote-/Virtual-Provider umgehen.
- AL-Inhalte fachlich auslegen oder Modulnamen als bestätigte Domänen behandeln wäre unbelegt.

## Konsequenzen
Die Analyse ist über die Command Palette benutzbar. Die Strukturplanung ist derzeit eine Entwicklungs-/Modulschnittstelle; noch keine sichtbare Strukturvorschau oder Dateianwendung. `.gitignore` ist eine lokale Empfehlung, keine Microsoft-Pflicht. Sie lässt gemeinsame `.vscode`-Dateien versionierbar und schützt ausdrücklich lokale Artefakte. Gegen Änderungen nach dem Scan schützt ein Plan allein nicht; tatsächliche Symlink-/Provider-/Root-/Bestandsprüfung muss der spätere Writer erneut durchführen.

## Migrationsfolgen
Keine Änderung des Manifest-Schemas 1, keine Migration oder Umstrukturierung vorhandener Projekte. Der neue ProjectContext ergänzt die vorhandenen Verträge. `appJsonStatus: unknown` kennzeichnet nicht untersuchte Fälle statt fälschlich fehlender Metadaten.

## Testauswirkung
Unit-Tests für Metadaten und Strukturplan; echter VS-Code-Host mit lokalen temporären Fixtures, ersetzten Auswahldialogen und einem schreibgeschützten Custom-URI-Provider. Abbruch, Scanlimits, Lesefehler, Symlinks, unvollständige Bestände, URI-Erhalt und Plan-Idempotenz werden geprüft. Kein echter SSH-Server oder manuell bediente Picker behauptet. Nachweise: [EXT-003/004](../../quality/EXT-003-004.md).

## Präzisierung durch EXT-005
[ADR 0003](0003-new-project-creation.md) erlaubt einen begrenzten bestätigten Neuprojekt-Writer ausschließlich für neue lokale file-Ziele. Für Bestand und allgemeine Plananwendung gilt weiterhin EXT-009/010. Die Aussagen oben beschreiben den Stand bei EXT-003/004.
