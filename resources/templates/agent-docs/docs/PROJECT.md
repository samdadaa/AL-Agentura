# Projektprofil — {{PROJECT_NAME}}

## Was belegt ist

- **Projektname (Einrichtungswert):** {{PROJECT_NAME}}
- **Plattform:** AL / Microsoft Dynamics 365 Business Central.
- **Quelle für technische App-Details:** `app.json`, falls vorhanden. Die untenstehenden Werte wurden nicht automatisch als reale Facts interpretiert.
- **Zweck / fachliches Produkt:** Zu prüfen.
- **Zielgruppe und Mandantenbetrieb:** Zu prüfen.
- **BC-Zielversion / Cloud oder On-Prem:** Zu prüfen; aus Runtime allein nicht zuverlässig ableiten.
- **Publisher / App-ID / Version:** Aus `app.json` verifizieren.
- **Abhängigkeiten und Fremd-Extensions:** Aus `app.json` und Symbolen verifizieren.
- **Objekt-ID-Bereiche und Präfix/Suffix:** Aus `app.json` und `docs/CONVENTIONS.md` prüfen.

## Fachliche Anforderungen (nach Nutzerfreigabe ausfüllen)

| Thema | Bestätigtes Verhalten | Beleg / Entscheider | Status |
| --- | --- | --- | --- |
| Kernprozesse | Zu prüfen | Zu prüfen | Offen |
| Datenmodell | Zu prüfen | Zu prüfen | Offen |
| Schnittstellen | Zu prüfen | Zu prüfen | Offen |
| Benutzerrollen | Zu prüfen | Zu prüfen | Offen |
| Automatisierung / Jobs | Zu prüfen | Zu prüfen | Offen |

## Definition of Done für Änderungen

1. Ticket definiert erwartetes Verhalten und Abnahmefälle.
2. AL-Code und bestehende Struktur geprüft; keine inkonsistenten IDs oder Namen.
3. Berechtigungen, Events, Fehlerfälle, Performance und Datenänderungen bewertet.
4. Tatsächliche Tests mit Ergebnissen im Ticket dokumentiert.
5. Benutzer hat abgenommen.

## Offene Fragen

- [ ] Welche Fachprozesse muss die App abdecken?
- [ ] Welche Business-Central-Version, Laufzeit und Bereitstellungsumgebung sind freigegeben?
- [ ] Welche weiteren Apps/Interfaces sind zwingend erforderlich?
- [ ] Welche Module sind tatsächlich im Code implementiert?

Referenz: https://alguidelines.dev/docs/agentic-coding/gettingstarted/setup/
