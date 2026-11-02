# Modul Generation

## Status und Verantwortung
EXT-001 bis EXT-007 sind abgenommen. EXT-008 bis EXT-010 ergänzen die bestätigte Bestands-Pipeline und sind zur Prüfung. Die älteren Abschnitte unten beschreiben die historischen Grenzen vor dieser Umsetzung. Aktueller Vertrag: [ADR 0005](../architecture/adr/0005-existing-project-generation.md).

## Dateien und Schnittstellen
- `src/core/alStructure.ts`: `StructureOptions`, Objekttypen aus validierten Manifesten, portable Modulnamen und case-insensitive Deduplizierung (erste Schreibweise bleibt erhalten).
- `src/core/structurePlan.ts`: `planALStructure(context, manifest, options, gitignore)` liefert einen reinen `StructureDraft` mit relativen Operationen.
- `src/generation/structurePlan.ts`: `createStructurePlan` ergänzt Ziel-URIs per `Uri.joinPath`; Root-Scheme und -Authority bleiben erhalten. Kein Datei-API-Schreibzugriff.
- `src/templates/bundled.ts`: liest den ausgelieferten Katalog, referenzierte Manifeste und `resources/templates/al.gitignore` über VS-Code-URIs. Ressourcen werden validiert.

Der `GenerationPlan`-Vertrag aus EXT-002 bleibt bestehen: Root-/Ziel-URI als String, Profil- und Manifestversionen, Eintrag-ID, relativer Zielpfad, Art Datei/Verzeichnis, create/skip/conflict, Grund und optionaler Inhalt. Ein Plan ist keine Zustimmung und keine Garantie gegen spätere Zustandsänderungen.

## Struktur- und Bestandsregeln
`profile` ist standard/modular; `objectTypes` kann eine Teilmenge der im Manifest deklarierten AL-Typen wählen. Fehlende Auswahl bedeutet alle Typen. Ausgabe folgt der Manifestreihenfolge. Modular verwendet explizite Module und `src/<Modul>/<Objekttyp>`; keine Module ergibt nur den Gitignore-Vorschlag. Ungültige Namen werden abgewiesen; wiederholte Namen werden ohne Umbenennung dedupliziert. Standard akzeptiert keine Module.

Elternordner werden vor Kindern eingeplant. Vorhandene passende Ziele erhalten `skip`; Datei/Ordner-, Schreibweisen- oder Symlink-Konflikte erhalten `conflict`. Mehrdeutiger oder unvollständig gescannter Bestand blockiert Planung. Nachkommen opaker/ausgeschlossener Verzeichnisse werden nicht als sicher fehlend angesehen. `.gitkeep` nur für bewusst leere Blattordner; kein neuer Marker neben echten Dateien und keine Entfernung vorhandener Marker. Vorhandene `.gitignore` immer skip, kein Merge. Keine AL-Datei wird bewegt, umbenannt oder ersetzt.

`al.gitignore` ist eine projektspezifisch anpassbare Empfehlung: AL-Build/Symbolpakete/Cache, Snapshots/Logs, explizit lokale `.vscode/*.local.json`, Umgebungsdateien, Signierschlüssel/Lizenzen und OS-Artefakte. Gemeinsame `.vscode/settings.json` und optionale `launch.json` bleiben versionierbar; keine Zugangsdaten dort eintragen. Keine pauschale `.vscode`-Sperre.

## Tests und offene Anwendung
[EXT-003/004-Nachweis](../quality/EXT-003-004.md): Unit-Pläne, Gitignore-Snapshot, echte temporäre Dateibestände, bestandsidentische AL/app.json/Gitignore und zweiter Plan nach Testfixture-Anwendung ohne neue Creates. Der Anwendungsschritt existiert **nur im Testhelfer**. Im Produkt werden vor Anwendung weiterhin Preview, Zustimmung, frischer Bestand und Schreibfehlerbehandlung benötigt (EXT-009). [ADR 0002](../architecture/adr/0002-readonly-inspection-structure-plans.md).

## Begrenzte Neuprojekt-Anwendung (EXT-005, zur Prüfung)
`src/core/newProject.ts` erzeugt zusätzlich zum Strukturentwurf eine deterministische Workspace-Datei, statischen Einstieg und optional den unveränderten Text einer geprüften app.json. Keine eigenen AL-Versionen/IDs/Launch-Einstellungen werden erfunden.

