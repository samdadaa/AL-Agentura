# Analyse der hochgeladenen Markdown-Sammlung

**Quelle:** Nutzerupload `Markdown Struktur.zip`, 530 Markdown-Dateien. Keine vollständigen Quellcode-Repositories; keine Aussage über deren tatsächlichen Implementierungsstand.

## Beobachtete und übernommene Muster

1. **Agentenverträge** aus `shop-platform__AGENTS.md`, `WorkforceManagment__apps__business-central__AGENTS.md` und `roadguard-nav__AGENTS.md`: vor Änderungen lesen, Implementierungsstand verifizieren, keine stillen Verhaltensänderungen, kleine Änderungen, Dokumentation mitpflegen.
2. **AL-spezifische Leitplanken** aus der Workforce-BC-AGENTS-Datei: `app.json` und Objekt-IDs zuerst prüfen, bestehende AL-Muster und Namenskonventionen respektieren, AL-Code nicht durch freie Neugenerierung ersetzen.
3. **Abnahmegates** aus `shop-platform__docs__08-quality__DEFINITION_OF_DONE.md`: Umsetzung, Tests, Dokumentation und Nutzerfreigabe separat ausweisen.
4. **Moduldokumentation** aus Workforce-BC `docs/Modules/`: Zweck, Datenfluss, Abhängigkeiten, Tests und offene Fragen je Fachbereich.
5. **Architekturentscheidungen (ADR)** aus mehreren Projekten: Kontext, Entscheidung, Alternativen, Folgen, Status; kein stilles Umwerfen.
6. **Große TODO-Roadmaps** aus Shop, Workforce und RoadGuard: priorisierte Pakete, explizite Statuslegende, dokumentierte Einschränkungen und offene manuelle Prüfungen.
7. **Security/Privacy**: Trust Boundaries, keine Secrets, sichere Eingabe-/Pfadvalidierung, klare Qualitätsgrenzen.

## Bewusste Abgrenzung
Nicht übernehmen: Workforce-Fachregeln, Shop-Tenant-/Payment-Logik, RoadGuard-Navigation, fremde Objektpräfixe, fremde API-Verträge oder deren Implementierungsbehauptungen. Sie sind Muster für **Dokumentationsqualität**, keine Anforderungen an AL-extension.

## Regel für dieses Projekt
Jede generierte Vorlage muss zwischen **gesicherten Projektfakten**, **empfohlenen Regeln**, **konfigurierten Vorgaben** und **offenen Fragen** unterscheiden. Unbekannte Inhalte nicht mit erfundenen Erklärungen füllen.
