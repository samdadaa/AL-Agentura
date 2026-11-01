# ADR 0005 — Bestandsdokumentation und bestätigte Ergänzungspläne

**Status:** Implementiert, zur Prüfung mit EXT-008 bis EXT-010 (01.11.2026).

## Kontext und Entscheidung
Die drei Tickets wurden ausdrücklich gemeinsam ausgewählt. Der bisherige Setup-Command enthielt Datei-Schreiblogik, generierte nur statische Dokumente und prüfte den Plan nach Bestätigung nicht vollständig erneut. EXT-001 bis EXT-007 sind vom Benutzer abgenommen; ihre Abnahme ist unabhängig von historischen Testgrenzen dokumentiert.

Die Bestands-Pipeline ist jetzt `inspectProject` → `detectModuleCandidates` → `planExistingProject` → URI-Adapter → Vorschau → ausdrückliche Zustimmung → erneute Analyse und Planvergleich → `applyExistingProject` → Ergebnis. Commands/UI schreiben keine Projektdateien. Microsofts automatischer Neuprojekt-Abschluss aus ADR 0004 bleibt separat und unverändert.

## Modulbelege und Dokumentation
Kandidaten beruhen ausschließlich auf AL-Dateipfaden und Eltern bekannter Objektordner. `src`/`app` sind Container; reine Typordner und Root-AL-Dateien werden nicht als Fachmodule erfunden. Verschachtelte Kandidaten erhalten disjunkte Dateilisten am nächsten belegten Elternpfad. Der Index nennt Quelle, Pfad, Dateianzahl und offenen fachlichen Status. Modulgerüste entstehen nur für explizit ausgewählte Kandidaten unter `docs/modules/details/<Originalpfad>.md`. Fachlicher Zweck, Datenflüsse, Abhängigkeiten und Tests bleiben offen.

`docs/modules/DISCOVERY.md` erhält die konkreten Strukturbelege neben einem vorhandenen, unveränderten Index. `docs/GAPS.md` nennt Lücken; `AGENT_INITIALIZATION.md` enthält einen kopierbaren Prompt zur schrittweisen Verifikation ohne automatische Ticketbearbeitung. Alle bestehenden Dokumente bleiben erhalten, auch von früheren Agentura-Versionen. Wiederholung aktualisiert keine bestehenden Erkenntnisse automatisch.

Neue Vorlagen sind deklarative Markdown-Dateien in `resources/templates/existing-project/`, Schema 1 / Version 1.0.0, mit expliziten Tokenverträgen und einmaliger literaler Ersetzung. `docs/PROJECT.md` enthält ausschließlich erkannte app.json-Metadaten. Keine KI oder Skriptausführung.

## Bestands- und Dateischutz
Standardauswahl „Bestehende Struktur bewahren“ ergänzt nur fehlende Dokumentation und Gitignore. Standard-/Modulordner erfordern eine ausdrückliche zusätzliche Profilwahl. AL-Dateien, app.json, Launch-Konfiguration, vorhandene Gitignore und MD-Dateien sind ausschließlich Skip-Ziele. Pfad-/Typ-/Schreibweisen-/Symlink-Konflikte sind in der Vorschau sichtbar und blockieren die gesamte Anwendung; ein Merge ist nicht implementiert.

Der reine Plan trägt relative Ziele, Art, Aktion, Grund und neue Inhalte. Der Adapter ergänzt URI-Ziele ohne Scheme-/Authority-Verlust. Ein Struktur-/Metadaten-Snapshot und vollständiger Planvergleich nach Zustimmung erkennen neue Dateien, gelöschte Pfade, neue Konflikte und geänderte erkannte Metadaten. Inhalte übersprungener Dateien werden nicht umgeschrieben; deren alleinige Textänderung muss die Anlage anderer fehlender Dateien nicht blockieren.

Vor Anwendung: Plan und Ziel-URIs validieren, lokale Schreibfähigkeit und komplette Elternkette prüfen, frischen Plan vergleichen. Vor jedem Create: Elternkette und fehlendes Ziel erneut prüfen. Native `workspace.fs.copy` mit `overwrite:false` aus einem privaten OS-Scratch erhält konkurrierende Dateien. Node fs erstellt nur diesen Scratch, niemals Zielprojektdateien. Keine temporären Dateien im Projekt, keine Löschungen oder Rollbacks von Projektbestand. Teilfehler nennen bestätigte Creates, Skips und gestoppten Pfad; Scratch-Bereinigungsfehler werden ausdrücklich gemeldet. Command- und Writer-Sperren verhindern parallele Anwendung im selben Host; fremde Fenster werden durch Existenzprüfung/native Copy ohne Überschreiben begrenzt.

## Providergrenze
Analyse und Planung erhalten Remote-/Virtual-URIs. Schreiben bleibt wegen der in ADR 0003 nachgewiesenen Race-Lücke im providerübergreifenden Copy-Fallback auf native lokale `file`-Ziele ohne Authority begrenzt. Fremdprovider werden vor Target-Schreibvorgängen abgewiesen. Die öffentliche API hat kein exklusives mkdir; ein gleichzeitig entstehendes leeres Directory kann nicht atomar als fremd unterschieden werden. Dateien werden trotzdem nicht ersetzt.

## Prüfungen
[Prüfbericht EXT-008 bis EXT-010](../../quality/EXT-008-010.md): pure Unit-Tests und echte temporäre Workspaces einschließlich Abbruch, Wiederholung, Bytevergleich, Konflikten, Stale/Race, Schreibfehler, Symlink, eingeschränktem Provider und Command-Integration. APIs gegen `@types/vscode` 1.90.0 kompiliert (`showQuickPick` mit `canPickMany`, `workspace.fs`, `openTextDocument`, `showTextDocument`, URI-API). Benutzerabnahme der neuen Tickets bleibt separat.
