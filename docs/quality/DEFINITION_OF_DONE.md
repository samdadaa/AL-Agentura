# Definition of Done — getrennte Nachweise
Ein Ticket ist **technisch umgesetzt**, wenn Anforderungen und negative Pfade implementiert, betroffene Dokumente aktualisiert und Code nachvollziehbar überprüft wurden. Es ist **getestet**, wenn konkrete Testbefehle/Ergebnisse dokumentiert sind. Es ist **abgenommen**, wenn der Nutzer es geprüft und bestätigt hat. Diese drei Aussagen dürfen nicht vermischt werden.

## Gate
- [ ] Fachliche Akzeptanzkriterien vollständig
- [ ] Keine unbeabsichtigten Dateiveränderungen oder Datenverluste
- [ ] Pfad-/Workspace-/Konfliktfälle abgedeckt
- [ ] TypeScript-Build erfolgreich
- [ ] Unit-Tests erfolgreich; relevante Integrationstests dokumentiert
- [ ] Manueller VS-Code-Host-Test soweit nötig
- [ ] README, TODO, Modulbeschreibung und ADR aktualisiert
- [ ] Keine Secrets, ungeprüften Abhängigkeiten oder ungesicherten Templates
- [ ] Nutzerabnahme eingeholt (separat)
