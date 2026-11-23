# cf65-blocks – Umsetzplan

Stand: 2026-11-23 · Grundlage: `docs/Stackable_Technische_Zusammenstellung.pdf` + Block-Übersicht (Screenshot, 42 Blöcke)

Schwerpunkte:
1. **Dynamic Content** mit **ACF und Pods** (erweiterbar; Meta Box, JetEngine, WooCommerce nach 1.0)
2. **Erweiterte Einstellungen pro Block** (Responsive, Style, Motion, Conditional Display, Custom CSS)
3. **Update-Sicherheit:** keine Blockfehler im Editor nach Plugin-Updates (Kap. 2.2)
4. **Security by Design:** das Plugin wird von Beginn an als Angriffsziel behandelt (Kap. 7)
5. **Debug-Modus mit Performance-Messung** (Kap. 8)

Rahmen: Open Source, öffentlich auf GitHub, Lizenz **GPL-2.0-or-later**, **keine Lizenzierung / kein Free-Premium-Split** – alle Funktionen im einen Plugin.

---

## 1. Anforderungen

### 1.1 Block-Katalog (43 Blöcke)

| Gruppe | Blöcke |
|---|---|
| Layout | Columns (+ Column), Hero, Card, Feature, Feature Grid, Horizontal Scroller, Spacer, Divider, Separator |
| Text | Heading, Subtitle, Text, Blockquote, Icon List, Table of Contents |
| Icon/Media | Icon, Icon Box, Icon Label, Image, Image Box, Video Popup, Map |
| Buttons/CTA | Button, Icon Button, Social Buttons, Call to Action, Notification |
| Interaktiv | Accordion, Tabs, Carousel, Expand / Show More, Countdown, Count Up |
| Daten/Zahlen | Number Box, Progress Bar, Progress Circle, Price, Pricing Box, Timeline |
| Personen | Team Member, Testimonial |
| Dynamisch | Posts, **Pagination** (Premium-Block aus dem Dokument) |

### 1.2 Funktionsbereiche aus dem Dokument

| Bereich | Inhalt | Priorität |
|---|---|---|
| Dynamic Content | Quellen Current/Latest/Other Post, Post-Felder, Custom Fields (ACF, **Pods**, Meta Box, JetEngine), Query-Loop-Kontext, Text/Bild/Hintergrund/Link, Datumsformat | **Muss** |
| Conditional Display | Login, Rolle, Datum, Post-Daten, Meta-/Feldwerte, Mehrfachbedingungen | **Muss** |
| Advanced Block Options | Custom CSS (gescopt, Selektor-Liste), Motion Effects (Entrance/Scroll), Transform, Shape Divider (mehrlagig) | **Muss** |
| Global Styling | Farbschemata, Typografie H1–H6/Subtitle/Text/Button (responsiv), globale Block-Styles, Preset-Werte, Icon-Library, Copy-Paste von Styles | Soll |
| Posts-Block | CPTs (`show_in_rest`), Offset, Load more, Pagination-Block | **Muss** |
| Design Tools | Block-Layouts (Varianten), Image-Blob-Shapes, Icon-Verläufe/-Hintergrundformen, Design Library (Patterns, ganze Seiten) | Kann (spät) |
| Agency Tools | Block CSS Customizer, User Role Manager | Soll |
| Integrationen | Font Awesome Pro (Kit, SVG) | Kann |
| Integrationen (nach 1.0) | Meta Box, JetEngine, WooCommerce | Backlog |
| Rahmen | Assets nur bei Bedarf laden, Einstellungen in `wp_options` mit Präfix, Export/Import | **Muss** |

### 1.3 Bewusste Abweichungen vom Vorbild

| Thema | Vorbild | cf65-blocks | Grund |
|---|---|---|---|
| ACF-Bedingungen | „Custom PHP" (PHP-Ausdruck aus dem Editor) | Bedingung **„Feldwert vergleichen"** (ACF/Pods, Operatoren) + per Filter registrierbare Code-Bedingungen | Aus dem Editor ausgeführtes PHP ist Remote-Code-Ausführung für jede Person mit Editor-Rechten |
| Dynamische Werte im Editor | teils veraltet (Dok. 3.5) | Live-Vorschau über REST-Endpunkt | Behebt die bekannte Einschränkung |
| Rendering | statisches HTML in `save()`, Blockfehler nach Updates/Downgrade (Dok. 9.2) | **Hybrid:** stabiles Minimal-Markup in `save()` + Anreicherung auf dem Server, verlustfreie Auto-Recovery | Keine Blockfehler, Inhalt bleibt auch ohne Plugin sichtbar; siehe Kap. 2.2 |
| Lizenz/Vertrieb | Freemius, Free + Premium | GPL, GitHub, alles enthalten | öffentliches Projekt |
| Pods | nicht unterstützt | gleichwertig zu ACF | Anforderung |
| Namen/Klassen | `stk-`, `stackable_` | `cf65-` / `cf65_blocks_` | eigene Codebasis, keine fremden Marken oder Assets |

---

## 2. Technische Basis

