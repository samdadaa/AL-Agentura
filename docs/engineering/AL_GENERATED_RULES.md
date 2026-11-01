# Anforderungen an generierte AL-Agentenregeln
- Vor jeder Änderung `app.json`, Objekt-ID-Ranges und vorhandene AL-Objekte prüfen.
- Präfix/Suffix, Namespace und Dateibenennung aus Projektkonfiguration/Bestand übernehmen, nie aus fremden Projekten.
- Keine belegten Objekt-IDs wiederverwenden; nicht ohne Auftrag Objektbereiche ändern.
- `tableextension`, `pageextension`, Events/Subscriber und Berechtigungssätze bewusst einsetzen.
- BC-Version, Runtime, Dependencies und Zielumgebung beachten.
- Filter, Datenbankzugriffe, Transaktionen, Locks und Batch-Verarbeitung bei Performanceänderungen prüfen.
- Testcode und Regressionstests an vorhandene AL-Testinfrastruktur anpassen.
- Generierte Projektdokumente sind zunächst Gerüst; Agent ergänzt Fachinformationen nur nach Codeprüfung.
- TODO-Tickets haben Ziel, Kontext, Anforderungen, Akzeptanz, Tests und Status.
