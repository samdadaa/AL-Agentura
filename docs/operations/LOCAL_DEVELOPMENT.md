# Lokale Entwicklung und VSIX
1. `AL-extension.code-workspace` öffnen.
2. `npm install` (Netzwerk für Abhängigkeiten nötig; Extension selbst bleibt offline).
3. `npm run compile` und `npm test`.
4. `F5` im VS-Code-Extension-Development-Host; Command Palette `AL Project Assistant: Setup Project`.
5. Später `npm run package` für VSIX, lokal über **Extensions → ... → Install from VSIX**.

**Aktueller Stand:** registrierter Befehl ist nur ein Platzhalter. Kein Generator ist fertig. Diese Anleitung behauptet keine erfolgreiche Ausführung.
