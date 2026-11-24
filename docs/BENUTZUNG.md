# cf65 Blocks – Benutzung

Stand: Phase 2.1 (Version 0.1.0-dev). Beschrieben sind nur Funktionen, die im Plugin bereits umgesetzt sind. Dynamic Content gibt es bisher für Bild und Button aus dem aktuellen Beitrag. ACF, Pods, Text-Felder, Conditional Display, Motion Effects und Custom CSS folgen (siehe [UMSETZPLAN.md](UMSETZPLAN.md)).

## Inhalt

1. [Installation](#1-installation)
2. [Grundlagen](#2-grundlagen)
3. [Blöcke](#3-blöcke)
   - [Überschrift](#31-überschrift-cf65heading)
   - [Text](#32-text-cf65text)
   - [Button](#33-button-cf65button)
   - [Bild](#34-bild-cf65image)
   - [Spalten und Spalte](#35-spalten-cf65columns-und-spalte-cf65column)
   - [Dynamische Werte](#36-dynamische-werte-bild-und-button)
4. [Erlaubte Werte](#4-erlaubte-werte)
5. [Update-Sicherheit und Reparatur](#5-update-sicherheit-und-reparatur)
6. [Debug-Modus und Benchmark](#6-debug-modus-und-benchmark)
7. [Für Entwickler: Hooks und gespeicherte Daten](#7-für-entwickler-hooks-und-gespeicherte-daten)
8. [Deinstallation](#8-deinstallation)

---

## 1. Installation

Voraussetzungen: WordPress ≥ 6.7, PHP ≥ 8.5. Ist eine der beiden Versionen zu alt, bleibt das Plugin inaktiv und zeigt im Backend einen Hinweis.

1. `cf65-blocks.zip` aus den [Releases](https://github.com/ChFluri/cf65-blocks/releases) herunterladen.
2. SHA-256-Prüfsumme mit der `.sha256`-Datei vergleichen (siehe [SECURITY.md](../SECURITY.md)).
3. *Plugins → Installieren → Plugin hochladen*, ZIP wählen, aktivieren.

Ein eigenes ZIP aus dem Repo baut `npm run dist`. Es landet als `dist/cf65-blocks.zip` mit `.sha256` im Projekt.

## 2. Grundlagen

### Blöcke finden

Alle Blöcke stehen im Block-Inserter in der Kategorie **cf65 Blocks** und tragen den Zusatz „(cf65)“ im Namen, zum Beispiel „Überschrift (cf65)“.

### Seitenleiste mit drei Tabs

Die Einstellungen eines Blocks sind in der Seitenleiste auf Tabs verteilt:

| Tab | Inhalt |
|---|---|
| **Layout** | Inhaltliche und Anordnungs-Einstellungen (Link, Alternativtext, Ausrichtung, Spaltenzahl, Breite …) |
| **Style** | Aussehen (Schriftgrösse, Farben, Abstände, Eckenradius …) |
| **Erweitert** | Spezielle Optionen, aktuell nur beim Überschrift-Block (HTML-Tag) |

Ein Tab erscheint nur, wenn der Block dort Einstellungen hat. Zusätzlich bietet jeder Block im WordPress-Bereich **Erweitert** wie gewohnt *HTML-Anker* und *Zusätzliche CSS-Klasse(n)*.

### Responsive Werte (Desktop, Tablet, Mobil)

Einstellungen mit den Schaltern **Desktop · Tablet · Mobil** lassen sich pro Gerät setzen:

- Ein Klick auf ein Gerät schaltet auch die Geräte-Vorschau des Editors um, und umgekehrt. Was in der Vorschau zu sehen ist, entspricht dem Frontend.
- Ein Punkt hinter *Tablet •* oder *Mobil •* zeigt, dass für dieses Gerät ein eigener Wert gesetzt ist.
- Ohne eigenen Wert übernimmt Tablet den Desktop-Wert und Mobil den Tablet-Wert (bzw. den Desktop-Wert).
- Feld leeren entfernt den Wert für dieses Gerät.

Breakpoints:

| Gerät | Gilt für Bildschirmbreite |
|---|---|
| Desktop | alle (Grundwert) |
| Tablet | ≤ 1024 px |
| Mobil | ≤ 767 px |

### Längen eingeben

Längenfelder bestehen aus einer Zahl und einer Einheit (`px`, `em`, `rem`, `%`, `vw`, `vh`). Ein leeres Zahlenfeld bedeutet „nicht gesetzt“, dann gilt das Standard-Aussehen.

### Hover-Farben

Farben mit dem Zusatz *(Hover)* gelten, solange der Mauszeiger über dem Element steht. Bei Überschrift und Text ist das der ganze Block, beim Button der Button selbst.

### Wie die Stile ausgegeben werden

Jeder Block erhält beim Einfügen automatisch eine eigene ID (Klasse `cf65-<id>`). Beim Duplizieren bekommt die Kopie eine neue ID. Daraus erzeugt das Plugin genau das CSS, das der Block braucht. Im Frontend landet es gesammelt im Inline-Stylesheet `cf65-blocks-dynamic`: bei Block-Themes im `<head>`, bei klassischen Themes notfalls im Footer. Leere Einstellungen erzeugen kein CSS.

Spezifität: Die Grundstile der Blöcke stehen in `:where()` (Spezifität 0), daher gewinnen eingestellte Werte und Theme-CSS immer gegen sie. Eingestellte Werte haben die Spezifität einer Klasse (`.cf65-<id>`, bzw. `.cf65-<id> .cf65-button__link`). Theme-Regeln mit höherer Spezifität, etwa `.entry-content h2`, überstimmen sie.

## 3. Blöcke

### 3.1 Überschrift (`cf65/heading`)

Überschrift H1–H6 mit responsiver Ausrichtung und Schriftgrösse.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Werkzeugleiste | Überschriftenebene (H1–H6) | Standard: H2 |
| Layout → Ausrichtung | Textausrichtung | responsiv; Links, Zentriert, Rechts, Blocksatz |
| Style → Typografie | Schriftgrösse | responsiv |
| Style → Farben | Text, Text (Hover) | |
| Erweitert → HTML | HTML-Tag (`h1`–`h6`) | gleicher Wert wie die Überschriftenebene |

Umwandeln: Überschrift ↔ Text (cf65). Ausrichtung, Schriftgrösse und Farben werden dabei übernommen.

### 3.2 Text (`cf65/text`)

Textabsatz (`<p>`) mit denselben Einstellungen wie die Überschrift, ohne Ebene/HTML-Tag.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Ausrichtung | Textausrichtung | responsiv; inkl. Blocksatz |
| Style → Typografie | Schriftgrösse | responsiv |
| Style → Farben | Text, Text (Hover) | |

Bedienung wie beim WordPress-Absatz: **Enter** teilt den Absatz in zwei Text-Blöcke, **Rücktaste** am Anfang führt ihn mit dem vorherigen zusammen.

Umwandeln:

- WordPress-Absatz → Text (cf65) und zurück. Übernommen werden Inhalt, Anker und CSS-Klassen. Die cf65-Stile gehen beim Wechsel zum WordPress-Absatz verloren, weil dieser sie nicht kennt.
- Text (cf65) ↔ Überschrift (cf65), mit allen Stilen.

### 3.3 Button (`cf65/button`)

Link-Button. Der Text wird direkt im Button bearbeitet; erlaubt sind **fett** und *kursiv*.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Link | URL | siehe unten; bei dynamischem Link die Fallback-URL |
| Layout → Link | Dynamischer Wert | *Link zum Beitrag* des aktuellen Beitrags, siehe [3.6](#36-dynamische-werte-bild-und-button) |
| Layout → Link | In neuem Tab öffnen | setzt `target="_blank"` und `rel="noopener"` |
| Layout → Ausrichtung | Textausrichtung | responsiv; Links, Zentriert, Rechts (Position des Buttons) |
| Style → Typografie | Schriftgrösse | responsiv |
| Style → Farben | Text, Text (Hover), Hintergrund, Hintergrund (Hover) | |
| Style → Abstände & Form | Innenabstand vertikal, Innenabstand horizontal | responsiv |
| Style → Abstände & Form | Eckenradius | |

Ohne Einstellungen erscheint der Button dunkel (`#1e1e1e`) mit weisser Schrift, Innenabstand `0.75em 1.5em` und Radius `4px`. Farbwechsel beim Hover sind animiert, ausser im Betriebssystem ist „Bewegung reduzieren“ aktiv.

**URL:** Erlaubt sind `http:`, `https:`, `mailto:`, `tel:` sowie relative Adressen (`/kontakt`, `#anker`). Bei einer ungültigen oder nicht erlaubten URL (z. B. `javascript:`) zeigt das Feld einen Hinweis und der Button wird ohne Link ausgegeben.

### 3.4 Bild (`cf65/image`)

Bild aus der Mediathek, als Upload oder per URL, mit optionaler Bildunterschrift.

Nach dem Einfügen erscheint ein Platzhalter mit *Hochladen*, *Mediathek* und *URL einfügen*. Danach ersetzt **Ersetzen** in der Werkzeugleiste das Bild. Die Bildunterschrift wird direkt unter dem Bild eingegeben.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Bild | Dynamischer Wert | *Beitragsbild* des aktuellen Beitrags, siehe [3.6](#36-dynamische-werte-bild-und-button) |
| Layout → Bild | Alternativtext | wird aus der Mediathek übernommen; leer lassen bei rein dekorativen Bildern |
| Layout → Ausrichtung | Textausrichtung | responsiv; richtet Bild und Bildunterschrift aus |
| Style → Grösse & Form | Breite | responsiv |
| Style → Grösse & Form | Eckenradius | |
| Style → Farben | Bildunterschrift | Textfarbe der Bildunterschrift |

Hinweise:

- Bildquellen müssen `http:`/`https:` oder relativ sein. Andere Quellen werden nicht ausgegeben, und der Editor zeigt wieder den Platzhalter.
- Bei Bildern aus der Mediathek speichert der Block Breite und Höhe. Das verhindert Layout-Sprünge beim Laden. Bei Bildern per URL fehlen diese Angaben.
- Das Bild wird nie breiter als der verfügbare Platz (`max-width: 100%`).

### 3.5 Spalten (`cf65/columns`) und Spalte (`cf65/column`)

**Spalten** ist der Container, **Spalte** der einzelne Bereich darin. Eine Spalte kann nur in *Spalten* stehen, und *Spalten* nimmt nur Spalten auf. In eine Spalte passen beliebige Blöcke, auch weitere Spalten-Container.

Neu eingefügt enthält *Spalten* zwei leere Spalten.

**Spalten-Container:**

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Spalten | Anzahl | 1–6; beim Verringern werden die **letzten Spalten samt Inhalt entfernt** |
| Layout → Spalten | Abstand | responsiv; Standard `2em` |
| Layout → Spalten | Vertikale Ausrichtung | responsiv; Oben, Mitte, Unten, Gleich hoch |

**Einzelne Spalte:**

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Grösse | Breite | responsiv; z. B. `33%` |
| Layout → Grösse | Innenabstand | responsiv |
| Style → Farben | Hintergrund | |

Verhalten der Breiten:

- Spalten ohne Breite teilen sich den restlichen Platz gleichmässig.
- Tablet übernimmt die Desktop-Breite, solange keine Tablet-Breite gesetzt ist.
- **Mobil werden die Spalten untereinander gestapelt** (je 100 % breit), solange keine mobile Breite gesetzt ist. Mobil dürfen die Spalten umbrechen, und der Abstand zählt mit: `50%` + `50%` + Abstand `2em` stapelt trotzdem. Für zwei Spalten auf dem Handy z. B. bei Mobil Breite `48%` und Abstand `4%` setzen.
- Auf Desktop und Tablet brechen Spalten nie um; Breiten über 100 % werden proportional gestaucht.
- Breiten verschachtelter Spalten wirken nur auf ihre eigene Ebene.

### 3.6 Dynamische Werte (Bild und Button)

Bild und Button können ihren Wert aus dem **aktuellen Beitrag** holen: das Bild sein Beitragsbild, der Button den Link zum Beitrag. Im **Query Loop** gilt das pro Eintrag. So lässt sich ein Teaser einmal gestalten, und jeder Eintrag zeigt sein eigenes Bild und seinen eigenen Link.

1. Block auswählen, Tab *Layout*.
2. Bild: Bereich *Bild* → **Dynamischer Wert** → *Beitragsbild*. Button: Bereich *Link* → **Dynamischer Wert** → *Link zum Beitrag*.
3. Zum Lösen der Bindung *Kein (statischer Wert)* wählen.

Verhalten:

| Situation | Ergebnis |
|---|---|
| Wert vorhanden | Wird im Frontend eingesetzt. Beim Bild auch Breite, Höhe, `wp-image-<id>` (für `srcset` und Lazy Loading) und der Alternativtext aus der Mediathek. |
| Kein Wert (z. B. kein Beitragsbild) | Es gilt der statische Wert als Fallback: Fallback-Bild (Werkzeugleiste) bzw. Fallback-URL. |
| Kein Wert und kein Fallback | Das Bild wird nicht ausgegeben; der Button erscheint ohne Link. |
| Beitrag nicht öffentlich (Entwurf, privat, Passwortschutz) | Kein Wert für Besucher. Wer den Beitrag bearbeiten darf, sieht den Wert. |

Im Editor zeigt der Block eine Vorschau mit dem Wert des Beitrags bzw. des Query-Loop-Eintrags. Ohne Beitrag, etwa in einem Template, erscheint ein Hinweis anstelle des Bildes. Den Wert pro Beitrag gibt es dann erst im Frontend.

## 4. Erlaubte Werte

Das Plugin prüft alle Stilwerte im Editor und **beim Speichern nochmals auf dem Server**, auch bei Inhalten über REST-API oder Import. Ungültige Werte werden verworfen, es entsteht dann kein CSS dafür.

| Art | Erlaubt | Beispiele |
|---|---|---|
| Farbe | Hex (3/4/6/8 Stellen), `rgb()`/`rgba()`, `hsl()`/`hsla()`, `transparent`, `currentcolor`, CSS-Variable | `#0a7`, `rgba(0,0,0,.5)`, `var(--wp--preset--color--primary)` |
| Länge | Zahl mit `px`, `em`, `rem`, `%`, `vw`, `vh`; `0`; CSS-Variable | `1.5rem`, `-10px`, `var(--abstand-gross)` |
| Link-URL | `http`, `https`, `mailto`, `tel`, relativ; max. 2048 Zeichen | `https://example.com`, `mailto:info@example.com` |
| Bild-URL | `http`, `https`, relativ | `/wp-content/uploads/bild.jpg` |

Werte sind auf 80 Zeichen begrenzt (URLs: 2048). Leerzeichen am Anfang oder Ende, Anführungszeichen und spitze Klammern machen einen Wert ungültig. CSS-Variablen bestehen aus Kleinbuchstaben, Ziffern und Bindestrichen.

## 5. Update-Sicherheit und Reparatur

cf65-Blöcke sind so gebaut, dass Plugin-Updates keine Meldung „Dieser Block enthält unerwartete oder ungültige Inhalte“ auslösen:

- Alle Einstellungen und Inhalte stehen im Block-Kommentar, nicht nur im HTML.
- Ändert sich das HTML eines Blocks in einer neuen Version, erkennt das Plugin die alte Fassung und übernimmt sie.
- Ist ein cf65-Block trotzdem ungültig, etwa weil das HTML von Hand bearbeitet wurde, baut der Editor ihn beim Öffnen **automatisch und ohne Datenverlust neu auf**. Es erscheint der Hinweis *„… cf65-Block wurde automatisch repariert. Bitte speichern, um die Reparatur zu übernehmen.“* Erst das Speichern schreibt die Reparatur in den Beitrag.
- Blöcke anderer Plugins oder von WordPress selbst werden nie automatisch verändert.

Die automatische Reparatur lässt sich per Filter abschalten (siehe [Kapitel 7](#7-für-entwickler-hooks-und-gespeicherte-daten)).

## 6. Debug-Modus und Benchmark

Der Debug-Modus misst, wie viel Zeit die cf65-Blöcke beim Ausgeben einer Seite brauchen.

**Einschalten**, eine der beiden Varianten:

```php
// wp-config.php
define( 'CF65_BLOCKS_DEBUG', true );
```

oder die Option `cf65_blocks_debug` auf `1` setzen (z. B. `wp option update cf65_blocks_debug 1`). Eine Einstellungsseite dafür gibt es noch nicht.

Die Messwerte sehen nur Benutzer mit der Berechtigung `manage_options` (Administratoren). Andere Besucher merken nichts.

| Wo | Was |
|---|---|
| Admin-Bar → **cf65 Performance** | Anzahl Blöcke, Zeit für Ausgabe und CSS, DB-Queries, Speicher, langsamste Blöcke |
| Browser-DevTools → Netzwerk → Timing | `Server-Timing`-Header `cf65-render`, `cf65-css`, `cf65-queries` |
| Browser-DevTools → Performance (im Editor) | Messpunkt `cf65-css` pro CSS-Neuberechnung |

**Benchmark** eines Beitrags per WP-CLI, der Beitrag wird mehrfach gerendert:

```sh
wp cf65 bench <post-id> --runs=20
wp cf65 bench <post-id> --runs=20 --format=json
```

In der lokalen Entwicklungsumgebung mit `npx wp-env run cli` voranstellen.

## 7. Für Entwickler: Hooks und gespeicherte Daten

### Filter und Actions

| Hook | Art | Zweck |
|---|---|---|
| `cf65_blocks/auto_recovery` | Filter (`bool`, Standard `true`) | Automatische Reparatur im Editor ein/aus |
| `cf65_blocks/debug_enabled` | Filter (`bool`) | Debug-Modus unabhängig von Konstante/Option erzwingen oder abschalten |
| `cf65_blocks/loaded` | Action | Plugin ist vollständig geladen |
| `cf65_blocks/dynamic/sources` | Filter (`list<SourceInterface>`) | Eigene Quellen für dynamische Werte registrieren |
| `cf65_blocks/dynamic/providers` | Filter (`list<ProviderInterface>`) | Eigene Provider (Feldquellen) registrieren |
| `cf65_blocks/dynamic/allow_field` | Filter (`bool`, Feld, Objekt, Bindung) | Einzelne Felder von der Ausgabe ausschliessen |

Beispiel:

```php
add_filter( 'cf65_blocks/auto_recovery', '__return_false' );
```

### Dynamic Content

- **Bindungen** stehen im Block-Attribut `dynamic`, z. B. `{"url":{"source":"current-post","provider":"core","field":"featured_image"}}`. Bindbar sind nur Attribute, die der Block in `supports.cf65.dynamic` deklariert (bisher `cf65/image` → `url`, `cf65/button` → `url`).
- **Ausgabe:** Das gespeicherte HTML bleibt statisch. Ein `render_block`-Filter setzt die Werte per `WP_HTML_Tag_Processor` ein. Ausgegeben werden nur Felder, die der Provider selbst anbietet, und nur aus Beiträgen, die öffentlich sichtbar sind oder die der aktuelle Benutzer bearbeiten darf.
- **Provider `core`:** `title`, `excerpt`, `date` (Text, ab Phase 2.2 nutzbar), `permalink` (URL), `featured_image` (Bild).
- **REST** (nur mit `edit_posts`): `GET /wp-json/cf65-blocks/v1/dynamic/fields?kind=image|link&postType=…` liefert die Feldliste, `POST /wp-json/cf65-blocks/v1/dynamic/preview` mit `{ kind, postId, postType, bindings }` die aufgelösten Werte. Die Vorschau unterliegt derselben Objektprüfung wie das Frontend.

### Gespeicherte Daten

| Ort | Schlüssel | Inhalt |
|---|---|---|
| Post-Meta | `_cf65_blocks_css` | Vorberechnetes CSS der cf65-Blöcke eines Beitrags, wird beim Speichern aktualisiert. Nach Plugin-Updates wird er automatisch ungültig und neu berechnet. Löschen ist jederzeit gefahrlos. |
| Option | `cf65_blocks_debug` | Debug-Modus (optional) |

Blöcke aus Templates, Patterns oder anderen Beiträgen (z. B. im Query Loop) rendern korrekt. Ihr CSS wird bei Bedarf direkt berechnet.

### Sicherheit beim Speichern

- Geprüft werden nur Attribute, die ein Block in seiner `block.json` deklariert. Unbekannte Attribute bleiben erhalten, werden aber nie ausgegeben. So gehen bei einem Downgrade keine Daten verloren.
- Blöcke können einzelne Attribute an eine Berechtigung binden (`supports.cf65.capabilities`). Fehlt sie dem speichernden Benutzer, wird das Attribut entfernt. Kein Phase-1-Block nutzt das bisher; vorgesehen ist es für Custom CSS.
- Bindungen (`dynamic`) werden nur auf ihre Struktur geprüft: bekannte Schlüssel, gültige Kennungen, deklarierte Attribute. Bindungen an nicht verfügbare Provider bleiben erhalten, damit z. B. ein vorübergehend deaktiviertes ACF keine Bindungen löscht.
- Texte in Blöcken (RichText) filtert WordPress wie üblich über kses.

## 8. Deinstallation

Beim **Löschen** des Plugins (nicht beim Deaktivieren) werden entfernt:

- alle Optionen und Transients mit dem Präfix `cf65_blocks_`
- der CSS-Cache `_cf65_blocks_css` aller Beiträge

Die Blöcke in den Beiträgen bleiben erhalten. Ohne das Plugin zeigt der Editor sie als nicht verfügbare Blöcke an, im Frontend bleibt das gespeicherte HTML ohne die cf65-Stile stehen. Nach einer erneuten Installation funktionieren sie wieder vollständig.
