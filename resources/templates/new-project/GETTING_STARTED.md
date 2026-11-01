# Einstieg in den vorbereiteten AL-Workspace

Öffne die `.code-workspace`-Datei in diesem Ordner. Sie verweist relativ auf `.`; Projekt und Workspace können gemeinsam verschoben werden.

## Was vorbereitet wurde
Die gewählte AL-Ordnerstruktur unter `src`, gezielte `.gitkeep`-Dateien und eine anpassbare `.gitignore`. Im Modular-Profil entstehen Objektordner nur für die ausgewählten Module. Vorhandene Dateien werden durch diesen Neuprojektablauf nicht ersetzt.

## AL-Konfiguration prüfen
Wenn du eine `app.json` als Quelle ausgewählt hast, wurde ihr Text unverändert übernommen. Prüfe vor Nutzung insbesondere App-ID, Name, Publisher, Runtime, Versionsbezüge, ID-Bereiche und Dependencies für dein Zielsystem. Die Übernahme ist keine Compiler- oder vollständige Schemaprüfung.

Ohne ausgewählte Quelle ist dies nur ein vorbereiteter Workspace, noch keine kompilierbare AL-App. Ergänze eine geprüfte `app.json`, bevor du kompilierst. Die offizielle Microsoft-AL-Extension ist dafür separat erforderlich; sie wird nicht automatisch installiert.

`AL: Go!` erstellt selbst Konfigurationsdateien für einen neuen leeren Ordner. Der Assistent startet diesen Befehl nicht. Erzeuge bei Bedarf die Konfiguration separat in einem leeren Ordner und übernimm nur bewusst geprüfte Dateien. Starte keinen zweiten Generator unkoordiniert über diesem bereits vorbereiteten Projekt. Eine `launch.json` und echte Server-/Anmeldedaten wurden hier nicht erzeugt.

Microsoft-Anleitung: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-get-started-al-for-onprem

## Nächste Schritte
1. AL-Konfiguration für deine Umgebung prüfen bzw. ergänzen.
2. Git-Regeln an dein Projekt anpassen; gemeinsame `.vscode`-Dateien können versioniert werden, lokale Schlüssel und Zugangsdaten bleiben außerhalb von Git.
3. AL-Dateien bewusst im vorgesehenen Objektordner anlegen. Keine vorhandenen AL-Dateien automatisch umstrukturieren.
4. Agenten-Anweisungen und konkrete Tickets nach Prüfung des Projekts ergänzen. Dieser Vorbereitungsschritt hat noch keine vollständige Agenten-Dokumentation angelegt.
