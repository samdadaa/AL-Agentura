# AGENTS.md — Verbindlicher Arbeitsvertrag für AL-extension

> Gilt für das gesamte Repository. Ein Agent darf dieses Dokument nicht als Ersatz für das Lesen von Quellcode und Tickets behandeln. Die Extension selbst ist **KI-frei**; diese Regeln steuern ausschließlich externe Coding-Agenten, die an der Extension entwickeln.

## 1. Produktmission und Grenzen
AL-extension ist eine lokale VS-Code-Extension für **Microsoft Dynamics 365 Business Central AL**. Sie erstellt neue AL-Projekte inklusive VS-Code-Workspace, AL-Struktur, Git-Regeln und Agenten-Dokumentation oder ergänzt bestehende Projekte **nicht destruktiv**. Sie ist kein AL-Compiler, keine Cloud-Plattform, kein eigenes KI-Modell und kein Agenten-Orchestrator. Der Anwender soll nach dem Setup ein konkretes Ticket in `TODO.md` schreiben und seinen vorhandenen Agenten starten können.

## 2. Pflichtlektüre und Reihenfolge
1. `README.md` für tatsächlichen Projektstand und Befehle.
2. `KONZEPT.md` für vereinbarte Anforderungen und Nicht-Ziele.
3. `TODO.md` für die ausdrücklich ausgewählten Tickets, ihre Voraussetzungen und Akzeptanzkriterien; standardmäßig genau **ein** Ticket, mehrere nur auf ausdrückliche gemeinsame Auswahl.
4. `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DECISIONS.md` und die relevante Moduldatei unter `docs/modules/`.
5. `docs/engineering/CONVENTIONS.md`, `docs/quality/TEST_STRATEGY.md`, `docs/security/SECURITY.md` und `docs/quality/DEFINITION_OF_DONE.md`.
6. Vorhandenen Code, Tests, lokale Änderungen und Dateikonflikte **wirklich** untersuchen.

## 3. Vor jedem Codeeingriff
- Bestand nachweisen: implementiert / teilweise / nur vorbereitet / nicht vorhanden / unbekannt.
- Ziel, betroffene Dateien, Risiken und Testplan des Tickets kurz festhalten.
- Relevante VS-Code-APIs und unterstützte Versionen prüfen; keine APIs erfinden.
- `git status` prüfen, falls Git vorhanden ist; Änderungen anderer nicht überschreiben.
- Architekturkonflikte offenlegen und als ADR dokumentieren, statt still eine neue Richtung einzuschlagen.
- Keine eigenmächtige Erweiterung des Scopes; keine weiteren Tickets ungefragt bearbeiten.

## 4. Technische Architekturregeln
- TypeScript `strict`; explizite Modelle statt `any`.
- `commands/` und `ui/` orchestrieren, enthalten aber keine Datei-Schreiblogik.
- `core/` enthält pure Planungs-/Validierungsfunktionen ohne VS-Code-Abhängigkeit, wo möglich.
- `workspace/` erkennt Zielordner und Projektkontext.
- `analysis/` erkennt Struktur und Metadaten, **keine erfundene Fachsemantik**.
- `templates/` enthält versionierte, deklarative Vorlagen mit definierten Platzhaltern.
- `generation/` erzeugt Pläne und schreibt erst **nach Vorschau und Zustimmung**.
- `vscode.workspace.fs` für Dateien des Ziel-Workspaces; Remote-Workspaces berücksichtigen.
- Keine `fs`-Zugriffe auf Zielprojekte, die Remote-/Virtual-Filesystem-Unterstützung umgehen.
- Vorhandene AL-Dateien nicht automatisch verschieben, umbenennen oder überschreiben.

## 5. Sicherheit und Datenintegrität — nicht verhandelbar
- Kein unbestätigtes Überschreiben, Löschen oder Verschieben; Default: **Skip** bei vorhandener Datei.
- Pfade strikt auf den gewählten Ziel-Root begrenzen; `..`, absolute Zielpfade, problematische Namen, URI-Schemes und Symlinks prüfen.
- Untrusted Workspace: keine Skripte ausführen und keine untrusted Templates als Code evaluieren.
- Vorlagen nur als Daten/Text behandeln; keine dynamische Codeausführung.
- Keine Secrets, Zugangsdaten, Kundeninformationen, Tokens oder Telemetrie ohne ausdrückliche Produktentscheidung.
- Teilfehler transparent melden; keine falsche Erfolgsmeldung und keine stille Datenkorruption.
- Die Extension darf ohne Netzwerk, Account und KI funktionieren.

## 6. Generierte Agenten-Dokumentation
- Root-`AGENTS.md` knapp und handlungsfähig; Details in referenzierten Dateien.
- Projektfakten aus `app.json` und AL-Struktur nur übernehmen, wenn tatsächlich erkannt.
- AL-Regeln sind **konfigurierbare Empfehlungen**, keine frei erfundenen Microsoft-Pflichten.
- Bei bestehenden Projekten zuerst Modulindex und Lückenliste; fachliche Inhalte nur durch externen Agenten nach Prüfung ausfüllen.
- Agentenkompatibilität nicht behaupten: `GETTING_STARTED.md` enthält einen expliziten Kopierprompt.
- Ein Ticket wird nur auf ausdrückliche Auswahl bearbeitet; nie automatisch die ganze TODO-Liste.

## 7. Qualität, Status und Abschluss
- Für jede Änderung passende Unit-/Integrationstests schreiben; Negativfälle und Wiederholung berücksichtigen.
- `npm run compile`, `npm test` und relevante VS-Code-Host-Tests ausführen, sofern verfügbar. Nicht ausgeführte Prüfungen ausdrücklich nennen.
- Ein Häkchen in einer TODO ist **kein** Beleg für bestandene Tests oder Freigabe.
- Status `Zur Prüfung` nach dokumentierter technischer Umsetzung; `Erledigt` erst nach Benutzerabnahme.
- **Nach jedem einzelnen umgesetzten TODO-Punkt sofort `TODO.md` aktualisieren**: Aufgabenstand, konkrete Nachweise und offene Prüfungen festhalten; nicht erst gesammelt am Ticket- oder Auftragsende. Implementierung, Tests und Benutzerabnahme getrennt kennzeichnen.
- `TODO.md`, Moduldatei, ADR und Nutzeranleitung bei relevanten Änderungen aktualisieren.
- Abschlussbericht: Was geändert, warum, welche Dateien, welche Tests mit Ergebnis, was offen, wie manuell prüfen.

## 8. Konfliktpriorität
Explizite Nutzeranforderung > Projektentscheidungen/ADRs > relevante Modulregeln > allgemeine Konventionen > Template-Defaults. Sicherheit und Schutz bestehender Dateien dürfen durch kein Template stillschweigend aufgehoben werden.

## 9. Verbotene Abkürzungen
Keine Scheinimplementierung als fertig verkaufen; keine ausgedachten Testergebnisse; keine pauschale Massenanlage sinnloser Dokumente; keine ungefragten Abhängigkeiten; kein Umbau des Produkts zur Multi-Language-Extension; keine externen KI-API-Kosten; keine Vermischung von Generator-Quellcode und generierten AL-Projektdateien.