- **WordPress ≥ 6.7, PHP ≥ 8.5** (Block Bindings API, Interactivity API, `viewScriptModule`, Block-Metadata-Collection). Hinweis: WP-Core-Versionen vor den aktuellen Releases sind offiziell nicht gegen PHP 8.5 getestet → CI-Matrix WP 6.7 / latest / trunk auf PHP 8.5, Deprecation-Notices des Cores im Blick behalten.
- **Repository:** GitHub (public), GPL-2.0-or-later, `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, Issue-/PR-Templates, Conventional Commits, SemVer; Releases als ZIP über GitHub Actions. Updates für installierte Sites optional via `Update URI`-Header + GitHub-Releases (oder Git Updater).
- **Build:** `@wordpress/scripts` mit `--blocks-manifest`, ein `block.json` (apiVersion 3) pro Block
- **Frontend-Interaktivität:** Interactivity API (`@wordpress/interactivity`) statt eigener Skripte → nur geladen, wenn der Block auf der Seite ist
- **PHP:** Composer, PSR-4 `Cf65\Blocks\`, WPCS, PHPStan
- **Tests:** PHPUnit (Resolver, Bedingungen, CSS-Generator), Jest (Controls), Playwright-E2E mit `wp-env` (ACF + Pods vorinstalliert)

### 2.1 Verzeichnisstruktur

```
cf65-blocks/
├─ cf65-blocks.php              Bootstrap, Konstanten, Autoload
├─ composer.json / package.json / .wp-env.json
├─ includes/
│  ├─ Plugin.php                Service-Container, Hooks
│  ├─ Blocks/Registry.php       Registrierung via Manifest
│  ├─ Dynamic/
│  │  ├─ Resolver.php           Binding → Wert (inkl. Formatierung, Escaping, Cache)
│  │  ├─ Sources/               CurrentPost, SpecificPost, LatestPost, CurrentTerm, CurrentUser, Author, Site, Options
│  │  ├─ Providers/             CoreFields, PostMeta, Acf, Pods, (MetaBox, JetEngine, WooCommerce)
│  │  ├─ InlineRenderer.php     ersetzt Inline-Tokens im Text (WP_HTML_Tag_Processor)
│  │  └─ BindingsSource.php     Block-Bindings-Quelle für Core-Blöcke
│  ├─ Conditions/               Engine + Regeln (Login, Rolle, Datum, PostType, Term, Autor, Feldwert, Custom)
│  ├─ Styles/                   CssGenerator, Responsive, GlobalStyles, StyleCollector
│  ├─ Rest/                     FieldsController, PreviewController, PostsController
│  ├─ Security/                 Sanitizer (CSS-Werte, URLs, SVG), CapabilityGuard, AttributeGuard, FieldPolicy
│  ├─ Debug/                    Collector (No-Op wenn aus), Timer, ServerTiming, AdminBar, QueryMonitor, CLI-Bench
│  └─ Admin/                    Settings, RoleManager, ImportExport
├─ src/
│  ├─ blocks/<name>/            block.json, edit.js, render.php, view.js, style.scss, editor.scss
│  ├─ extensions/               gemeinsame Attribute/Panels (siehe Kap. 4)
│  ├─ components/               ResponsiveControl, UnitControl, ColorPicker, DynamicFieldPicker, ConditionBuilder …
│  ├─ formats/dynamic-field/    RichText-Format für Inline-Dynamik
│  ├─ store/                    @wordpress/data Store (globale Einstellungen, Geräteansicht)
│  └─ admin/                    Einstellungsseite (React)
├─ patterns/                    Block-Patterns / Design Library
├─ tests/
│  ├─ php/ · js/ · e2e/
│  └─ fixtures/blocks/          gespeichertes Markup je Block und Markup-Version (Update-Sicherheit)
└─ .github/                     Workflows (Lint, Tests, Fixtures, Release), Templates
```

### 2.2 Rendering- und Update-Strategie (sicherer Hybrid)

**Problem:** Gutenberg vergleicht beim Laden das gespeicherte HTML mit der aktuellen `save()`-Ausgabe. Ändert ein Update das Markup, zeigt der Editor „Dieser Block enthält unerwarteten Inhalt“. Reines Server-Rendering vermeidet das, zeigt aber ohne Plugin nichts mehr an.

**Lösung – vier Schutzschichten:**

1. **Stabiler Markup-Vertrag in `save()`**
   - `save()` gibt nur semantisches Minimal-Markup aus: Wrapper mit `class="cf65-block cf65-<blockname> cf65-<uniqueId>"`, Inhalt (Texte, Bilder, Links), Struktur. **Keine** Inline-Styles, keine stilabhängigen Klassen, keine dynamischen Werte.
   - Alles Veränderliche (Styles, Layout-Klassen, Dynamik, Motion-Attribute, ARIA-Erweiterungen) kommt **zur Laufzeit** über die Render-Callback-Stufe dazu (`render_block` + `WP_HTML_Tag_Processor`, mit dem gespeicherten HTML als `$content` – dasselbe Muster wie Core-Blöcke `core/image`, `core/navigation`).
   - Das Markup ist pro Block versioniert (`markupVersion`-Attribut). Damit ändert sich `save()` nur selten und bewusst.

2. **Alle Attribute im Block-Kommentar (keine `source`-Selektoren)**
   - Auch RichText-Inhalte werden als Kommentar-Attribut gespeichert, nicht aus dem HTML gelesen. Das HTML ist damit vollständig aus den Attributen ableitbar.
   - Folge: Ein Block lässt sich jederzeit **verlustfrei neu erzeugen** (Schicht 4). Mehrgrösse im Post-Content ist vernachlässigbar.

3. **CI-Gate gegen unbeabsichtigte Markup-Änderungen**
   - `tests/fixtures/blocks/<block>/<version>.html`: gespeichertes Markup aller bisherigen Versionen.
   - Test parst jede Fixture mit dem aktuellen Code: Block muss **gültig** sein oder über eine `deprecated`-Definition migrieren. Ändert ein PR die `save()`-Ausgabe ohne neue Fixture + Deprecation, schlägt die CI fehl.
   - Playwright-Test: Beitrag mit Blöcken der Vorversion (letztes Release-ZIP) anlegen, Plugin aktualisieren, Editor öffnen → keine Blockfehler.

4. **Automatische, verlustfreie Recovery im Editor (Sicherheitsnetz)**
   - Ein Editor-Filter prüft cf65-Blöcke beim Laden; ist einer ungültig, wird er aus seinen Kommentar-Attributen + InnerBlocks neu erzeugt (`createBlock`) und ersetzt – ohne Benutzeraktion, mit Hinweis-Snackbar. Dank Schicht 2 geht dabei nichts verloren.
   - Abschaltbar in den Einstellungen; Protokollierung in der Browser-Konsole.

**Verhalten im Fehlerfall / ohne Plugin:**

| Szenario | Ergebnis |
|---|---|
| Plugin-Update mit unverändertem Markup | nichts passiert, neue Styles/Features wirken sofort (Laufzeit-Anreicherung) |
| Plugin-Update mit Markup-Änderung | Deprecation migriert automatisch; falls doch ungültig → Auto-Recovery |
| Plugin deaktiviert/deinstalliert | gespeichertes Minimal-HTML bleibt sichtbar (Inhalte lesbar, ohne Plugin-Styles); dynamische Felder zeigen ihren Fallback-/Platzhaltertext |
| Interaktive Blöcke ohne JS | Progressive Enhancement: Accordion/Expand auf Basis von `<details>/<summary>`, Tabs als Abschnitte, Carousel als Liste |

**Ausnahme:** Rein dynamische Blöcke (Posts, Pagination, Table of Contents, Countdown-Serverzeit) speichern kein HTML (`save: () => null` bzw. nur InnerBlocks) – dort gibt es keine Validierung und damit auch keine Blockfehler.

---

## 3. Dynamic Content (Kernstück)

### 3.1 Architektur

```
Block-Attribut / Inline-Token
        │  (Binding: source, provider, field, args, fallback)
        ▼
  Resolver ──► Source (welches Objekt? Post-ID aus Block-Kontext, Term, User …)
        │
        └────► Provider (wie lesen? core / meta / ACF / Pods / …)
        ▼
  Formatter (Typ: text, html, url, image, date, number, bool, list) ──► Escaping je Ausgabekontext
