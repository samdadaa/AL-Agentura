# Einstieg für Entwickler — {{PROJECT_NAME}}

Diese Dateien machen ein **AL-/Business-Central-Projekt für externe Coding-Agenten vorbereitbar**. AL Agentura stellt die Struktur und die Markdown-Vorlagen bereit, führt aber **keine KI selbst aus** und garantiert nicht, dass ein Agent die Dokumente automatisch erkennt. Den Startprompt im verwendeten Agenten bewusst senden.

## Verzeichnis und Zweck

| Datei | Nutzen |
| --- | --- |
| `app.json` | Echte App-Konfiguration; maßgeblich für ID-Bereiche/Abhängigkeiten, falls vorhanden |
| `AGENTS.md` | Verbindliche Agent-Arbeitsregeln und Grenzen |
| `TODO.md` | Einzeln beauftragbare Tickets mit Abnahme |
| `docs/PROJECT.md` | Fachlicher Kontext, bekannte Fakten, offene Angaben |
| `docs/ARCHITECTURE.md` | Reale Architektur und Datenflüsse |
| `docs/CONVENTIONS.md` | AL-Konventionen, Dateinamen, IDs und Format |
| `docs/SECURITY.md` | Berechtigungen, Secrets, Daten- und Umgebungsgrenzen |
| `docs/TESTS.md` | Teststrategie, Ausführung und Nachweise |
| `docs/modules/INDEX.md` | Übersicht der tatsächlich nachgewiesenen Module |

## Erste zehn Minuten

1. Workspace öffnen und AL Language Extension prüfen. Bei neuem Projekt kontrollieren, dass `app.json` tatsächlich existiert und mit der vorgesehenen BC-Version kompatibel ist. Ohne valide Konfiguration ist nicht garantiert, dass kompiliert werden kann.
2. `docs/PROJECT.md` um verifizierte Informationen ergänzen; unklare Angaben als **Zu prüfen** stehen lassen.
3. Gewünschtes Strukturprofil verstehen: Typ-Ordner (`src/Tables`) oder modular (`src/<Modul>/Tables`). Bestehende Dateien nicht automatisch verschieben.
4. `docs/CONVENTIONS.md` mit vorhandenen Präfixen, ID-Ranges und Namensregeln abgleichen.
5. `TODO.md` öffnen, genau **ein** konkretes Ticket auswählen und ausdrücklich beauftragen.
6. Nach Agentenarbeit Diff, echte Testergebnisse, unbekannte Punkte und Ticketstatus überprüfen.

## Startprompt (beliebiger Coding-Agent)

> Lies `AGENTS.md` und die dort angegebene Projektdokumentation. Prüfe `app.json`, den realen Code und `TODO.md`. Bearbeite ausschließlich Ticket `AL-001` nach den Regeln. Erfinde keine Projektfakten, überschreibe nichts ungefragt und führe keine Git-Branches/Commits/Pushes aus. Dokumentiere echte Prüfungen und setze das Ticket maximal auf `Zur Prüfung`.

**Für ein neues Feature:** Vor dem Start `AL-001` durch die konkrete Ticket-ID ersetzen und im Ticket fachliche Szenarien, Akzeptanzkriterien und Testweg beschreiben. Ohne beauftragtes Ticket nicht automatisch entwickeln lassen.

## Qualität vor Freigabe

- Ist der Scope eingehalten? Sind nur erwartete Dateien geändert? AL-IDs frei und innerhalb zulässiger Bereiche?
- Sind Projektfakten durch Dateien belegbar? Keine erfundene Zielversion, Geschäftslogik oder erfolgreich gemeldete Tests?
- Stimmen Dependencies, Runtime und verfügbare Erweiterungspunkte zur Zielversion?
- Wurden vorhandene Tests durchgeführt? Falls nicht: warum und welche manuelle Prüfung ist nötig?
- Liegt keine sensible Information in Code, Dokumentation oder Logs?
- Erst **nach eigener Prüfung** Ticket abschließen.

## Fehlerbilder und Abhilfe

- **Agent ignoriert Regeln:** `AGENTS.md` mit explizitem Dateipfad im Prompt nennen; Agent-/IDE-Konfiguration prüfen.
- **Agent erfindet Geschäftslogik:** stoppen, `TODO.md` mit realem Ist-/Soll-Verhalten und Beispielen präzisieren.
- **Agent verschiebt Dateien:** Änderung zurückhalten und bestehende Konvention bestätigen.
- **Build funktioniert nicht:** prüfen, ob SDK/AL Language, echte `app.json`, Abhängigkeiten, Symbole und Sandbox vorhanden sind; keinen erfolgreichen Compile behaupten.
- **Testprojekt unklar:** AL-Go App/Test-Trennung nur anwenden, wenn dieses Projekt tatsächlich entsprechend aufgebaut ist.

Quellen: https://alguidelines.dev/docs/agentic-coding/ und https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/
