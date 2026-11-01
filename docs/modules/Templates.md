# Modul Templates und Manifest-Verträge

## Status und Verantwortung
EXT-002 ist technisch umgesetzt und zur Prüfung. Versionierte Manifest-/Profildaten und reine Validierung sind vorhanden. Rendering vollständiger Agenten-Projektdateien und allgemeine Bestandsanwendung sind noch nicht implementiert. EXT-003/004 ergänzen `src/templates/bundled.ts` für das URI-basierte Lesen ausgelieferter Ressourcen und Strukturplanung; EXT-005 ergänzt den lokalen Neuprojekt-Wizard/Writer und die statische Einstiegsressource `resources/templates/new-project/GETTING_STARTED.md`.

## Dateien und Schnittstellen
- `src/core/templateModels.ts`: `TemplateManifest`, `TemplateEntry`, `TemplateVariable`, `ProjectProfile`, `ProfileCatalog`, Eingabewerte und der reine `GenerationPlan`-Vertrag.
- `src/core/templateValidation.ts`: Daten-/JSON-Prüfung, portable Pfadregeln, Platzhalter-Syntax und `TemplateValidationError` mit Codes `schema`, `version`, `path`, `token`, `duplicate`, `input`.
- `src/core/manifestValidation.ts`: `validateManifest(unknown)` und `validateTemplateInputs(manifest, unknown)`; liefert geprüfte Kopien bzw. ein neues Eingabeobjekt mit Defaults. Keine Mutation der Eingaben.
- `src/core/profileValidation.ts`: `validateProfileCatalog`, `resolveProfile`, `validateProfileInputs`; geordnete Komposition ohne implizite Vererbung oder Overrides.
- `src/templates/catalog.ts`: `loadManifest(text)` und `loadProfileCatalog(text)`; lädt übergebenes JSON als Daten und validiert es. Kein Dateisystem-, Netzwerk- oder VS-Code-Zugriff.
- `resources/templates/profiles.json` und `al-{standard,modular}/manifest.json`: kanonische ausgelieferte Daten, derzeit nur Objektordner-Verträge. Die historischen Beispiele unter Root-`templates/` sind nicht Teil des Laufzeitkatalogs.

## Format Version 1
Manifest: `schemaVersion: 1`, portable `id`, `version: MAJOR.MINOR.PATCH` ohne führende Nullen/Zusätze, `variables` und `entries`. Schema- und Inhaltsversion sind getrennt. Unbekannte Felder und doppelte JSON-Feldnamen werden zurückgewiesen, auch bei Unicode-Escapes im Feldnamen.

IDs bestehen aus Kleinbuchstaben/Ziffern und einzelnen Bindestrichen, beginnen mit einem Buchstaben und sind höchstens 64 Zeichen lang. Variablennamen sind case-sensitive ASCII-Bezeichner, beginnen mit einem Buchstaben, erlauben danach Ziffern/Unterstrich und sind höchstens 64 Zeichen lang. Reservierte Namen wie `constructor` sind verboten.

Variablen benötigen `name`, `type`, `required`; ein typgerechter `default` ist optional:

| Typ | Wert / Verwendung |
|---|---|
| `text` | Einzeiliger Text ohne Steuerzeichen oder eingeschleuste Platzhalter; nicht in Zielpfaden |
| `pathSegment` | Genau ein portabler Pfadbestandteil |
| `boolean` | Boolean, auch als reine deklarative Bedingung |
| `pathSegments` | Liste portabler, case-insensitiv eindeutiger Pfadbestandteile für Wiederholungen |

Erforderliche Werte müssen geliefert werden oder einen Default haben. Auch optionale Variablen benötigen einen Wert/Default, sobald sie in Inhalt, Ziel oder Bedingung referenziert sind. Unreferenzierte optionale Variablen dürfen fehlen. Erforderliche Textwerte dürfen nicht leer sein; eine explizite leere Modulliste ist zulässig. Referenzierte Werte werden konservativ auch für optionale bzw. bedingte Einträge verlangt.

Einträge benötigen `id`, `kind` (`directory`/`file`) und `target` als relativen POSIX-Pfad. Dateien haben zusätzlich `fileType` (`text`/`markdown`/`json`/`al`) und `content` als unverändert gespeicherten Text. `fileType` beschreibt den späteren Inhalt; es beweist keine AL-/JSON-Konformität. Inhalt wird weder ausgeführt noch hier vollständig gerendert.

Optionale Felder: `optional: boolean` markiert spätere Nutzerauswahl, `condition: {variable, equals}` vergleicht ausschließlich eine deklarierte Boolean-Variable mit einem Boolean-Literal. Keine Ausdrücke oder Scripts. `repeatFor` bezeichnet eine deklarierte `pathSegments`-Variable, deren Token im Ziel vorkommen muss. Listen-Tokens dürfen ausschließlich innerhalb ihrer passenden Wiederholung verwendet werden.

