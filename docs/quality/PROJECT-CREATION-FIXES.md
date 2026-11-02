# Projektanlage — drei Fehlerkorrekturen (02.11.2026)

**Status:** Technisch umgesetzt und automatisiert geprüft (Zur Prüfung); Benutzerabnahme offen. Version 1.0.2 aus vorhandenem Manifest übernommen. Keine Veröffentlichung oder Installation in persönliche Profile.

## Ursachen und Änderungen

1. **Fremdes Projektfenster ergänzt:** Global gespeicherte Fortsetzung schloss nur im Startfenster bekannte Roots aus. Ein anderes Bestandsfenster konnte zuerst den Claim erwerben. Jetzt wird vor dem Microsoft-Befehl der exakte lokale Projektzielordner ohne vorhandene `app.json` gewählt. Nur das Fenster mit genau diesem einzelnen Root darf fortsetzen; der erzeugte Workspace öffnet dort mit `forceReuseWindow`. Alte Fortsetzungen ohne Zielbindung werden verworfen. Andere Roots werden weder ergänzt noch beansprucht.
2. **Modul-MDs fehlen bei Neuanlage:** Beide Neuanlagewege planten nur Modulordner und statischen Index. Der gemeinsame reine Renderer erzeugt jetzt sofort `docs/modules/details/src/<Modul>.md` für ausdrücklich ausgewählte, normalisierte Namen sowie einen verlinkten Index. Die deklarative Modulvorlage wird wiederverwendet. Fachliche Inhalte und Dateizahlen bleiben zu prüfen. Elternpfade werden vor Dateien angelegt.
3. **README fehlt:** Das gemeinsame Vorlagenpaket enthält jetzt `README.md` mit Projektname und ausfüllbaren Abschnitten für Überblick, Voraussetzungen, Einrichtung, Verwendung, Entwicklung, Tests, Mitarbeit, Kontakt und Lizenz. Alle schreibenden Neuanlage-/Setup-Varianten nutzen es. Existierende README-Dateien werden bewahrt. Analyse, Öffnen und Diagnose bleiben ohne Dokumentanlage.

Geänderte Verantwortungsbereiche: `src/commands/microsoftProjectFlow.ts`, `src/core/{agentDocs,moduleDocumentation,newProject}.ts`, `src/templates/bundled.ts`, `src/workspace/newProject.ts`, `src/generation/completeMicrosoftProject.ts`, deklarative README und die zugehörigen Unit-/Host-Tests. API-/Architekturbegründung: [ADR 0007](../architecture/adr/0007-bound-project-completion.md). Bedienung in Root-README und Modulverträgen aktualisiert.

## Automatisierte Nachweise

- `npm run compile`: erfolgreich gegen installierte VS-Code-Typen 1.90.0.
- `npm test`: 96/96 Node-Tests erfolgreich. Enthält zwei getrennte simulierte Extension-Hosts mit geteiltem Pending und Claims: fremdes Bestandsprojekt darf vor dem Zielhost weder ergänzen noch claimen. Außerdem Zielauswahlabbruch, vorhandenes AL-Ziel, Legacy-Pending, verspätete Metadaten, Wiederholung, Modulnormalisierung, unsichere Namen, verlinkter Index, Modul-Elternpfade, README-Anlage und Skip.
- `npm run test:host`: vollständiger echter Host auf VS Code 1.144.0 / macOS bestanden. Prüft beide Neuanlagewege, Standard/Modular/BC-Agent, sofortige Modul-MDs, README, vorhandene README bytegleich, Wiederholung, Abbruch, Teilfehler und Symlinkgrenzen.
- `npm run verify`: vollständig erfolgreich auf VS Code 1.144.0 / macOS. 96/96 Node-Tests, Audit ohne bekannte Schwachstellen, vollständiger Host, gezielter Microsoft-Host, echter Restricted Mode, Paketierung, bytegleiche Paketprüfung, isolierte Installation des fertigen VSIX mit vollständiger Host-Suite und technischer Release-Check bestanden.
- Paket: `al-agentura-1.0.2.vsix`, 70 Einträge, SHA-256 `282a5fb4fdd41cf584191f99133d7f7d7bdbd4f185a2e18dcb42c8d495a6792e`. Hashgebundene maschinelle Nachweise unter `artifacts/quality/`; Build-Log lokal unter `/tmp/al-agentura-project-fixes-verify.log`.
- Abschließende Testbereinigung entfernte eine versehentlich doppelte Assertion; der komplette Verify-Lauf wurde danach erneut erfolgreich ausgeführt.
- `git diff --check`: erfolgreich.

Der Mehrfenster-Orchestrierungstest simuliert getrennte Hosts; er ist keine sichtbare Ausführung des realen Microsoft-Assistenten in zwei Fenstern. Die echten Host-Suites prüfen die produktiven Writer und Wizard-Abläufe auf realen Dateien und VS-Code-Providern. Persönliche Projektordner bleiben unberührt.

## Manuelle Benutzerprüfung

1. Projekt A in Fenster A offen lassen; Dateibestand vorher sichern/vergleichen. In Fenster B `AL Agent: Create Project` → Microsoft Standard AL starten. Einen eigenen leeren Projektordner B als exaktes Agentura-Ziel wählen und im Microsoft-Assistenten denselben Ordner verwenden. Nur B darf Agentura-Struktur und Workspace erhalten; A muss bytegleich bleiben.
2. Mit Modular AL und zwei Modulen wiederholen. Direkt nach Erstellung beide Moduldateien unter `docs/modules/details/src/` und ihre Links in `docs/modules/INDEX.md` prüfen, ohne Setup nachzustarten.
3. Standard, Modular, BC AI Agent (falls in Microsoft installiert verfügbar) und unabhängigen Generator auf fehlende `README.md` prüfen. Ausfüllabschnitte müssen vorhanden sein. Im Bestandsprojekt eigene README anlegen, Setup bestätigen und unveränderten Inhalt prüfen; ohne README muss Setup sie ergänzen.
4. Zielauswahl abbrechen: Microsoft darf nicht starten. Im Microsoft-Assistenten absichtlich einen anderen Zielordner verwenden: keine automatische Ergänzung in irgendeinem fremden Projekt; den tatsächlichen Zielordner anschließend bewusst mit Setup ergänzen.

**Offen:** sichtbare Zwei-Fenster-Abnahme mit der installierten Microsoft-AL-Version, Windows-Abnahme und Benutzerfreigabe. Der zusätzliche Zielordnerdialog ist absichtlich erforderlich, weil Microsoft keine dokumentierte verlässliche Ziel-/Abschluss-API bereitstellt. Kein automatisches Raten eines anderen Projektziels.
