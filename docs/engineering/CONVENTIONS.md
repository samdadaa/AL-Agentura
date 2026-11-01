# Engineering-Konventionen
- `strict` TypeScript, klar definierte Interfaces, keine nicht begründeten `any`.
- Pure Funktionen für Planer, Manifest und Pfadvalidierung; VS-Code-API nur an Systemgrenzen.
- Module nach Verantwortung statt riesiger `extension.ts`.
- Kein direkter Zugriff auf Dateisystem des Zielprojekts via Node `fs`, wenn `vscode.workspace.fs` nötig ist.
- Benutzermeldungen auf Deutsch, klare Fehlerursachen und nächste Schritte.
- Fehlende Implementierung explizit als offen markieren.
- Dokumente nicht als Codewahrheit behandeln; vor Änderungen Implementierungsstand prüfen.
- Kleine Commits/Tickets, keine stillen Architekturwechsel.
