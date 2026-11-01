# Sicherheit und Berechtigungen — {{PROJECT_NAME}}

## Grundsätze

- Eine AL-Extension operiert in Business Central im Kontext von Benutzern, Rollen, Permission Sets, Tenant- und Umgebungskonfiguration. Effektive Berechtigungen sind zu prüfen; Rechte nicht allein aus erwarteter Rolle ableiten.
- Least Privilege: Lese-/Schreib-/Execute-Rechte nur soweit nötig. PermissionSets, Objekt-Properties und Tests für relevante Aktionen prüfen.
- Geschäfts- und personenbezogene Daten nur für definierten Zweck verarbeiten; Export, Debug-/Fehlertexte und Telemetry auf Datenminimierung prüfen.
- Keine Produktivdaten in Test- oder KI-Prompts; bei Bedarf anonymisierte/minimierte Testdaten.

## Geheimnisse und Konfiguration

- Keine Passwörter, Client Secrets, Tokens, Verbindungsschlüssel oder echte Tenant-Zugangsdaten in `AGENTS.md`, `TODO.md`, `launch.json`, AL-Code oder Git.
- Secrets in zugelassenen sicheren Mechanismen verwalten; konkrete Plattform-/API-Eignung und Richtlinien vor Einsatz prüfen.
- Sandbox und Production strikt unterscheiden. Deployment, Datenmigration, Batch-Korrekturen und Massenbuchungen nie ohne expliziten Auftrag.

## Agenten- und Supply-Chain-Sicherheit

- Coding-Agenten dürfen nicht eigenständig fremde Scripts installieren, Remote-Code ausführen, Repository-Einstellungen ändern oder sensible Inhalte an externe Dienste senden.
- Abhängigkeiten, Drittanbieter-Snippets und generierte AL-Objekte vor Übernahme auf Lizenz, API-Kompatibilität und mögliche Datenabflüsse prüfen.
- Git-Diff und Dateiliste vor Freigabe kontrollieren; keine unautorisierten Löschungen/Moves/Branch-Wechsel.

## Sicherheitsprüfplan für ein Ticket

- [ ] Betroffene Daten und Benutzerrollen identifiziert.
- [ ] Objekt- und TableData-Berechtigungen geprüft; keine unnötigen erweiterten Permissions.
- [ ] Eingaben validiert, Fehlermeldungen ohne Geheimnisse.
- [ ] API-Zugriffe, Webhooks, Outbound HTTP und Authentifizierung bewertet, falls vorhanden.
- [ ] Sandbox/Produktivgrenzen und Migration berücksichtigt.
- [ ] Sensible Logs, Tests und Dokumentation geprüft.

## Projektbezogene Angaben

| Thema | Freigegebene Festlegung | Stand |
| --- | --- | --- |
| Permission Sets / Rollen | Zu prüfen | Offen |
| Externe Schnittstellen | Zu prüfen | Offen |
| Secret-Verwaltung | Zu prüfen | Offen |
| Datenklassifizierung | Zu prüfen | Offen |
| Tenant / Mandant / Umgebungen | Zu prüfen | Offen |

AL-Kontext: https://alguidelines.dev/docs/agentic-coding/gettingstarted/setup/
