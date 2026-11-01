# ADR 0004 — Automatischer Abschluss nach Microsoft-Projekterstellung

**Status:** Implementiert, zur Prüfung (01.11.2026); ausdrücklicher Nutzerauftrag.

## Ausgangslage und Entscheidung
Die vorhandene Microsoft-Integration speicherte eine Fortsetzung, fragte nach der Projekterstellung erneut nach Zustimmung und startete anschließend eine weitere Vorschau/Bestätigung. Eine Workspace-Datei entstand dabei nicht. Der Nutzer verlangt nach den notwendigen Eingaben eine automatische, additive Fertigstellung und Workspace-Öffnung.

Die Wahl eines Microsoft-Modus in `Create Project` beauftragt deshalb auch die anschließende Ergänzung. Module werden vor Microsoft abgefragt und mit Profil, UUID, Zeitstempel und zuvor geöffneten AL-Projekten gespeichert. Der begrenzte Microsoft-Writer ergänzt Standard-/Modulstruktur und Agentura-MDs; BC AI Agent erhält nur Agentura-MDs sowie den gemeinsamen Workspace. Microsofts Dateien werden weder verschoben noch ersetzt. `.code-workspace` referenziert `.` und wird nach erfolgreicher Ergänzung über `vscode.openFolder` im selben Fenster geöffnet. Vorhandene Workspace-Dateien bleiben erhalten; ihr Projektbezug wird vor und nach dem Schreiben geprüft. Nicht unterstützte vorhandene Workspace-Inhalte erfordern manuelle Prüfung.

D-010 und ADR 0003 werden ausschließlich für diesen ausdrücklich ausgewählten Microsoft-Erstellungsablauf präzisiert: keine zusätzliche Vorschau oder Zustimmung nach Microsoft. Eigenständiger Generator und manueller Bestands-Setup behalten ihre bisherigen Interaktionen. Kein allgemeiner SafeWriter und keine Bearbeitung weiterer Tickets.

## Dateischutz und Lebenszyklus
Alle Projektzugriffe laufen über `workspace.fs`. Native lokale Ziele, vollständige Analyse, validierte relative Pfade, Elternketten, Symlink-/Typ-/Schreibweisenprüfung und `copy(overwrite:false)` schützen den Bestand. Inhalte kommen aus einem exklusiven privaten OS-Scratch. Node fs wird nur für Scratch und Extension-Speicher verwendet. Es gibt keinen destruktiven Rollback; Teilfehler werden mit angelegtem Umfang und gestopptem Pfad gemeldet.

Fortsetzung bei Start, Workspace-Wechsel, app.json-Anlage/-Änderung und sekündlicher Prüfung. Ein vorhandenes gültiges AL-Metadatendokument in genau einem lokalen Root ist erforderlich. Zuvor geöffnete AL-Projekte werden ausgeschlossen; ein zuvor leerer Root darf durch Microsoft zum AL-Projekt werden. Lebensdauer 15 Minuten. Das Microsoft-Promise allein belegt keine Fertigstellung.

Eine gemeinsame Promise verhindert parallele Ereignisausführung im Host. Eine exklusive Claim-Datei (`open` mit `wx`) im lokalen globalen Extension-Speicher verhindert Wiederholung über mehrere Fenster und veraltete Memento-Kopien. Sie enthält keine Projektdaten und bleibt als kleiner Verbrauchsnachweis je Ablauf bestehen. Pending wird vor Schreiben/Öffnen entfernt. Nach Fehler oder Host-Absturz erfolgt kein automatischer zweiter Schreibversuch; manuelles Setup bleibt zur kontrollierten Reparatur verfügbar.

## Grenzen und Nachweise
Die Microsoft-Extension bietet hier keine dokumentierte Fertigstellungs-/Ziel-API. Ein gültiges app.json ist das Erkennungssignal; während eines offenen Ablaufs sollte kein anderes AL-Projekt geöffnet werden. Ohne neuen geeigneten Root bzw. bei stillem Abbruch bleibt der Wunsch bis zu 15 Minuten bestehen. Remote-/Multi-Root-Fortsetzung wird nicht geraten.

Typen gegen `@types/vscode` 1.90.0 kompiliert; geprüft mit [VS-Code-API](https://code.visualstudio.com/api/references/vscode-api) und [Built-in Commands](https://code.visualstudio.com/api/references/commands). Tests und reale Host-Grenzen: [Microsoft-Workflow-Prüfbericht](../../quality/MICROSOFT-AL-WORKFLOW.md).


## Korrektur nach Benutzerprüfung: lokaler Extension-Speicher
Im echten Aktivierungskontext ist `globalStorageUri` auf diesem Desktop `vscode-userdata:`. Die ursprüngliche Sperre wies diese URI ab, bevor eine Projektdatei geschrieben wurde. Der Regressionstest mit dem tatsächlichen Kontext reproduzierte den Fehler; der bisherige temporäre `file:`-Speichertest hatte ihn nicht erfasst.

Für die exklusive Node-Sperre sind jetzt `file:` und der lokale VS-Code-Profilalias `vscode-userdata:` ohne Authority zugelassen; `fsPath` bezeichnet hier den nativen Extension-Speicher. Andere Schemes bleiben gesperrt. Projektzugriffe bleiben unverändert auf `workspace.fs`. Kontrollierte Speicherfehler und eine feste Schrittbezeichnung ersetzen die ursachenlose Fehlermeldung. Kein automatisches Wiederholen bereits verbrauchter Abläufe.