`src/generation/createNewProject.ts` wendet ausschließlich bestätigte neue lokale file-Ziele an. Keine Bestandsanwendung. Ziel, URI-Grenzen, Eltern, Symlinks und Existenz werden vorab und pro Operation geprüft; Dateien entstehen durch native `workspace.fs.copy` mit `overwrite: false`. Ein eigener exklusiver OS-Scratch (Unix 0700) stellt Inhalte bereit und wird anschließend bereinigt; nur dessen Erstellung verwendet Node fs, niemals ein Zielprojekt. Fremdprovider werden abgewiesen, nachdem der Host-Test eine Race-Lücke im providerübergreifenden Copy-Fallback gezeigt hat.

Ergebnis: created/cancelled/blocked/partial mit angelegten Pfaden, gestopptem Ziel und ggf. temporärem Bereinigungsfehler. Teilfehler löschen keine Projektdateien. UI zeigt Vorschau/Zustimmung vorab und Einstieg/Ergebnis danach; Öffnen ist eine gesonderte Nutzerwahl. Allgemeine Preview-/Bestands-/SafeWriter-Pipeline bleibt EXT-009/010. [ADR 0003](../architecture/adr/0003-new-project-creation.md), [Tests](../quality/EXT-005.md).


## Microsoft-Create-Project-Korrektur (01.11.2026, zur Prüfung)

[ADR 0004](../architecture/adr/0004-automatic-microsoft-completion.md) präzisiert die Bestätigungspflicht nur für diesen Nutzerauftrag. [Prüfbericht und Grenzen](../quality/MICROSOFT-AL-WORKFLOW.md). `package.json` verwendet das bestehende `assets/Logo.png` als Extension-Icon; Paketinhalt lokal geprüft.


### Fehlerkorrektur am Speicher-Claim
Die exklusive Sperre unterstützt auch `vscode-userdata:` als lokalen Desktop-Profilalias. Der echte Aktivierungskontext wird im Host-Regressionstest verwendet; ein reiner temporärer `file:`-Test genügt dafür nicht. Nichtlokale Schemes/Authorities bleiben abgewiesen. Speicherfehler werden ohne native Pfade oder fremde Fehlertexte gemeldet.


## Bestands-Pipeline (EXT-008 bis EXT-010)
`core/existingProject.ts` plant deterministisch Create/Skip/Conflict aus Kontext, Strukturwahl und versionierten Vorlagen. Elternverzeichnisse sind explizite Operationen; vorhandene Inhalte werden nicht gemischt. `generation/existingProjectPlan.ts` bindet relative Ziele an Root-URIs. `ui/existingProjectPreview.ts` zeigt Kategorien, Gründe, Ziel-URIs, neue Inhalte und offene Prüfpunkte.

`generation/applyExistingProject.ts` schreibt ausschließlich nach Zustimmung, erfolgreicher lokaler Preflight und vollständigem frischem Planvergleich. Stale/Conflicts stoppen vor Writes; pro Operation folgen erneute Eltern-/Existenzprüfung, native Copy ohne Überschreiben und Inhaltsprüfung. Scratch außerhalb des Projekts, kein Rollback; Status applied/cancelled/blocked/stale/partial mit Create-/Skip-Pfaden, Fehlerpfad und Bereinigungsfehlern. Command und Writer blockieren parallele Aufrufe. Remote-/Virtual-Anwendung bleibt vor Writes gesperrt (ADR 0003); Planung bleibt URI-basiert.

`Setup Current Project` enthält keine Dateischreiblogik mehr. Standardauswahl bewahrt die bestehende AL-Struktur. [Prüfbericht](../quality/EXT-008-010.md).

## Fehlerkorrektur Neuanlage (02.11.2026)
Beide modularen Neuanlagewege rendern ausgewählte Module über `renderNewModuleDocumentation` aus der deklarativen Modulvorlage: `docs/modules/details/src/<Modul>.md` und verlinkter Index, keine behauptete Fachsemantik. Elternpfade werden vor Dateien erstellt. Microsofts Writer wird nur im ausdrücklich gebundenen Projektroot aufgerufen. [ADR 0007](../architecture/adr/0007-bound-project-completion.md).
