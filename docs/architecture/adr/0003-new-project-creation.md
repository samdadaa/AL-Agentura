# ADR 0003 — Begrenzte Neuprojekt-Erstellung vor dem allgemeinen SafeWriter

**Status:** Implementiert, zur Prüfung mit EXT-005 (01.11.2026).

## Kontext
EXT-005 verlangt einen benutzbaren Neuprojekt-Wizard mit tatsächlicher Zielanlage und Workspace-Öffnung. ADR 0002 verschiebt pauschal jede Anwendung auf EXT-009; das kollidiert mit dem bereits ausgewählten EXT-005. Die vorhandenen Strukturpläne, URI-Resolver und Profile sind implementiert; ein allgemeiner Writer fehlt.

## Entscheidung
EXT-005 erhält einen ausschließlich für neue, noch nicht vorhandene Zielordner verwendbaren Writer. Der Wizard sammelt Elternordner, portablen Namen, Profil, Module und optional eine ausdrücklich ausgewählte app.json-Quelle. Eine Textvorschau zeigt den Zielroot und sämtliche Operationen. Nur ausdrückliche Zustimmung startet Schreiboperationen. Bestehende Zielordner werden auch bei Leere abgewiesen, nicht ergänzt. Bestandsprojektvorschau, Merge, selektive Konfliktauflösung und der allgemeine Writer bleiben EXT-009/010.

Die Workspace-Datei liegt im neuen Projektroot und referenziert diesen relativ mit `folders: [{ path: '.' }]`. Öffnen über `vscode.openFolder` erfolgt auf gesonderte Nutzerwahl in einem neuen Fenster. Einstieg und Ergebnisübersicht unterscheiden vollständige Anlage von Teilfehlern und ausstehender AL-Konfiguration.

Die Neuanlage akzeptiert derzeit ausschließlich native lokale `file`-Ziele ohne Authority. Andere Provider werden vor jeder Zielanlage explizit abgewiesen. Ein Host-Race-Test zeigte, dass VS Codes providerübergreifender Copy-Fallback zwischenzeitlich erschienene Ziele trotz `overwrite: false` ersetzen kann. Deshalb wird Dateiinhalt in einem exklusiven OS-Temp-Verzeichnis (Unix: 0700) bereitgestellt und anschließend über denselben nativen File-Provider per `workspace.fs.copy(..., { overwrite: false })` in den neuen Root kopiert. Node `fs.mkdtemp` dient ausschließlich diesem privaten Scratch-Verzeichnis, niemals Zielprojekten. Sämtliche Zieloperationen erfolgen mit `workspace.fs`. Kein direktes writeFile auf eine Zielprojektdatei, kein Überschreiben/Löschen/Verschieben. Provider, Root-/Elternverzeichnisse, gemeldete Symlinks und Bestand werden vor Erstellung und jeder Operation geprüft. Teilfehler lassen bereits angelegte Dateien erhalten und werden mit Umfang gemeldet; kein destruktiver Rollback. FileSystem-Provider müssen die Copy-overwrite-Semantik respektieren. Die öffentliche API bietet kein exklusives mkdir: ein konkurrierend auftauchender nichtleerer Root wird abgewiesen; eine kurz zuvor erzeugte leere Directory lässt sich nicht atomar als fremd unterscheiden. Dateien werden trotzdem niemals bewusst ersetzt.

## AL-Konfiguration und Alternativen
Die Extension erzeugt in EXT-005 keine eigene app.json und keine launch.json. Eine ausgewählte, lesbare UTF-8-app.json wird strukturell geprüft und inhaltstreu kopiert; Quelle bleibt unverändert. Ohne Quelle entsteht ausdrücklich nur ein vorbereiteter Workspace, noch keine kompilierbare AL-App. Eigene konfigurierbare AL-Metadaten folgen in EXT-006.

`AL: Go!` erzeugt selbst Konfiguration; Microsoft dokumentiert dafür einen neuen leeren Ordner. Deshalb wird es weder automatisch aufgerufen noch zum Überschreiben des vorbereiteten Roots empfohlen. Nutzer können damit getrennt eine Konfiguration erzeugen und deren app.json bewusst übernehmen. Ein bereits vorhandenes Zielprojekt wird abgewiesen statt automatisch von AL: Go! oder eigenem Generator geändert. Quelle: [Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-get-started-al-for-onprem), [JSON-Dateien](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-json-files).

## Konsequenzen und Migrationsfolgen
ADR 0002 wird ausschließlich für die bestätigte Neuprojekt-Anlage konkretisiert. Keine Migration oder Änderung vorhandener AL-Projekte, keine neue Abhängigkeit, kein Aufruf externer Skripte und keine KI. Für Bestandsprojekte bleibt die bisherige Grenze bestehen. Das vorbereitete Projekt erhält eine kurze statische Einstiegsdatei; vollständige Agenten-Dokumentation bleibt EXT-007.

## Testauswirkung
Unit: Namen, Module, deterministische Pläne, relativer Workspace, inhaltstreue app.json. Echter Host: kompletter Wizard mit ersetzten Eingabedialogen, ohne geöffneten Workspace, Abbruch in jedem Schritt, Zielkonflikt, erneuter Aufruf, Race/Schreibfehler, abgewiesene Fremdprovider, Teilfehler und Öffnen-Dispatch. Keine manuelle Picker- oder F5-Prüfung daraus ableiten. API-Prüfung: lokale Typen 1.90.0 und [VS-Code-Referenz](https://code.visualstudio.com/api/references/vscode-api).