Einzige Platzhalter-Syntax: `{{NAME}}`, ohne Leerzeichen, Ausdrücke oder rekursive Expansion. Zielpfade erlauben nur Pfadvariablen. Dateiinhalte dürfen auch Text-/Boolean-Tokens enthalten. Zielsubstitution dient hier ausschließlich der Validierung; sie erstellt keinen Änderungsplan. Bedingungen und `optional` werden dabei konservativ nicht zum Ausblenden ungültiger Einträge verwendet.

## Profile und Komposition
Ein Profil hat `id`, `name`, `manifestIds`; der Katalog hat `schemaVersion: 1` und `profiles`. Profile referenzieren vollständige Manifeste in expliziter Reihenfolge. Keine Vererbung und keine stillen Überschreibungen. Identische Variablendeklarationen mehrerer Manifeste werden geteilt; widersprüchliche Deklarationen, doppelte Eintrag-IDs und kollidierende Ziele scheitern. Reihenfolge der Profile, Referenzen und Einträge bleibt erhalten.

Standard definiert die 14 vereinbarten Ziele `src/<Objekttyp>`. Modular definiert dieselben Typen unter `src/{{MODULES}}/<Objekttyp>` mit `repeatFor: MODULES`. EXT-004 übersetzt diese Daten jetzt in bestandsschonende Struktur-/Git-Pläne; die allgemeine Bestandsanwendung bleibt bei EXT-009; bestätigte lokale Neuziele werden durch EXT-005 angelegt. Beispiele für gültige Eingaben: Standard `{}`, Modular `{ MODULES: [] }`, `{ MODULES: ['Sales'] }` oder mehrere eindeutige Module.

## Sicherheitsgrenzen und Migration
Relative Pfade dürfen keine leeren Segmente, `.`/`..`, absoluten Pfade, URI-Schemes, Backslashes, Prozentcodierungen, Steuer-/Formatzeichen, problematischen Windows-Zeichen/Gerätenamen, abschließenden Punkte/Leerzeichen oder uneinheitliche Unicode-Normalisierung enthalten. Einzelne Segmente höchstens 255, Zielpfade höchstens 4096 UTF-16-Codeeinheiten. Case-insensitive Zielduplikate und Dateien als Eltern anderer Ziele werden vor und nach Substitution abgewiesen; Eingaben bleiben unverändert, es wird nicht still normalisiert.

Das ist eine lexikalische Prüfung. Root-URI, Provider-Unterstützung, Symlinks und tatsächliche Bestandskonflikte müssen Resolver/SafeWriter später am Ziel prüfen. Das `GenerationPlan`-Interface ist noch kein validierter oder freigegebener Schreibplan.

Legacy-Manifeste ohne `schemaVersion` und andere Schema-Versionen werden ausdrücklich zurückgewiesen; keine automatische Migration. Eine spätere Migration benötigt einen separaten Adapter zur bekannten Quellversion, unveränderte Originaldaten, eine erneute vollständige Validierung und Vorschau/Zustimmung vor Übernahme ins Zielprojekt. Aktuell werden keine externen Benutzer-Manifeste importiert. Details: [ADR 0001](../architecture/adr/0001-template-manifest-contract.md).

## Tests und weitere Arbeit
[EXT-002-Testnachweis](../quality/EXT-002.md). Tests prüfen auch Literalinhalt, Defaults, Wiederholung, Negativfälle, Komposition und mehrfaches deterministisches Laden. Ressourcenadapter und Strukturplaner wurden mit EXT-003/004 ergänzt; vollständiger Renderer, Vorschau und Writer bleiben den jeweiligen Folgetickets vorbehalten.


## Bestandsdokumentation 1.0.0 (EXT-008 bis EXT-010)
`resources/templates/existing-project/version.json` legt Schema 1 / Version 1.0.0 fest. Sieben deklarative Markdown-Vorlagen (Index, Modul, Erkennungsbericht, Lücken, Initialisierung, Projektfakten, Einstiegszusatz) werden durch `templates/bundled.ts` über Extension-URIs geladen. `core/existingDocumentationTemplates.ts` verlangt vollständige Dateien und exakt definierte Tokenverträge, lehnt unbekannte Versionen/Platzhalter ab und ersetzt Werte einmalig literal. Keine rekursive Expansion, Auswertung oder fremden Daten als Code. Die neun bisherigen Agenten-Vorlagen bleiben unverändert und werden im Bestandsplan nur um tatsächliche Belege ergänzt; bereits bestehende Zieldateien sind immer Skip.
