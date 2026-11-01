# AL-Konventionen — {{PROJECT_NAME}}

> Erst vorhandene AL-Dateien und `app.json` prüfen. Die folgenden Werte sind **Default-Empfehlungen** aus AL Guidelines, kein Auftrag zur nachträglichen Umstrukturierung. Projektkonventionen dokumentieren und nur nach Freigabe ändern.

## 1. Namen und Dateien

- Projektpräfix/Suffix: **Zu prüfen**. Existierenden Namespace / Objektstil im Code prüfen.
- AL-Objektnamen müssen die plattformspezifischen Längenrestriktionen erfüllen (in der Regel maximal 30 Zeichen inklusive Prefix/Suffix); eindeutige, verständliche Begriffe wählen.
- Bevorzugte Datei: `<ObjectName>.<ObjectType>.al` (z. B. `SalesOrderProcessor.Codeunit.al`, `CustomerSetup.Table.al`), sofern mit Projektregel kompatibel.
- PascalCase für benannte Elemente, wo AL-Syntax und Bestand es erlauben; bei AL-Objektbezeichnungen mit Leerzeichen lesbare Fachbegriffe beibehalten.
- Funktionsnamen nach Tätigkeit (`Calculate...`, `Validate...`, `Create...`); Mehrdeutigkeit vermeiden.
- Optionale XML-Dokumentation für erklärungsbedürftige / öffentliche Prozeduren; keine falschen Kommentare.
- Labels, Tooltips und Übersetzbarkeit beachten; keine hartkodierten UI-Fehlermeldungen, wo Labels passend sind.

## 2. Ordnerprofile

| Profil | Aufbau | Entscheidung |
| --- | --- | --- |
| Standard | `src/Tables`, `src/Pages`, `src/Codeunits` usw. | AL-Agentura-MVP; behalten, wenn ausgewählt |
| Modular | `src/<Modul>/Tables`, `src/<Modul>/Codeunits` usw. | Modularisierung nach bestätigten Modulen |
| Feature-first | `src/<Fachbereich>/<Feature>` mit AL-Objekttypen nach Bedarf | AL-Guidelines-orientierte Alternative, **nicht automatisch von AL Agentura umsetzen** |

Nicht bei jedem Ticket neue Struktur erfinden. Keine Bestandsdatei ohne Nutzerfreigabe verschieben.

## 3. Formatierung

- AL-Guidelines-Baseline: konsistent **2 Leerzeichen**, aber vorhandene Teamregel und AL-Formatter-Konfiguration haben Vorrang.
- Einheitliches `begin`/`end`, lesbare `if`-/`case`-Blöcke; kurze klar benannte Prozeduren statt riesiger UI-Trigger.
- Eine klare Verantwortung pro AL-Objekt/Prozedur anstreben; keine ungenutzten Variablen/unklaren Abkürzungen.

## 4. Objekt-IDs und App-Konfiguration

- ID-Ranges nur aus gültiger `app.json` und ggf. abgestimmten Reservierungsregeln beziehen. Kollisionsprüfung gegen reale Objekte ist Pflicht.
- `runtime`, `application`, `platform`, Abhängigkeiten und Feature-Verfügbarkeit **zielversionsspezifisch** prüfen.
- Keine fremden Objekte mit identischer ID, Namen oder unpassendem Namespace erzeugen.
- Kein frei erfundenes `app.json`, wenn keine belastbaren Zielversion-/Publisher-Angaben vorliegen.

## 5. Performance

- Filter vor `FindSet`/`Get`, möglichst selektiv und unter Beachtung von Schlüsseln.
- `SetLoadFields` für kompatible reine Lesezugriffe erwägen und benötigte Felder berücksichtigen; insbesondere Schreibpfade sorgfältig prüfen.
- SQL-/DB-Zugriffe in Schleifen, unnötige `Modify`/`CalcFields`, Sperren und lange Transaktionen vermeiden; Optimierungen anhand realer Daten prüfen.
- Temporäre Records einsetzen, wenn sie wirklich Kosten reduzieren, nicht als universelle Lösung.

## 6. Events, Fehler, Erweiterbarkeit

- Events/Subscribers bevorzugen, wenn unterstützte Erweiterungspunkte verfügbar sind. Publisher-/Subscriber-Verträge und Skip-Flags vor Verwendung prüfen.
- Klare, lokalisierbare Fehlermeldungen; `TryFunction`-Verhalten, Schreibzugriffe und Rückabwicklung nicht pauschal annehmen.
- Keine Catch-all-Unterdrückung, keine personenbezogenen Daten im Telemetry-Event.

## 7. Tests und Versionssicherheit

- AL-Go App/Test-Trennung nur im passenden Workspace, Test-Projekt referenziert App.
- Neue Testobjekte nur bei explizitem Auftrag; jede Codeänderung dennoch mit realistischen Prüffällen und ggf. vorhandenen Tests absichern.
- Analyzer und Compiler entsprechend Projekt-/BC-Version; nicht ausgeführte Prüfungen als offen kennzeichnen.

**Quellen:**
- https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-code-style/
- https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-naming-conventions/
- https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-performance/
- https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-error-handling/
- https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-events/
