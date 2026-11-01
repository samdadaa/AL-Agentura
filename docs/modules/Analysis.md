# Modul Analysis

## Status und Verantwortung
EXT-003 ist implementiert, zur Prüfung. `src/analysis/appJson.ts` extrahiert beobachtete Metadaten, `src/analysis/inspectProject.ts` liest den gewählten Root ausschließlich über `vscode.workspace.fs`. Keine AL-Inhalte oder Scripts werden ausgeführt, keine Geschäftslogik interpretiert.

## Modelle und Regeln
`src/core/projectModels.ts` definiert `ProjectContext`, `ProjectEntry`, `ProjectIssue` und `ALAppMetadata`. Der Kontext enthält Root-URI, Zustand, app.json-Status/Metadaten, relative Bestandseinträge, AL-Dateipfade, Objektordner, Strukturkandidaten, Diagnosen und `scanComplete`.

- `new`: vollständig gelesener leerer Root.
- `existing`: lesbare Root-app.json mit identifizierenden Metadaten und vollständiger Scan innerhalb seiner expliziten Grenzen. Kein Beweis für AL-Kompilierbarkeit.
- `incomplete`: andere nichtleere Ordner, AL ohne Root-app.json, ungültige/unerkennbare Metadaten oder Scanfehler/-limits.

`appJsonStatus` unterscheidet `missing`, `valid`, `invalid`, `unknown`. Unbekannt wird nicht als fehlend ausgegeben. `valid` betrifft lesbares JSON und die Typen erkannter Felder, keine vollständige AL-Schemavalidierung. Kopiert werden nur vorhandene Strings für ID, Name, Publisher, Version, Runtime, ganzzahlige geordnete ID-Bereiche sowie erkannte Dependency-Strings; keine erfundenen Defaults. Weitere Felder bleiben unbewertet. Doppelte JSON-Feldnamen und falsche Metadatentypen führen zu einer festen Diagnose. UTF-8 und optionales BOM werden unterstützt.

Standardlimits: 10.000 Einträge, 32 Verzeichnisebenen, 1 MiB app.json. Scan sortiert deterministisch, folgt keinen gemeldeten Symlinks und liest nur den Inhalt der Root-app.json. AL-Dateien werden anhand `.al` case-insensitiv erkannt. Bekannte Objekttypen stammen aus den ausgelieferten Manifesten. Ein Ordner `src/<Name>/<bekannter Objekttyp>` ergibt einen **Strukturkandidaten** mit Quelle `directory-structure`, keine bestätigte Fachdomäne.

`.git`, `node_modules`, `.alpackages`, `.alcache`, `.snapshots` werden erfasst und nicht betreten. Ihr `childrenKnown` bleibt false. Nicht lesbare/unsichere/unbekannte Einträge und Limits machen den gesamten Scan unvollständig; der Strukturplaner lehnt ihn ab. Ein bekannter Symlink wird als Grenze/Diagnose erfasst; kein automatisches Folgen oder Umstrukturieren. Änderungen zwischen Scan und späterem Schreiben muss der spätere SafeWriter erneut prüfen.

## Benutzung und Tests
Command `alAgentura.analyzeExistingProject` (**AL Agent: Analyze Existing Project**) orchestriert Auswahl, Profile und Inspector, meldet Status/Zahlen/Diagnosen und gibt den Kontext an programmatische Command-Aufrufer zurück. Logs enthalten nur feste Betriebsnachrichten. Kein Schreiben bei Analyse oder Abbruch.

Unit-Parserfälle sowie echter Host mit lokalen Fixtures und schreibgeschütztem URI-Provider: [Testnachweis](../quality/EXT-003-004.md). Fachliche Modul-Dokumentation bleibt EXT-008; tieferer Projektcheck EXT-014; AL-Konfigurationsvalidierung EXT-006.


## Modulbelege für Bestandsprojekte (EXT-008, zur Prüfung)
`core/moduleDocumentation.ts` aggregiert die erfassten Objektordner und AL-Dateipfade zu Kandidaten mit Quelle `directory-structure` / `al-file-paths`. Container `src`/`app` und reine Objektordner werden nicht als fachliche Module erfunden. Dateien werden dem nächsten erkannten Modulpfad zugeordnet, damit verschachtelte Kandidaten keine doppelte Objektzuordnung behaupten. Nur ausgewählte Kandidaten erhalten Gerüste; Index, Erkennungsbericht und Lückenliste enthalten offene Fachfragen. Kein Lesen/Ausführen von AL-Code, keine behauptete Geschäftssemantik. Die ursprünglichen Inspector-Modelle bleiben kompatibel. [ADR 0005](../architecture/adr/0005-existing-project-generation.md).
