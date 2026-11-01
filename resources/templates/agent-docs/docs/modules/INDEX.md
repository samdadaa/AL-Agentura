# Modulindex — {{PROJECT_NAME}}

> Die Extension erzeugt **keine erfundenen Module**. Dieser Index ist für später anhand des tatsächlichen AL-Codes zu pflegen. `EXT-008` kann die Modulanlage systematisieren; dieser Text selbst ist bereits mit EXT-007 verwendbar.

## Arbeitsweise

1. `app.json` lesen und die reale `src/`-Struktur prüfen.
2. Ordner oder Objektgruppen als *potenzielle* Module erfassen, ohne Geschäftslogik aus Namen abzuleiten.
3. Bestätigte Verantwortung anhand von Tabellen, Codeunits, Pages, APIs und Events verifizieren.
4. Verifizierte Module hier verlinken; fehlende Details als **Zu prüfen** stehen lassen.
5. Änderungen an Schnittstellen, Ereignissen und Modulgrenzen gemeinsam mit den Ticketänderungen aktualisieren.

## Übersicht

| Modul | Zweck | Einstieg / Pfad | Kernobjekte | Abhängigkeiten | Fachlich bestätigt? |
| --- | --- | --- | --- | --- | --- |
| Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen | Nein |

## Vorlage für eine spätere Moduldatei

> Für künftige `docs/modules/<Modulname>.md`: **Verantwortung**, **bestätigter fachlicher Ablauf**, **betroffene AL-Objekte mit IDs**, **öffentliche APIs/Events**, **Berechtigungen**, **Datenfluss/Transaktionen**, **Abhängigkeiten**, **relevante Tickets und Tests**, **offene Fragen**. Nur belegte Informationen eintragen.

## Regeln

- Standardprofil `src/<Objekttyp>` bezeichnet Objektarten, keine eigenständigen fachlichen Module.
- Modularprofil `src/<Modul>/<Objekttyp>` ist eine deklarierte Struktur, belegt aber noch keine implementierte Logik.
- Existierende Dateien nicht wegen eines Modulindexes verschieben oder umbenennen.

Quelle: https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-code-style/
