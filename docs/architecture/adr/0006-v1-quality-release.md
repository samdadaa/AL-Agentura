# ADR 0006 — V1-Qualitätsgate und Marketplace-Paket

Status: implementiert, technische Abschlussprüfung und Benutzerabnahme gesondert (02.11.2026).

Der Benutzer hat EXT-011 ausdrücklich um die zur ersten Marketplace-Veröffentlichung nötige Vorbereitung erweitert und Publisher `SamerDadah` sowie MIT festgelegt. Release-relevante Paket-/Installationsprüfungen aus dem bisherigen EXT-012-Scope werden deshalb unter diesem Auftrag umgesetzt; andere Komforttickets werden nicht bearbeitet.

V1 erhält Version 1.0.0, öffentliche Paketdokumentation und Lizenz. Tests laufen gegen native temporäre Ziele, einen echten untrusted Workspace und das tatsächlich installierte VSIX. Veröffentlichungsautomatisierung und Credentials werden nicht hinzugefügt; der Herausgeber lädt das geprüfte Paket selbst hoch.

`verify` führt Compile, Unit-/Host-/Restricted-/Installationsprüfungen, Audit und Paketcheck aus. Quell-/Test-/Tool-Fingerprints und dieselbe Paket-SHA begrenzen Nachweise auf den tatsächlich geprüften Stand. Runtime und Ressourcen sind eine kontrollierte Paketmenge; obsolete Compiler-Ausgaben werden entfernt. Die externe Dateisystem-/Provider-Grenze aus ADR 0003/0005 bleibt unverändert.

Microsoft-Befehle werden in Restricted Mode vor jeder externen Aktivierung abgewiesen. Eigene Textvorlagen benötigen keine fremde Codeausführung und bleiben verfügbar. Die vorhandene Template-Verarbeitung ist weiterhin rein deklarativ.

Bestehende Release-Blocker dürfen im Rahmen der Testmatrix behoben werden: Dokument-/Launch-Elternordner im Neuprojektplan sowie Paketierung veralteter Build-Dateien. Keine neue Produktfunktion, Cloud-Integration, KI oder Fachanalyse wird daraus abgeleitet.

Das vorhandene Paketierungswerkzeug ist auf vsce 4.1.0 aktualisiert; ein enges minimatch-Override 11.0.1 schließt eine bekannte Advisory, bis das Buildwerkzeug diese Version selbst verwendet. Registry-Audit und vollständige Paketinhalts-/Installationstests prüfen den Override. Kein Runtime-Paket wird mitgeliefert.

Manuelle Plattform-/Microsoft-/Marketplace-Abnahme bleibt offen, bis sie tatsächlich durchgeführt wurde. Historische Testberichte werden nicht rückwirkend als erfolgreich umgeschrieben.
