# Teststrategie und Evidenz — {{PROJECT_NAME}}

## Regel für Coding-Agenten

Keine Tests, Compilerläufe oder Sandbox-Effekte als erfolgreich melden, wenn sie nicht wirklich ausgeführt wurden. **Neue Test-Codeunits nur bei ausdrücklichem Ticketauftrag erzeugen**; bestehende Tests und manuelle Prüfschritte nach Möglichkeit anwenden. Das Testniveau richtet sich nach Risiko und Änderung.

## Teststufen

| Stufe | Inhalt | Was als Nachweis zählt |
| --- | --- | --- |
| Codeprüfung | ID-Bereiche, Naming, Abhängigkeiten, Events, Rechte | Betroffene Dateien, konkrete Erkenntnisse |
| Compile / Analyzer | AL Language, richtige Symbols/BC-Version, projektkonfigurierte Analyzer | Tatsächliches Kommando/IDE-Aktion und Ergebnis |
| Unit-/Integrationstests | AL Test Codeunits, Setup, Fehlerpfade, Rechte | Test-ID, Umgebung, Resultat |
| Fachliche Prüfung | Ist-/Soll-Verhalten inkl. Sonderfälle | Eingaben, Schritte, erwartete und beobachtete Ergebnisse |
| Regression / Last | Vorheriges Verhalten, Massenverarbeitung, Locking | Realistische Datenmengen, Messzeit, Vergleich und Einschränkungen |

## Projektstruktur App/Test

Bei **AL-Go** und getrennten Projekten:
- `App/` für Anwendungscode, `Test/` für Testobjekte, je eigenes `app.json`.
- `Test` referenziert `App`, nicht umgekehrt.
- Testordner entlang fachlicher Features strukturieren, gemeinsam genutzte Testhelfer separat.
- Nicht ohne Auftrag ein Testprojekt erzeugen oder vorhandene Projektstruktur umbauen.

Im **einzelnen AL-Projekt** ist eine getrennte Test-App optional bzw. von vorhandener Architektur abhängig. Nicht automatisch AL-Go voraussetzen.

## Prüfprotokoll für ein Ticket

| Feld | Eintrag |
| --- | --- |
| Ticket / Änderung | Zu prüfen |
| Getestete AL-Objekte | Zu prüfen |
| BC-Version / Runtime | Zu prüfen |
| Umgebung, nur nicht-sensible Bezeichnung | Zu prüfen |
| Testdaten, anonymisiert | Zu prüfen |
| Ausgeführt am / durch | Zu prüfen |
| Build/Analyzer | Nicht ausgeführt |
| Automatisierte Tests | Nicht ausgeführt |
| Manuelle Szenarien | Nicht ausgeführt |
| Ergebnis und Fehler | Zu prüfen |
| Offene Risiken / Regressionen | Zu prüfen |

## Mindestfälle für fachliche Änderungen

- Erfolgsfall (Happy Path), leerer/ungültiger Input, fehlende Berechtigung, wiederholte Ausführung (Doppelverarbeitung), Teilfehler, Datums-/Rundungsgrenzen, bestehende Daten; Massendaten nur, wenn relevant.
- Bei Buchungen zusätzlich gebuchte/ungebuchte Belege, Ausgleich, Storno, Mehrwertsteuer, Dimensionswerte, Fehlerabbruch und Recovery prüfen, soweit fachlich zutreffend.
- Bei Events zusätzlich Subscriber-Kombinationen und Erweiterbarkeit; bei APIs Fehlantworten, idempotente Wiederholung und Authentifizierung.

Quelle: https://alguidelines.dev/docs/agentic-coding/vibe-coding-rules/al-testing/
