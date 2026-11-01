# Verbindliche Produktentscheidungen
| ID | Entscheidung | Begründung |
|---|---|---|
| D-001 | AL/Business Central exklusiv im MVP | Fachliche Qualität statt generischem Sprachsupport |
| D-002 | Kein KI-Modell in der Extension | Offline, keine API-Kosten, externe Agenten separat |
| D-003 | Neues Projekt inklusive `.code-workspace` | Start ohne manuelle Workspace-Vorbereitung |
| D-004 | Bestehende Projekte nicht destruktiv ergänzen | Keine Datenverluste oder ungewollte Refactorings |
| D-005 | Standard- und modulare AL-Struktur | Kleine und größere Apps unterstützen |
| D-006 | Root-AGENTS, TODO, Anleitung, modulare docs | Einstieg für Mensch und Agent |
| D-007 | Erst Modulübersicht, dann Fachdetails | Keine erfundene Codeinterpretation |
| D-008 | Eigene MD-Vorlagen später unverändert importierbar | Anwenderkontrolle und Wiederverwendung |
| D-009 | Vorlagen deklarativ; keine beliebige Ausführung | Sicherheit und Testbarkeit |
| D-010 | Vorschau vor Dateischreibvorgängen | Transparenz und Kontrolle |
| D-011 | Kein automatisches Abarbeiten offener Tickets | Mensch wählt Agentenauftrag |
| D-012 | Lokale F5-/VSIX-Tests vor Marketplace | Frühes Testen ohne Veröffentlichung |
| D-013 | Versioniertes Manifest-Schema 1, explizite geordnete Profilkomposition ohne Overrides | Validierbare Daten; siehe [ADR 0001](adr/0001-template-manifest-contract.md), EXT-002 zur Prüfung |
| D-014 | Projektanalyse nur lesend, EXT-004 liefert Strukturpläne; allgemeine Anwendung über EXT-009 | Scanlücken und Bestand schützen; [ADR 0002](adr/0002-readonly-inspection-structure-plans.md), zur Prüfung |
| D-015 | EXT-005: bestätigte Neuanlage nur in fehlenden lokalen file-Zielen, keine Bestandsanwendung | Race im providerübergreifenden Copy-Fallback vermeiden; [ADR 0003](adr/0003-new-project-creation.md), zur Prüfung |
