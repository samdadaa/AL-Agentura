# Architektur — {{PROJECT_NAME}}

> Beschreibung nur anhand des realen AL-Quellcodes und bestätigter Anforderungen ergänzen. Ein Ordnername allein ist kein Nachweis einer fachlichen Modulgrenze.

## Architekturprinzipien

- Erweiterungen über AL-Extensions, vorhandene veröffentlichte Events und unterstützte Schnittstellen; keine Standard-App-Quelländerungen.
- Fachliche Regeln möglichst klar von Darstellung/UI-Triggern trennen; Codeunits für wiederverwendbare Vorgänge prüfen.
- Für öffentlich verwendete APIs und Events stabile Verträge, Fehlerreaktionen, Berechtigungen und Upgrade-Fähigkeit berücksichtigen.
- Datenflüsse und Seiteneffekte explizit erfassen; bei Transaktionen/Buchungsvorgängen auf Konsistenz, Locking und Wiederholbarkeit achten.
- Die tatsächliche Ordnerstruktur wird respektiert. AL Guidelines bevorzugt Feature-Ordner für neue Architektur; das AL-Agentura-Standardprofil kann Objektordner verwenden. Ein Wechsel erfordert einen **separaten, freigegebenen Migrationsauftrag**.

## Bestandsaufnahme

| Bereich | AL-Objekte / Dateien | Verantwortung | Ereignisse / Abhängigkeiten | Evidenz |
| --- | --- | --- | --- | --- |
| Setup / Konfiguration | Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen |
| Stammdaten | Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen |
| Fachmodule | Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen |
| Externe APIs / Integrationen | Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen |
| Jobs / Hintergrundprozesse | Zu prüfen | Zu prüfen | Zu prüfen | Zu prüfen |

## Datenflussvorlage (für reale Module)

1. **Auslöser:** UI-Aktion / API / Event / Job Queue? Zu prüfen.
2. **Eingangsdaten und Validierung:** betroffene Tabellen und Berechtigungen? Zu prüfen.
3. **Verarbeitung:** zuständige Codeunit/Prozedur? Zu prüfen.
4. **Schreiboperation / Transaktion:** beteiligte Records, Fehler- und Wiederholungslogik? Zu prüfen.
5. **Ergebnis / Telemetrie:** Status, Benutzerfeedback und datensparsame Diagnose? Zu prüfen.

## Architekturentscheidung protokollieren

- Datum / Ticket-ID / Status.
- Kontext und Alternativen (inklusive vorhandener AL-Patterns).
- Gewählte Lösung mit Auswirkungen auf Events, Erweiterbarkeit, Rechte, Migration, Testbarkeit und Performance.
- Rollback-/Kompatibilitätshinweise und offene Risiken.

Referenz: https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-events/
