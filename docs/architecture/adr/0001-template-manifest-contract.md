# ADR 0001 — Versionierter Manifestvertrag und geordnete Profilkomposition

**Status:** Implementiert, zur Prüfung mit EXT-002 (01.11.2026).

## Kontext
Die vorbereiteten JSON-Beispiele enthalten unversionierte Ordnerlisten und eine implizite `inherit`-Referenz. Ein stabiler Vertrag fehlt. EXT-002 verlangt validierbare Daten und einen eindeutigen Aufbau, bevor EXT-004/007/009 Ordner, Dokumente und Pläne erzeugen. Es besteht kein Konflikt mit D-005 oder D-009; diese ADR konkretisiert beide.

## Entscheidung
Schema-Version 1 trennt `schemaVersion` von der Paket-Inhaltsversion `MAJOR.MINOR.PATCH`. Manifeste beschreiben typisierte Variablen und Datei-/Verzeichniseinträge; Bedingungen sind ausschließlich Boolean-Vergleiche. Einträge speichern Dateiinhalt als Text, niemals als ausführbaren Code. Platzhalter heißen `{{NAME}}`.

Profile komponieren vollständige Manifeste in geordneter `manifestIds`-Liste. Keine implizite Vererbung oder Overrides. Identische Variablen dürfen gemeinsam verwendet werden; Konflikte scheitern. `resources/templates` ist die kanonische Quelle. Alte Root-`templates`-Dateien bleiben historische Beispiele und werden nicht automatisch geladen.

Alle Kernprüfungen bleiben rein und unabhängig von VS Code. Loader nehmen JSON-Text entgegen; künftige Ressourcenadapter lesen per VS-Code-URI-API. Validierung prüft Struktur, portable Pfade, Platzhalter, Eingaben und Zielkollisionen, einschließlich eingesetzter Werte. Unbekannte Felder/Versionen und doppelte JSON-Feldnamen werden zurückgewiesen. Kein Writer entsteht in EXT-002.

## Alternativen
- Implizite Vererbung würde Override-Reihenfolge, Zyklen und versteckte Änderungen mitbringen; für den gegenwärtigen Bedarf nicht nötig.
- Ausführbare Templates würden Vertrauensgrenzen aus D-009 verletzen.
- Neue Schema-Bibliothek wäre eine zusätzliche Abhängigkeit; die begrenzte Version 1 kann explizit und ohne neue Abhängigkeiten validiert werden.

## Konsequenzen
Die beiden gelieferten Profile sind eigenständige deklarative Manifeste. Gemeinsame spätere Dokument-Manifeste können über Komposition ergänzt werden. Ordnernamen stehen nur in Daten; Tests sichern die Übereinstimmung der Objekttypen. `GenerationPlan` definiert lediglich den Vertrag für spätere Planer. Optionale/bedingte Einträge werden bei der Validierung nicht als Weg zum Umgehen von Fehlern behandelt.

## Migrationsfolgen
Die bisherigen unversionierten Beispiele sind kein öffentlich unterstütztes Format und werden abgelehnt. Gelieferte Ressourcen sind explizit auf Version 1 umgestellt. Es werden keine Benutzerdateien migriert. Für spätere Formate ist ein separat getesteter Adapter je bekannter Quellversion erforderlich; Originale bleiben erhalten, das Ergebnis wird vollständig validiert. Unbekannte neuere Versionen scheitern mit einer Versionsmeldung. Änderungen im Zielprojekt benötigen weiterhin Vorschau und Zustimmung.

## Testauswirkung
Unit-Tests prüfen beide gelieferten Profile, wiederholtes Laden, Defaults, Dateitypen, Bedingungen, Komposition, fehlende Referenzen, Versionsfehler, unbekannte Tokens, Duplikate, Traversal und Kollisionen vor/nach Einsetzen von Werten. Bisherige Extension-Host-Tests dienen als Regression; keine neuen VS-Code-APIs eingeführt. Ergebnisse: [EXT-002](../../quality/EXT-002.md).
