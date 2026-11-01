# AGENTS.md — {{PROJECT_NAME}}

## Mission
Entwickle und pflege dieses AL-/Business-Central-Projekt nach vorhandenen Projektregeln. Kein Ticket ohne explizite Auswahl bearbeiten.

## Vor jeder Änderung
1. `app.json`, `TODO.md`, `docs/PROJECT.md` und `docs/CONVENTIONS.md` lesen.
2. Relevante `docs/modules/*.md`, bestehende `.al`-Objekte und Tests untersuchen.
3. Objekt-ID-Ranges, bereits belegte IDs, Namespace und Namenspräfix/-suffix prüfen.
4. Bestehende Implementierung und uncommittete Änderungen berücksichtigen.
5. Unbekannte fachliche Regeln nicht erfinden; bei Konflikten nachfragen.

## AL-Entwicklungsregeln
- Erweiterungsobjekte und Events/Subscriber entsprechend bestehender Architektur nutzen.
- Keine Objekt-ID außerhalb erlaubter Bereiche; keine ID-Duplikate.
- BC-Runtime, Dependencies, Permissions, Tests und Performance berücksichtigen.
- Datenänderungen, Buchungen, Filter, Transaktionen und Fehlerbehandlung besonders sorgfältig prüfen.
- Keine funktionierende Logik stillschweigend ersetzen oder entfernen.

## Dokumentation und Qualität
- Zuerst Modulindex prüfen; fehlende Modul-MDs bei Bedarf anlegen, Fakten nur nach Codeprüfung ergänzen.
- Nur das ausdrücklich gewählte Ticket aus `TODO.md` bearbeiten.
- Nach Änderungen Tests und betroffene Dokumentation aktualisieren.
- Status `Zur Prüfung` erst nach nachvollziehbarer Umsetzung; `Erledigt` erst nach Nutzerabnahme.
- Abschluss: Änderungen, Risiken, tatsächliche Testergebnisse, offene Punkte.