```

**Interfaces (PHP):**
- `SourceInterface::resolve_object( array $binding, WP_Block $block ): ?ObjectRef` – liefert `{type: post|term|user|option, id}`
- `ProviderInterface::get_fields( ObjectContext ): FieldDefinition[]` (für den Feld-Picker)
- `ProviderInterface::get_value( ObjectRef, string $field, array $args ): mixed`
- Registrierung über Filter `cf65_blocks/dynamic/providers` und `…/sources` → Dritte können erweitern.

### 3.2 Datenmodell

Gebunden an Attribute (Bild, Link, Hintergrund, Zahl …):

```json
"dynamic": {
  "imageUrl": { "source": "current-post", "provider": "acf", "field": "portrait", "args": { "size": "large" }, "fallback": "" },
  "linkUrl":  { "source": "post", "postId": 42, "provider": "pods", "field": "website" }
}
```

Inline im Text (RichText-Format, überlebt Editor-Bearbeitung):

```html
<span class="cf65-dynamic" data-cf65-dynamic='{"source":"current-post","provider":"pods","field":"preis","args":{"prefix":"CHF "}}'>Platzhalter</span>
```

### 3.3 Quellen

| Quelle | Objekt | Hinweis |
|---|---|---|
| Current Post | `postId` aus Block-Kontext, sonst `get_the_ID()` | Pflicht im Query Loop und im eigenen Posts-Block (`usesContext: ["postId","postType"]`) |
| Specific Post | gewählte Post-ID | Suche im Picker über REST |
| Latest Post | neuester Post eines Typs (n-ter) | |
| Current Term / Archive | `get_queried_object()` | Taxonomie-Archive, ACF/Pods-Felder an Terms |
| Current User / Author | eingeloggter User / Post-Autor | User-Felder (ACF/Pods) |
| Site / Options | Titel, Tagline, URL; ACF-Options-Pages, Pods-Settings-Pods | |

### 3.4 Provider-Spezifika

| Provider | Feldliste | Wertzugriff | Besonderheiten |
|---|---|---|---|
| Core | Titel, Auszug, Inhalt, URL, Datum, Featured Image, Taxonomie-Terms, Autor, Kommentaranzahl | WP-API | – |
| Post Meta | registrierte Meta (`show_in_rest`) | `get_metadata()` | geschützte Meta (`_…`, `is_protected_meta`) ausgeschlossen |
| **ACF** | `acf_get_field_groups()` nach Location-Regeln für den Post-Typ | `get_field( $name, $selector, $format )` | Field Name **und** Field Key; Typen Text, WYSIWYG, Bild (ID/URL/Array), Link, Datei, Datum, Zahl, True/False, Select, Relationship/Post Object, Taxonomy, User; Repeater/Flexible → Phase 2 (Repeater-Loop-Block) |
| **Pods** | `pods_api()->load_pod()` → Felder des Pods | `pods( $pod, $id )->field( $name )` bzw. `->display()` | Pods für Post-Typen, Taxonomien, User, Settings-Pods; Relationship-Felder mit Traversal (`related.field`); File/Image-Felder |
| Meta Box, JetEngine | nach 1.0 | | gleiche Schnittstelle |
| WooCommerce | Preis, Sale-Preis, SKU, Lagerbestand, Add-to-cart-URL, Galerie | `wc_get_product()` | nach 1.0 |

### 3.5 Ausgabe & Formatierung

- Optionen je Binding: Fallback, Präfix/Suffix, Datumsformat (Preset oder PHP-`date()`-Format), Zahlenformat (Dezimalen, Tausender), Bildgrösse, Mehrfachwerte (erster / Liste mit Trenner), Link-Ziel, „Block ausblenden, wenn leer".
- Escaping je Ziel: Text `esc_html`, HTML `wp_kses_post`, URL `esc_url`, Attribute `esc_attr`.
- Request-Cache pro `(objekt, provider, feld, args)`.

### 3.6 Editor-Integration

- **DynamicFieldPicker** (Popover): Quelle → Objekt → Provider-Gruppe → Feld → Optionen; erreichbar über Toolbar-Icon (Text markieren) und über ein Icon neben jedem bindbaren Control (Bild, Hintergrund, Link, Zahl).
- **REST** `cf65-blocks/v1/dynamic/fields` (Feldliste je Kontext) und `…/dynamic/preview` (aufgelöste Werte für die aktuelle Post-ID, Batch). Berechtigung: `edit_post` auf das Zielobjekt.
- Im Query Loop zeigt der Editor die Werte des jeweiligen Loop-Eintrags (Kontext `postId`).
- **Core-Blöcke:** eigene Block-Bindings-Quelle `cf65/dynamic` für Paragraph, Heading, Image, Button (WP-Bindings-API).

### 3.7 Sicherheit

- Felder nur ausgeben, wenn das Objekt öffentlich lesbar ist (Status, Passwortschutz, `read_post`).
- Keine geschützte Meta, keine Pods-/ACF-Felder, die als „nicht öffentlich" konfiguriert sind (Filter `cf65_blocks/dynamic/allow_field`).
- Preview-Endpunkt nur für Benutzer mit Bearbeitungsrecht.

---

## 4. Erweiterte Einstellungen pro Block

Ein gemeinsames **Extension-System** hängt Attribute und Inspector-Panels an alle cf65-Blöcke (per `blocks.registerBlockType`-Filter bzw. Hilfsfunktion in `block.json`-Attributen). Jeder Block deklariert in `block.json` unter `"cf65": { "supports": [...] }`, welche Extensions er nutzt.

### 4.1 Inspector-Aufbau (3 Tabs)

| Tab | Inhalt |
|---|---|
| **Layout** | Block-Layout-Variante, Ausrichtung, Breite/Höhe, Flex/Grid-Optionen, Spaltenanzahl |
| **Style** | blockspezifische Elemente (Titel, Icon, Bild, Button …), Typografie, Farben/Verläufe, Hintergrund (Bild/Video/Overlay, dynamisch bindbar), Rahmen, Radius, Schatten, Spacing, Hover-Zustand |
| **Advanced** | HTML-Tag, Anker/ID, Klassen, Position/z-index, Transform, Motion Effects, Shape Divider, Sichtbarkeit pro Gerät, **Conditional Display**, **Custom CSS** |

### 4.2 Gemeinsame Controls

- **Responsive:** jeder Wert optional pro Gerät (Desktop/Tablet/Mobile), gekoppelt an die Editor-Vorschau; Breakpoints global einstellbar.
- **Hover:** Normal/Hover/Parent-Hover für Farben, Schatten, Transform, Opacity.
- **Einheiten:** px/em/rem/%/vw/vh, Theme-Presets (`theme.json` Spacing/Font-Sizes) wählbar.
- **Globale Werte:** jeder Farb-/Typo-Wert kann auf eine globale Variable zeigen (`var(--cf65-color-primary)`), damit Änderungen site-weit wirken.

### 4.3 CSS-Erzeugung

- Jeder Block erhält eine stabile `uniqueId` (Klasse `cf65-<id>`).
- `Styles/CssGenerator.php` erzeugt aus den Attributen gescoptes CSS inkl. Media Queries – **eine Quelle der Wahrheit** für Editor (JS-Port derselben Map) und Frontend.
- Frontend: CSS pro Seite gesammelt und einmal im `<head>`/Footer ausgegeben; Cache als Post-Meta (Hash der Attribute) → kein Neuberechnen bei jedem Request.
- Basis-Stylesheet pro Block nur, wenn der Block gerendert wird (`block.json` `style`); Ziel ≤ 10 KB CSS auf typischen Seiten (Dok. 9.1).

### 4.4 Guided Custom CSS

- Panel listet die blockinternen Selektoren (aus `block.json` `cf65.selectors`), z. B. `Titel → .cf65-heading__title`.
- Eingabe wird auf `.cf65-<id>` gescopt, leere Selektoren entfallen, Live-Vorschau im Editor.
- Nur für Rollen mit `unfiltered_html` bzw. gemäss Role Manager; Ausgabe durch CSS-Sanitizer (kein `</style>`, kein `expression()`, keine `javascript:`-URLs).

### 4.5 Motion Effects

| Typ | Umsetzung |
|---|---|
| Entrance | `IntersectionObserver`, einmalig; Startwerte X/Y/Scale/Rotate/Opacity, Dauer, Verzögerung, Easing; Werte pro Gerät |
| Scroll | Scroll-gesteuert (CSS `animation-timeline: view()` mit JS-Fallback); Opacity, Scale, Blur, Translate, Rotate für Ein-/Austritt; Optionen Smoothing, 3D-Transforms |

- Skript als Interactivity-Modul, nur geladen, wenn ein Block Motion nutzt.
- `prefers-reduced-motion` respektieren.
- Editor: Vorschau-Button im Panel (Dok.: „nur im Frontend sichtbar" – wir verbessern das).

### 4.6 Conditional Display

- Modus: **Anzeigen wenn** / **Ausblenden wenn**; Verknüpfung **alle (UND)** / **eine (ODER)**.
- Regeln:
  - Login-Status, Benutzerrolle, bestimmter User
  - Datum/Uhrzeit (von–bis, Wochentage, wiederkehrend)
  - Post-Typ, Post-ID, Taxonomie-Term, Autor, Seitentemplate
  - **Feldwert (ACF / Pods / Post Meta):** Operatoren `ist leer`, `ist nicht leer`, `=`, `≠`, `enthält`, `>`, `<`, `true/false` – deckt die Beispiele aus Dok. 4.1 ohne PHP ab
  - WooCommerce (nach 1.0): im Warenkorb, gekauft, Lagerstatus
  - Custom: Code-registrierte Bedingungen via `cf65_blocks/conditions/register` (Auswahl im Editor, Logik in PHP-Datei des Themes)
- Auswertung serverseitig im `render_block`-Filter → ausgeblendete Blöcke erzeugen kein Markup.
- Hinweis zu Page-Caching (User-abhängige Regeln) in der UI.
- Gilt auch für Core-Blöcke (Advanced-Panel per Filter einblenden, optional in den Einstellungen).

### 4.7 Weitere Optionen

- Transform (translate/rotate/scale/skew, Origin, Hover)
- Mehrlagige Shape Divider (oben/unten, Formen-Bibliothek als SVG, Farbe/Höhe/Flip/Ebenen)
- Image-Blob-Shapes (SVG-Masken, 50+)
- Icon-Verläufe und Hintergrundformen
- Sichtbarkeit pro Gerät (CSS-basiert)

---

## 5. Global Styling & Agency Tools

| Funktion | Umsetzung |
|---|---|
| Globale Farben | beliebig viele Schemata, Presets; als CSS-Variablen + in `theme.json`-Palette eingespeist (`wp_theme_json_data_theme`) |
| Globale Typografie | H1–H6, Subtitle, Text, Button; responsiv; Font-Pairs als Presets; optional lokal gehostete Google Fonts (DSGVO) |
| Globale Block-Styles | pro Blocktyp gespeicherte Stil-Sets (CPT `cf65_block_style`), Anwendung via Dropdown, Änderungen wirken überall |
| Copy/Paste Styles | Toolbar-Aktion: Style-Attribute kopieren/einfügen (gleicher oder kompatibler Blocktyp) |
| Icon-Library | eigene SVG-Icons hochladen, Font Awesome Free mitgeliefert, Pro per Kit (Icons = Pro, Technology = SVG) |
| Block CSS Customizer | globales CSS pro Blocktyp in den Einstellungen |
| User Role Manager | je Rolle: erlaubte Blöcke, sichtbare Panels (z. B. Custom CSS, Conditional Display, Dynamic Content), Design-Library-Zugriff |
| Einstellungen | `wp_options` Präfix `cf65_blocks_`, Export/Import als JSON, WP-CLI-Befehle |

---

## 6. Posts- und Pagination-Block

- Quelle: alle Post-Typen mit `show_in_rest` (inkl. ACF/Pods-CPTs), Taxonomie-Filter, Autor, Includes/Excludes, Aktuellen Post ausschliessen, Sortierung (auch nach Meta-Feld), Offset, Anzahl.
- Layout-Varianten (Liste, Grid, Masonry, Karten), Elemente ein-/ausblendbar und sortierbar.
- **Item-Template mit InnerBlocks** (Option): beliebige cf65-Blöcke mit „Current Post"-Dynamik im Item → gleiches Prinzip wie Query Loop.
- „Load more" via Interactivity API + REST `cf65-blocks/v1/posts`; Pagination-Block (numerisch / Prev-Next) via Block-Kontext.
- Ebenso volle Unterstützung des Core-Query-Loops (Kontext `postId`).

---

## 7. Sicherheit (Security by Design)

Das Plugin ist öffentlich auf GitHub – Angreifer kennen den Code. Sicherheit ist daher Teil jeder Phase und der Definition of Done, nicht ein Schlussaudit.

### 7.1 Bedrohungsmodell

| Angreifer | Angriffsfläche | Typische Angriffe |
|---|---|---|
| Anonyme Besucher | öffentliche REST-Routen (Posts/Load more), Frontend-Skripte, Formular-/Query-Parameter | Datenabfluss (private Posts/Felder), DoS über teure Abfragen, reflektiertes XSS |
| Benutzer mit geringen Rechten (Mitarbeiter, Autor) | Block-Attribute im Post-Content (frei manipulierbares JSON), Editor-REST-Routen | **Stored XSS**, CSS-Injection (`</style>`-Ausbruch), Auslesen fremder/privater Felder über Dynamic Content, Umgehen von Role-Manager-Sperren |
| Admins mit kompromittiertem Konto / CSRF | Einstellungen, Import, Icon-Upload | Schadcode über SVG/Import, persistente Skripte |
| Lieferkette | npm/Composer-Abhängigkeiten, GitHub Actions, Release-ZIP | manipulierte Pakete, gestohlene Tokens, verändertes Release |

### 7.2 Grundregeln im Code

- **Alle Block-Attribute sind unvertrauenswürdig.** Der Editor ist keine Sicherheitsgrenze – Attribute können per REST direkt gesetzt werden. Jede Prüfung, die im UI passiert, wird **serverseitig wiederholt**.
- **Spät escapen:** jede Ausgabe mit `esc_html`, `esc_attr`, `esc_url`, `wp_kses_post` im Ausgabekontext; HTML-Manipulation nur über `WP_HTML_Tag_Processor`, nie per String-Verkettung.
- **CSS nur aus typisierten Werten:** `Security/Sanitizer` validiert jeden Stilwert nach Typ (Farbe, Länge+Einheit, Enum, Zahl, Medien-ID). Freitext gelangt nie ins CSS ausser über Custom CSS (siehe unten).
- **Custom CSS / Block CSS Customizer:** nur mit `unfiltered_html`; serverseitig beim Speichern (`wp_insert_post_data`) entfernt, wenn die Berechtigung fehlt. Zusätzlich CSS-Sanitizer (kein `</style`, `@import`, `expression(`, `javascript:`, `behavior`).
- **Role Manager wird serverseitig durchgesetzt:** gesperrte Blöcke/Panels werden beim Speichern entfernt bzw. auf Standardwerte zurückgesetzt, nicht nur im Editor ausgeblendet.
- **REST:** jede Route mit `permission_callback` (nie `__return_true` ohne Begründung im Code-Review), JSON-Schema für Argumente, Nonce (`wp_rest`), Obergrenzen (`per_page` ≤ 50, Offset begrenzt).
- **Kein `eval`, kein `unserialize` auf Benutzerdaten, keine dynamischen Funktionsnamen aus Attributen;** Datenbankzugriffe nur über WP-APIs bzw. `$wpdb->prepare()`.
- **Einstellungen:** `manage_options`, `register_setting` mit Schema; Import-JSON gegen Schema validiert, unbekannte Schlüssel verworfen.
- **SVG-Uploads** (Icon-Library, Shapes): nur Admins, Bereinigung mit `enshrined/svg-sanitize`, keine Skripte/Event-Handler/externen Referenzen.
- **Frontend-JS:** kein `innerHTML` mit Daten aus Attributen, keine Inline-Skripte mit dynamischem Inhalt → CSP-kompatibel.
- **Externe Ressourcen:** Video Popup nur YouTube (`youtube-nocookie`), Vimeo, Mediathek; Map-API-Schlüssel mit Hinweis auf Referrer-Beschränkung; Font-Awesome-Kit-URL per Regex validiert; standardmässig keine Aufrufe externer Dienste (Datenschutz/DSGVO).

### 7.3 Dynamic Content & Bedingungen – Datenabfluss verhindern

- **Objektprüfung beim Rendern:** Ziel-Post muss öffentlich sichtbar sein (`is_post_publicly_viewable`, kein Passwortschutz) – sonst Fallback. Verhindert, dass ein Autor Felder privater Entwürfe in eine öffentliche Seite bindet.
- **FieldPolicy:** geschützte Meta (`_`-Präfix, `is_protected_meta`) gesperrt; ACF/Pods-Felder nur von öffentlichen Post-Typen/Taxonomien; optionaler Whitelist-Modus in den Einstellungen.
- **User-Quelle:** nur sichere Felder (Anzeigename, Biografie, Avatar, explizit freigegebene Meta) – niemals E-Mail, Login, Passwort-Hash, Sessions.
- **Options-Quelle:** nur ACF-Options-Pages und Pods-Settings-Pods, keine beliebigen `wp_options`.
- **Bedingungen** werden nur serverseitig ausgewertet; ausgeblendeter Inhalt erscheint nie im HTML.

### 7.4 Lieferkette & Repository

- `SECURITY.md` mit Meldeweg (GitHub Private Vulnerability Reporting), Reaktionszeiten.
- Dependabot (npm, Composer, Actions), `composer audit` und `npm audit` in CI, Lockfiles committet.
- GitHub Actions auf Commit-SHA gepinnt, minimale `permissions`, keine Secrets in PR-Workflows aus Forks.
- CodeQL (JS), Secret Scanning, Branch Protection mit Pflicht-Review.
- Release-ZIP reproduzierbar gebaut, ohne Dev-Dateien, mit SHA-256-Prüfsumme (optional Signatur / Build-Provenienz).

### 7.5 Prüfung

- **Statisch:** PHPCS mit WPCS-Security-Sniffs (`EscapeOutput`, `ValidatedSanitizedInput`, `NonceVerification`, `PreparedSQL`) als harter CI-Fehler; PHPStan auf hoher Stufe; Semgrep-Regeln für WordPress.
- **Tests:** Sicherheits-Testsuite mit XSS-/CSS-Injection-Payloads für jedes Attribut jedes Blocks (generiert aus `block.json`); E2E als Rolle „Mitarbeiter“, die per REST manipulierte Attribute speichert; Tests für Feld-Lecks über Dynamic Content.
- **Definition of Done pro Block/Feature:** Sicherheits-Checkliste im PR-Template (Eingaben, Ausgaben, Rechte, REST, Tests).
- **Vor 1.0:** internes Security-Review aller REST-Routen und Render-Pfade; WPScan-/Plugin-Check-Lauf.

---

## 8. Debug-Modus & Performance-Messung

### 8.1 Aktivierung

- Konstante `define( 'CF65_BLOCKS_DEBUG', true );` in `wp-config.php` **oder** Schalter in den Einstellungen (`manage_options`).
- Messergebnisse sind **nur für Admins** sichtbar (Admin-Bar, Header, REST) – Laufzeitdaten verraten Interna und werden nie öffentlich ausgegeben.
- Admin-Hinweis, solange der Modus auf einer Umgebung mit `WP_ENVIRONMENT_TYPE = production` aktiv ist.
- **Kein Overhead im Normalbetrieb:** ohne Debug-Modus wird ein No-Op-Collector verwendet; keine Timer, keine zusätzlichen Hooks.

### 8.2 Was gemessen wird (Server)

| Messpunkt | Kennzahlen |
|---|---|
| Block-Rendering | Zeit pro Blockinstanz und pro Blocktyp (Anzahl, Summe, Max), Verschachtelung |
| Dynamic Content | Anzahl Auflösungen, Zeit pro Provider (Core/Meta/ACF/Pods), Cache-Treffer/-Fehlschläge |
| Conditional Display | Auswertungen, Zeit, ausgeblendete Blöcke |
| CSS-Generierung | Cache-Treffer/Neuberechnung, Zeit, erzeugte Bytes |
| Datenbank | Anzahl Queries im cf65-Code (Delta `$wpdb->num_queries`; mit `SAVEQUERIES` inkl. SQL und Aufrufer) |
| Speicher | Spitzenverbrauch, Delta durch das Plugin |
| Assets | geladene Styles/Skript-Module des Plugins mit Grösse (Vergleich mit Budget aus Kap. 4.3) |

Zeitmessung mit `hrtime()`; Blockzeiten über `pre_render_block` / `render_block` mit frühester bzw. spätester Priorität.

### 8.3 Ausgabe

- **Admin-Bar-Menü „cf65 Performance“:** Zusammenfassung der aktuellen Seite (Gesamtzeit Plugin, langsamste Blöcke, Queries, CSS/JS-Bytes); Detailtabelle aufklappbar, Export als JSON.
- **`Server-Timing`-Header** (nur für Admins): z. B. `cf65-render;dur=12.4, cf65-dynamic;dur=3.1, cf65-css;dur=0.8` → direkt in den Browser-DevTools sichtbar.
- **Query-Monitor-Integration:** eigenes Panel, falls Query Monitor aktiv ist.
- **Frontend-JS:** `performance.mark/measure` für Initialisierung der Interaktivitäts-Module (Motion, Carousel …) → im DevTools-Performance-Tab sichtbar.
- **Editor:** Messung von CSS-Generierung und Preview-REST-Aufrufen in der Browser-Konsole.
- **Verlauf:** letzte 20 Berichte als Transient, abrufbar über admin-only REST-Route bzw. Einstellungsseite.

### 8.4 Benchmark & Regressionsschutz

- **WP-CLI:** `wp cf65 bench <post-id> --runs=20 [--user=<id>]` rendert den Inhalt mehrfach und gibt Mittelwert/p95 pro Blocktyp, Queries und Speicher aus (Tabelle oder JSON).
- **CI-Performance-Budget:** Referenzseite mit allen Blöcken (inkl. ACF/Pods-Bindings) wird in CI gebencht; Überschreitung des Budgets (Zeit, Queries, CSS-/JS-Bytes) oder Regression > 20 % gegenüber `main` lässt den Build fehlschlagen.

---

## 9. Phasen & Meilensteine

| Phase | Inhalt | Ergebnis / Abnahme |
|---|---|---|
| **0 – Setup** (≈ 1,5 Wo.) | GitHub-Repo (GPL, README, CONTRIBUTING, `SECURITY.md`, PR-Template mit Sicherheits-Checkliste), Composer/NPM, `wp-env` (PHP 8.5) mit ACF + Pods + Testdaten, Lint inkl. WPCS-Security-Sniffs, PHPStan, PHPUnit/Jest/Playwright, GitHub Actions (gepinnt, CodeQL, Dependabot, Audits), Release-ZIP | Plugin aktivierbar, Build + Tests + Security-Checks laufen in CI |
| **1 – Framework** (≈ 4,5 Wo.) | Extension-System, Responsive/Hover-Controls, CSS-Generator (PHP + JS), uniqueId, Inspector-Tabs, **Update-Sicherheit (Kap. 2.2):** Markup-Vertrag, Laufzeit-Anreicherung, Fixture-Tests, Auto-Recovery; **Security-Basis (Kap. 7):** Sanitizer, AttributeGuard, CapabilityGuard, Payload-Testsuite; **Debug-Modus (Kap. 8):** Collector, Server-Timing, Admin-Bar, `wp cf65 bench`; Pilotblöcke **Heading, Text, Button, Image, Columns/Column** | Pilotblöcke voll stylbar, responsiv, CSS identisch in Editor und Frontend; Fixture-, Security- und Performance-CI aktiv |
| **2 – Dynamic Content** (≈ 3 Wo.) | Resolver, Sources, Provider Core/Meta/**ACF**/**Pods**, Inline-Format, Attribut-Bindings, Picker, Preview-REST, Query-Loop-Kontext, Bindings-Quelle für Core-Blöcke | ACF- und Pods-Felder (Text, Bild, Link, Datum, Zahl, Relation) in Text/Bild/Hintergrund/Link, live im Editor und im Query Loop |
| **3 – Conditional Display** (≈ 1,5 Wo.) | Engine, alle Regeln inkl. Feldwert-Vergleich ACF/Pods, UI-Builder, Core-Block-Support | E2E-Tests je Regeltyp |
| **4 – Blöcke Welle 1** (≈ 4 Wo.) | statische/Layout-Blöcke: Hero, Card, Feature, Feature Grid, Icon, Icon Box, Icon Label, Icon List, Image Box, Divider, Separator, Spacer, Subtitle, Blockquote, Icon Button, Social Buttons, CTA, Notification, Number Box, Price, Pricing Box, Team Member, Testimonial, Timeline | 24 Blöcke inkl. Layout-Varianten, alle dynamisch bindbar |
| **5 – Blöcke Welle 2** (≈ 3 Wo.) | interaktiv (Interactivity API): Accordion, Tabs, Carousel, Horizontal Scroller, Expand, Count Up, Countdown, Progress Bar, Progress Circle, Video Popup, Table of Contents, Map | barrierefrei (ARIA, Tastatur), Skripte nur bei Bedarf |
| **6 – Posts & Pagination** (≈ 2 Wo.) | Posts-Block, Item-Template, Load more, Pagination-Block | CPTs aus ACF/Pods abfragbar, Meta-Sortierung |
| **7 – Advanced Options** (≈ 2 Wo.) | Motion Effects, Transform, Shape Divider, Blob-Shapes, Icon-Verläufe, Guided Custom CSS | Performance-Budget eingehalten |
| **8 – Global Styling** (≈ 2 Wo.) | Farben, Typografie, Block-Styles, Copy/Paste, Icon-Library, Einstellungsseite | Änderungen wirken site-weit ohne Neuspeichern der Seiten |
| **9 – Agency Tools** (≈ 1,5 Wo.) | Role Manager, Block CSS Customizer, Import/Export, WP-CLI, Font Awesome Pro | |
| **10 – Library & Release** (laufend/≈ 3 Wo.) | Patterns/ganzseitige Designs, i18n (de_CH, de_DE, en), Doku, Uninstall-Routine, **Security-Review aller REST-Routen und Render-Pfade**, Plugin-Check, Performance-Abnahme, GitHub-Release 1.0 (manuelle Installation) | Version 1.0 |
| **Backlog nach 1.0** | Provider Meta Box, JetEngine; WooCommerce (Dynamik, Bedingungen, Produktseiten); Update-Mechanismus | |

Gesamt grob **27–29 Wochen** für eine Person; Phase 2 und 4 lassen sich nach Phase 1 parallelisieren. Ab Phase 2 gilt für jedes Feature: Sicherheits-Checkliste erfüllt, Payload-Tests grün, Performance-Budget eingehalten, Debug-Messpunkte vorhanden.

---

## 10. Entscheide / offene Punkte

| # | Frage | Stand |
|---|---|---|
| E1 | Rendering / Update-Fehler | ✅ **Hybrid** mit vier Schutzschichten (Kap. 2.2) |
| E2 | Lizenzierung | ✅ keine; GPL, public auf GitHub, alle Funktionen enthalten |
| E3 | „Custom PHP"-Bedingung wie im Vorbild? | Empfehlung **Nein**, ersetzt durch Feldvergleich + code-registrierte Bedingungen |
| E4 | Mindestversionen | ✅ WP 6.7 / **PHP 8.5** |
| E5 | Pods-Umfang | Post-Typen, Taxonomien, User, Settings-Pods, Relationen mit Traversal; Advanced Content Types (eigene Tabellen) in Phase 2 |
| E6 | Meta Box / JetEngine / WooCommerce | ✅ nach 1.0 (Backlog) |
| E7 | Design Library: Inhalt (Patterns, Seiten) | Umfang separat planen; Technik in Phase 10, Inhalte laufend |
| E8 | Plugin-Updates auf Sites | ✅ vorläufig manuell (ZIP aus GitHub-Releases); Update-Mechanismus nach fehlerfreiem Stand |
| E9 | Sicherheit | ✅ Security by Design ab Phase 0 (Kap. 7) |
| E10 | Debug-Modus | ✅ Konstante oder Einstellung, Ausgabe nur für Admins, No-Op im Normalbetrieb (Kap. 8) |
