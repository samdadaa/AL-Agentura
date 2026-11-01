# Aufgaben und Abnahme — {{PROJECT_NAME}}

## Vorgehensweise

- Ein Ticket wird nur auf ausdrückliche Anweisung bearbeitet; ein Agent wählt keine Folge-Tickets selbst.
- Zulässige Stati: `Offen` → `In Arbeit` → `Zur Prüfung` → `Erledigt`; `Blockiert` bei fehlender Entscheidung/Abhängigkeit.
- `Erledigt` erfordert menschliche Abnahme; ein Häkchen oder erfolgreiches Build ersetzt diese nicht.
- Ein Ticket kann bei unerwarteten Risiken auf `Blockiert` gesetzt werden, zusammen mit einer konkret formulierten Frage.
- Technische und fachliche Tests unterscheiden. Fehlende Testumgebung explizit ausweisen.

## AL-001 — AL-Projektbasis verifizieren

**Status:** Offen  
**Priorität:** Mittel  
**Abhängigkeiten:** Keine  
**Verantwortlich:** Zu prüfen  

### Hintergrund / Problem
Die Projektvorlagen wurden vorbereitet. Ob die Konfiguration zur Zielumgebung passt und welche fachlichen AL-Module bereits existieren, muss anhand der echten Dateien ermittelt werden. Dies ist ein **Prüfticket**, kein Auftrag zur automatischen Implementierung erfundener Geschäftslogik.

### Ziel und messbares Ergebnis
Bestätigter Überblick über `app.json`, den Codebestand, gültige Objekt-ID-Bereiche, Ordnerstruktur und offene Konfigurationsfragen. Die Ergebnisse sind dokumentiert, ohne fremden Code zu ändern.

### Umfang und Nicht-Ziele
- Im Umfang: ausschließlich lesende Projektaufnahme, dokumentierte Ergebnisse, konkreter Vorschlag für nächste Tickets.
- Nicht im Umfang: AL-Dateien verschieben, neue Objekte erfinden, Änderungen deployen, Git-Aktionen ausführen.

### Einzelaufgaben
- [ ] `app.json` prüfen: App-ID, Publisher, Version, Runtime, Dependencies, ID-Bereiche (fehlende Werte markieren).
- [ ] Existierende AL-Objekte und Dateien zählen, Strukturprofil dokumentieren.
- [ ] Tatsächlich vorhandene Module und relevante Konventionen gegen `docs/` abgleichen.
- [ ] Konflikte/Fragen im Ticket und ggf. in `docs/PROJECT.md` erfassen.
- [ ] Prüfbericht mit Grenzen und Vorschlag für das nächste **separat freizugebende** Ticket liefern.

### Akzeptanzkriterien
- [ ] Alle gemachten Aussagen über das Projekt sind in Dateien nachvollziehbar.
- [ ] Keine bestehenden AL-Dateien verändert oder umstrukturiert.
- [ ] Unbekannte Anforderungen mit `Zu prüfen` statt mit Annahmen gekennzeichnet.
- [ ] Betroffene Dokumentation konsistent.

### Tests / Nachweise
- [ ] Lesende Prüfung der Projektdateien ausgeführt und dokumentiert.
- [ ] Optionales Compile/Analyzer nur bei vorhandener Umgebung und Freigabe; Ergebnis tatsächlich dokumentiert.
- [ ] Etwaige fehlende Tests oder Blocker dokumentiert.

### Risiken / offene Entscheidungen
- Zielumgebung, Modulgrenzen und Projektkonventionen: Zu prüfen.

### Abnahme
- [ ] Mensch hat Prüfbericht akzeptiert.
- [ ] Status erst danach auf `Erledigt` gesetzt.

---

## Vorlage für weitere Tickets (kopieren und ID vergeben)

### AL-XXX — Kurzer fachlicher Titel
**Status:** Offen  
**Priorität:** Zu prüfen  
**Abhängigkeiten:** Zu prüfen  
**Verantwortlich:** Zu prüfen

**Ausgangslage / Problem:** Zu prüfen.  
**Ziel / Soll-Verhalten:** Zu prüfen.  
**Umfang und ausdrücklich ausgeschlossene Änderungen:** Zu prüfen.  
**Betroffene Objekte und Schnittstellen:** Nach Codeprüfung festlegen.  
**Technische und fachliche Anforderungen:** Zu prüfen.

**Umsetzungsschritte:**
- [ ] Relevanten Bestand, bestehende Events, IDs und Konventionen prüfen.
- [ ] Technisches Vorgehen und Sonderfälle abstimmen.
- [ ] Nur freigegebenen Umfang implementieren.
- [ ] Rückwärtskompatibilität, Berechtigungen, Performance, Fehlerbehandlung prüfen.
- [ ] Dokumentation aktualisieren.

**Akzeptanzkriterien:**
- [ ] Fachliche Wirkung anhand konkreter Beispiele nachgewiesen.
- [ ] Keine unbeabsichtigten Änderungen an vorhandenen Funktionen.

**Tests / Evidenz:** Welche Tests, Daten, Umgebungen, Ergebnisse? Noch nicht ausgeführt.

**Risiken / offene Fragen:** Zu prüfen.  
**Abnahme:** [ ] Nutzer hat Ergebnis bestätigt.
