# AL: Go! – isolierter Integrationstest (noch nicht im VS-Code-Host verifiziert)

Ziel: Prüfen, ob der Microsoft-AL-Befehl aus einer anderen Extension startbar ist, wann dessen Promise zurückkehrt und ob ein Workspace-Wechsel beobachtbar ist. **Kein automatischer Setup-Workflow; `AL Agent: Create Project` bleibt unverändert.**

1. `npm ci`, `npm run compile`, F5. Im Extension Development Host muss Microsoft **AL Language** installiert sein.
2. Befehl `AL Agent: Test AL Go Integration` ausführen. Der Befehl aktiviert `ms-dynamics-smb.al`, liest deren Manifest und zeigt passende registrierte Projektbefehle mit ihren technischen IDs.
3. Richtigen AL-Go-Befehl aus der Liste auswählen, Ausführung bestätigen. AL Language sollte seine eigenen interaktiven Dialoge (Pfad, Laufzeit, Umgebung) zeigen.
4. Die Ausgabe unter **Ausgabe → AL Agentura** prüfen. Beurteilen: Konnte der Befehl gestartet werden? Kam das Promise vor/nach Projektanlage zurück? Wurde ein Workspace-Wechsel erkannt?
5. Zielordner und angelegte Dateien manuell prüfen. Ein Workspacewechsel kann den Extension Host neu laden, weshalb Logdaten nicht automatisch garantieren, dass die Initialisierung abgeschlossen ist.

**Sicherheit:** Der Test ergänzt selbst keine Projektdateien. Bei Bestätigung führt er jedoch einen Microsoft-Befehl aus, der Dateien erzeugen kann. Verwende einen leeren Testordner.

**Offen:** Technische Command-ID, Parameter zur Pfadübergabe und Abschluss-Signal können nur im echten Host mit installierter AL Language bestätigt werden. Keine Parameterübergabe und keine automatische Nachbearbeitung implementiert.
