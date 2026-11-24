# cf65 Blocks – Benutzung

Stand: Phase 2.3, Style-Panels und Blöcke Welle 1 Gruppen A bis D (Version 0.1.0-dev). Beschrieben sind nur Funktionen, die im Plugin bereits umgesetzt sind. Dynamic Content gibt es bisher aus dem aktuellen Beitrag (WordPress-Felder, Post-Meta, ACF) für Bild, Button-Link, Hintergrundbild und Platzhalter im Text. Pods, weitere Quellen, Formatierung, Conditional Display, Motion Effects und Custom CSS folgen (siehe [UMSETZPLAN.md](UMSETZPLAN.md)).

## Inhalt

1. [Installation](#1-installation)
2. [Grundlagen](#2-grundlagen)
3. [Blöcke](#3-blöcke)
   - [Überschrift](#31-überschrift-cf65heading)
   - [Text](#32-text-cf65text)
   - [Button](#33-button-cf65button)
   - [Bild](#34-bild-cf65image)
   - [Spalten und Spalte](#35-spalten-cf65columns-und-spalte-cf65column)
   - [Abstandhalter](#36-abstandhalter-cf65spacer)
   - [Trennlinie](#37-trennlinie-cf65divider)
   - [Trenner](#38-trenner-cf65separator)
   - [Untertitel](#39-untertitel-cf65subtitle)
   - [Zitat](#310-zitat-cf65blockquote)
   - [Icon-Blöcke](#311-icon-blöcke)
   - [Container-Blöcke](#312-container-blöcke)
   - [Boxen und Preise](#313-boxen-und-preise)
   - [Dynamische Werte](#314-dynamische-werte)
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

### Gemeinsame Style-Panels

Viele Blöcke haben dieselben Grundeinstellungen. Sie gelten für das **äussere Element** des Blocks und stehen am Ende der Tabs:

| Panel | Tab | Einstellungen |
|---|---|---|
| Abstände | Layout | Aussenabstand oben/unten, Innenabstand vertikal/horizontal (je responsiv) |
| Rahmen | Style | Breite, Stil (Keiner, Durchgezogen, Gestrichelt, Gepunktet, Doppelt), Eckenradius |
| Rahmenfarbe | Style | Rahmen, Rahmen (Hover) |
| Schatten | Style | Keiner, Klein, Mittel, Gross – auch für Hover |
| Hintergrundfarbe | Style | Hintergrund, Hintergrund (Hover) |
| Hintergrundbild | Style | Bild aus der Mediathek, *Dynamischer Wert* (z. B. Beitragsbild), Grösse (Füllen, Einpassen, Originalgrösse), Position, Wiederholen |

Welche Blöcke welche Panels haben:

| Block | Panels |
|---|---|
| Text, Überschrift, Untertitel, Spalten | alle |
| Zitat | Abstände, Schatten, Hintergrundfarbe (Rahmen über die eigene Akzentlinie) |
| Abstandhalter, Trenner | Aussenabstand, Hintergrundfarbe |
| Trennlinie | Aussenabstand |
| Icon mit Text, Icon-Liste | Abstände, Rahmen, Hintergrundfarbe |
| Icon, Icon-Button, Social Buttons | Aussenabstand |
| Button, Bild | Abstände (nur Aussenabstand) |
| Spalte | Rahmen, Rahmenfarbe, Schatten, Hintergrundbild (Innenabstand und Hintergrundfarbe hat die Spalte schon selbst) |

Hinweise:

- Wer eine Rahmenbreite einträgt, bekommt automatisch den Stil *Durchgezogen*; ohne Stil zeichnet der Browser keinen Rahmen.
- Aussenabstände setzen sich auch gegen die Abstandsregeln von WordPress-Layouts durch (z. B. beim ersten Block im Inhalt).
- **Dynamisches Hintergrundbild:** Ist ein Wert vorhanden, setzt der Server ihn direkt am Element; sonst gilt das gewählte Bild aus der Mediathek als Fallback. Im Editor zeigt der Block eine Vorschau mit dem Wert des Beitrags bzw. des Query-Loop-Eintrags.
- Bild-Adressen mit runden Klammern werden als Hintergrund nicht verwendet (WordPress entfernt Klammern ohnehin aus Dateinamen beim Upload).

### Wie die Stile ausgegeben werden

Jeder Block erhält beim Einfügen automatisch eine eigene ID (Klasse `cf65-<id>`). Beim Duplizieren bekommt die Kopie eine neue ID. Daraus erzeugt das Plugin genau das CSS, das der Block braucht. Im Frontend landet es gesammelt im Inline-Stylesheet `cf65-blocks-dynamic`: bei Block-Themes im `<head>`, bei klassischen Themes notfalls im Footer. Leere Einstellungen erzeugen kein CSS.

Spezifität: Die Grundstile der Blöcke stehen in `:where()` (Spezifität 0), daher gewinnen eingestellte Werte und Theme-CSS immer gegen sie. Eingestellte Werte haben die Spezifität einer Klasse (`.cf65-<id>`, bzw. `.cf65-<id> .cf65-button__link`). Theme-Regeln mit höherer Spezifität, etwa `.entry-content h2`, überstimmen sie. Ausnahme: Aussenabstände der Style-Panels nutzen `.cf65-<id>.cf65-<id>.cf65-<id>` (0,3,0), damit sie gegen die Layoutregeln von WordPress wirken.

## 3. Blöcke

### 3.1 Überschrift (`cf65/heading`)

Überschrift H1–H6 mit responsiver Ausrichtung und Schriftgrösse.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Werkzeugleiste | Überschriftenebene (H1–H6) | Standard: H2 |
| Werkzeugleiste | Dynamischer Wert | Platzhalter im Text, z. B. Beitragstitel, siehe [3.14](#314-dynamische-werte) |
| Layout → Ausrichtung | Textausrichtung | responsiv; Links, Zentriert, Rechts, Blocksatz |
| Style → Typografie | Schriftgrösse | responsiv |
| Style → Farben | Text, Text (Hover) | |
| Erweitert → HTML | HTML-Tag (`h1`–`h6`) | gleicher Wert wie die Überschriftenebene |

Umwandeln: Überschrift ↔ Text (cf65). Ausrichtung, Schriftgrösse und Farben werden dabei übernommen.

### 3.2 Text (`cf65/text`)

Textabsatz (`<p>`) mit denselben Einstellungen wie die Überschrift, ohne Ebene/HTML-Tag.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Werkzeugleiste | Dynamischer Wert | Platzhalter im Text, z. B. Datum, siehe [3.14](#314-dynamische-werte) |
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
| Layout → Link | Dynamischer Wert | *Link zum Beitrag* des aktuellen Beitrags, siehe [3.14](#314-dynamische-werte) |
| Werkzeugleiste | Dynamischer Wert | Platzhalter in der Beschriftung, z. B. Beitragstitel |
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
| Layout → Bild | Dynamischer Wert | *Beitragsbild* des aktuellen Beitrags, siehe [3.14](#314-dynamische-werte) |
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

### 3.6 Abstandhalter (`cf65/spacer`)

Leerer Abstand zwischen Blöcken. Für Screenreader ausgeblendet (`aria-hidden`), im Editor gestrichelt umrandet.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Grösse | Höhe | responsiv; Standard `50px` |
| Layout/Style | Panels | Aussenabstand, Hintergrundfarbe |

### 3.7 Trennlinie (`cf65/divider`)

Horizontale Linie. Ausgegeben als `<div role="separator">` statt `<hr>`, damit Theme-Stile für `<hr>` die Linie nicht verändern.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Grösse | Breite | responsiv; Standard 100 % |
| Layout → Grösse | Ausrichtung | responsiv; Links, Mitte, Rechts (wirkt bei Breite unter 100 %) |
| Style → Linie | Stil, Stärke | Durchgezogen, Gestrichelt, Gepunktet, Doppelt; Standard `1px` durchgezogen |
| Style → Farben | Linie | Standard: Textfarbe |

### 3.8 Trenner (`cf65/separator`)

Dekorative Form als Übergang zwischen Abschnitten, z. B. unten an einem farbigen Bereich. Gefüllt ist der untere Teil der Form; als Farbe meist die Hintergrundfarbe des **folgenden** Abschnitts wählen.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Form | Form | Welle, Kurve, Schräge, Dreieck |
| Layout → Form | Höhe | responsiv; Standard `80px` |
| Layout → Form | Horizontal / Vertikal spiegeln | vertikal gespiegelt passt die Form an den oberen Rand eines Abschnitts |
| Style → Farben | Form | Standard: Textfarbe |
| Layout/Style | Panels | Aussenabstand, Hintergrundfarbe (Fläche hinter der Form) |

Technisch: Das SVG wird nicht gespeichert, sondern beim Ausgeben eingesetzt (`SeparatorRenderer`, Formen in `includes/Blocks/shapes.json`). So entfernt kses nichts, wenn Autoren ohne `unfiltered_html` speichern.

### 3.9 Untertitel (`cf65/subtitle`)

Kurzer Text über oder unter einer Überschrift (Dachzeile). Grundstil: kleiner, fett, Grossbuchstaben mit Buchstabenabstand.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Werkzeugleiste | Dynamischer Wert | Platzhalter im Text, siehe [3.14](#314-dynamische-werte) |
| Layout → Ausrichtung | Textausrichtung | responsiv |
| Style → Typografie, Farben | Schriftgrösse, Text, Text (Hover) | wie beim Text-Block |
| Style → Schreibweise | Gross-/Kleinschreibung | Normal, GROSSBUCHSTABEN, kleinbuchstaben, Wortanfänge Gross |
| Style → Schreibweise | Buchstabenabstand | z. B. `0.1em` |
| Layout/Style | Panels | alle |

Umwandeln: Untertitel ↔ Text (cf65) und Überschrift (cf65); Ausrichtung, Schriftgrösse und Farben bleiben.

### 3.10 Zitat (`cf65/blockquote`)

Zitat mit optionaler Quelle und Akzentlinie links.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Werkzeugleiste | Dynamischer Wert | Platzhalter in Zitat und Quelle |
| Layout → Ausrichtung | Textausrichtung | responsiv; Links, Zentriert, Rechts |
| Style → Typografie | Schriftgrösse des Zitats | responsiv |
| Style → Akzentlinie | Breite | Standard `4px`; `0` blendet sie aus |
| Style → Farben | Zitat, Quelle, Akzentlinie | Standard: Textfarbe |
| Layout/Style | Panels | Abstände, Schatten, Hintergrundfarbe |

Leere Quelle wird nicht ausgegeben. Markup: `<blockquote>` mit `<p class="cf65-blockquote__text">` und `<cite class="cf65-blockquote__cite">`.

### 3.11 Icon-Blöcke

Alle Icon-Blöcke nutzen dasselbe mitgelieferte Set: **168 allgemeine Icons** (Lucide) und **20 Marken-Icons** (Simple Icons, LinkedIn aus Font Awesome Free). Ausgewählt wird über **Icon wählen**: ein Fenster mit Suche (englische Namen, z. B. `phone`, `mail`, `check`) und den Reitern *Allgemein* und *Marken*.

Icons übernehmen die Textfarbe; die Grösse steuert jeweils *Icon-Grösse* bzw. *Grösse* (responsiv, Standard `1.5em`).

#### Icon (`cf65/icon`)

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Icon | Icon, Beschriftung für Screenreader | ohne Beschriftung gilt das Icon als Dekoration (`aria-hidden`), mit Beschriftung als Bild (`role="img"`) |
| Layout → Ausrichtung | Textausrichtung | responsiv |
| Style → Grösse | Grösse | responsiv |
| Style → Farben | Icon, Icon (Hover), Form | *Form* = Hintergrund hinter dem Icon |
| Style → Hintergrundform | Innenabstand, Eckenradius | z. B. `12px` und `50%` für einen Kreis |

#### Icon mit Text (`cf65/icon-label`)

Icon und kurzer Text nebeneinander, z. B. für Kontaktangaben.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Icon | Icon, Ausrichtung (responsiv), Abstand Icon – Text | |
| Style → Grösse | Icon-Grösse, Schriftgrösse | responsiv |
| Style → Farben | Icon, Text | |
| Werkzeugleiste | Dynamischer Wert | Platzhalter im Text |

#### Icon-Liste (`cf65/icon-list`) und Eintrag (`cf65/icon-list-item`)

Liste mit Icon statt Aufzählungszeichen. **Enter** erzeugt einen neuen Eintrag, **Rücktaste** am Anfang verbindet mit dem vorherigen.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Liste: Layout → Liste | Icon | gilt für alle Einträge ohne eigenes Icon; Standard *check* |
| Liste: Layout → Liste | Abstand zwischen Einträgen (responsiv), Abstand Icon – Text | |
| Liste: Style | Icon-Grösse, Schriftgrösse, Farben Icon/Text | |
| Eintrag: Seitenleiste → Eintrag | Eigenes Icon | *Zurücksetzen* = wieder Icon der Liste |

Das Icon steht auf Höhe der ersten Textzeile, auch bei mehrzeiligen Einträgen.

#### Icon-Button (`cf65/icon-button`)

Runder Link-Button nur mit Icon (Standard: dunkel, weisses Icon, Kreis).

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Icon | Icon, **Beschriftung für Screenreader** | Pflicht; ohne Beschriftung zeigt der Editor eine Warnung |
| Layout → Link | URL, Dynamischer Wert, In neuem Tab öffnen | wie beim Button; ungültige URL → kein Link |
| Layout → Ausrichtung | Textausrichtung | responsiv |
| Style → Grösse & Form | Icon-Grösse (responsiv), Innenabstand, Eckenradius | Eckenradius `4px` für ein abgerundetes Quadrat |
| Style → Farben | Icon, Icon (Hover), Hintergrund, Hintergrund (Hover) | |

#### Social Buttons (`cf65/social-buttons`)

Links zu Social-Media-Profilen. Verfügbar: Facebook, Instagram, X, Threads, Bluesky, Mastodon, YouTube, Vimeo, TikTok, Pinterest, Snapchat, WhatsApp, Telegram, Discord, Reddit, Twitch, Spotify, GitHub, XING, LinkedIn. LinkedIn stammt aus Font Awesome Free (CC BY 4.0, Namensnennung in `includes/Icons/LICENSES.md`), weil Simple Icons das Logo auf Wunsch des Inhabers entfernt hat.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Profile | Netzwerk und Profil-URL pro Eintrag; Nach oben/unten, Entfernen, Profil hinzufügen | Einträge ohne gültige URL werden nicht ausgegeben |
| Layout → Profile | In neuem Tab öffnen | Standard: an |
| Layout → Anordnung | Ausrichtung (responsiv), Abstand | |
| Style → Grösse & Form | Icon-Grösse, Innenabstand, Eckenradius | |
| Style → Farben | Markenfarben | Hintergrund in der Farbe des Netzwerks, Icon weiss |
| Style → Eigene Farben | Icon, Hintergrund, je mit Hover | nur ohne Markenfarben |

Jeder Link trägt den Netzwerknamen als `aria-label` (z. B. „Facebook“).

### 3.12 Container-Blöcke

Container enthalten normale cf65-Blöcke als **Innenblöcke**. Ein neu eingefügter Container startet mit einer Vorlage, z. B. Titel, Text und Button. Diese Blöcke lassen sich wie überall bearbeiten, löschen, verschieben und ergänzen (Ausnahme: Feature, siehe unten). Alle Container haben die gemeinsamen Style-Panels Aussenabstand, Innenabstand, Rahmen, Schatten, Hintergrundfarbe und Hintergrundbild, auch dynamisch. Der Hinweis hat kein Hintergrundbild.

#### Karte (`cf65/card`)

Vorlage: Bild, Überschrift (H3), Text, Button. Die Karte ist so hoch wie ihr Platz, im Feature-Raster sind alle Karten einer Zeile also gleich hoch.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Karte | Abstand zwischen Elementen | responsiv, Standard `1em` |
| Layout → Karte | Textausrichtung, Vertikale Ausrichtung | responsiv; *Vertikal* verteilt den Inhalt bei gleich hohen Karten |

Standard-Innenabstand `1.5em`, über das Panel *Innenabstand* änderbar.

#### Hero (`cf65/hero`)

Grosser Einstiegsbereich, als `<section>` ausgegeben. Vorlage: Untertitel, Überschrift (H1), Text, Button. Die Werkzeugleiste bietet die Breiten *Weit* und *Volle Breite*, sofern das Theme sie unterstützt.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Hero | Mindesthöhe | responsiv, Standard `400px` |
| Layout → Hero | Maximale Inhaltsbreite | responsiv, Standard `800px` |
| Layout → Hero | Inhalt vertikal, Inhalt horizontal, Textausrichtung | responsiv, Standard zentriert |
| Layout → Hero | Abstand zwischen Elementen | responsiv |
| Style → Farben | Text, Overlay | *Overlay* liegt über dem Hintergrundbild und unter dem Inhalt |
| Style → Overlay | Deckkraft | 0–100 % in 10er-Schritten, Standard 50 %; wirkt nur mit Overlay-Farbe |

Das Hintergrundbild kommt aus dem Panel *Hintergrundbild*, beim Hero standardmässig *cover* und zentriert.

#### Feature (`cf65/feature`)

Bild und Inhalt nebeneinander. Das Feature besteht aus **genau zwei Spalten** (`cf65/column`). Die Spalten selbst lassen sich weder löschen noch verschieben, ihr Inhalt ist frei. Vorlage: links ein Bild, rechts Überschrift (H2), Text und Button.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Feature | Bild rechts | tauscht die Spalten auf Desktop und Tablet; mobil steht die erste Spalte (Bild) immer oben |
| Layout → Feature | Abstand | responsiv, Standard `2em` |
| Layout → Feature | Vertikale Ausrichtung | responsiv; Standard *Mitte* |
| Spalte | Breite, Innenabstand, Hintergrund | wie bei [Spalten](#35-spalten-cf65columns-und-spalte-cf65column), z. B. Bildspalte `40%` |

#### Feature-Raster (`cf65/feature-grid`)

Raster mit gleich breiten Zellen. Vorlage: drei Karten. Zellen können beliebige Blöcke sein.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Raster | Spalten | 1–6, pro Gerät; ohne Angabe Desktop 3, Tablet wie Desktop (sonst 2), Mobil 1 |
| Layout → Raster | Abstand horizontal, Abstand vertikal | responsiv, Standard `2em` |
| Layout → Raster | Vertikale Ausrichtung | Standard *Gleich hoch* |

Tipp: Bei 4 Spalten auf Desktop für Tablet *2 Spalten* wählen, sonst übernimmt das Tablet die 4.

#### Call to Action (`cf65/call-to-action`)

Handlungsaufforderung. Vorlage: Überschrift (H2), Text, Button.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Call to Action | Anordnung | *Untereinander* (Standard, zentriert) oder *Button rechts daneben* |
| Layout → Call to Action | Abstand zwischen Elementen, Textausrichtung | responsiv |
| Style → Farben | Text | |

*Button rechts daneben* gilt ab Tablet (ab 768 px), mobil steht alles untereinander. Vorgesehen ist **ein** Button (Button oder Icon-Button). Weitere Buttons landen unter dem Inhalt. Für zwei Buttons nebeneinander *Untereinander* wählen.

#### Hinweis (`cf65/notification`)

Hinweisbox mit farbigem Rand links, als `<div role="note">` ausgegeben. Vorlage: ein Text; weitere Blöcke sind möglich.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Hinweis | Typ | *Info* (blau), *Erfolg* (grün), *Warnung* (orange), *Fehler* (rot): Standardfarben und -icon |
| Layout → Hinweis | Icon anzeigen, Icon | Beim Typwechsel wechselt das Icon mit, solange es nicht von Hand geändert wurde |
| Layout → Hinweis | Schliessen-Button, Beschriftung für Screenreader | Besucher blenden den Hinweis aus, beim nächsten Seitenaufruf erscheint er wieder; Standard-Beschriftung „Schliessen“ |
| Style → Icon | Icon-Grösse | responsiv, Standard `1.5em` |
| Style → Farben | Akzent, Icon, Text | *Akzent* = Randfarbe und Standard-Icon-Farbe; den Hintergrund steuert das Panel *Hintergrundfarbe* |

Der Schliessen-Button funktioniert nur im Frontend. Im Editor ist er bloss als Vorschau zu sehen.

### 3.13 Boxen und Preise

Container wie in 3.12, mit Vorlage und frei änderbaren Innenblöcken. Ausnahme ist der Preis, ein einzelner Block. Alle Boxen haben die gemeinsamen Style-Panels. Der Preis hat nur Aussenabstand, Innenabstand und Hintergrundfarbe.

#### Icon-Box (`cf65/icon-box`)

Vorlage: Icon (48px), Überschrift (H3), Text.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Icon-Box | Anordnung | *Icon oben* (Standard, zentriert) oder *Icon links*: Der **erste** Icon-Block steht links neben dem übrigen Inhalt, auch mobil |
| Layout → Icon-Box | Abstand zwischen Elementen, Textausrichtung | responsiv |
| Style → Farben | Text | Icon-Farbe und -Grösse stellt der Icon-Block selbst ein |

#### Bild-Box (`cf65/image-box`)

Kachel mit Text auf einem Bild, z. B. für Projekte oder Kategorien. Vorlage: Überschrift (H3), Text. Das Bild kommt aus dem Panel *Hintergrundbild*, auch dynamisch, z. B. als Beitragsbild im Query Loop.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Bild-Box | Mindesthöhe | responsiv, Standard `300px` |
| Layout → Bild-Box | Inhalt vertikal, Textausrichtung, Abstand | Standard: unten links |
| Style → Farben | Text, Overlay | Standard: weisser Text, schwarzes Overlay |
| Style → Overlay | Deckkraft, Deckkraft (Hover) | Standard 40 %; beim Überfahren sanft überblendet (nicht bei „Bewegung reduzieren“) |

Setzt das Theme eigene Farben für Überschriften, gilt die weisse Textfarbe dort nicht. Dann die Farbe direkt an der Überschrift einstellen.

#### Zahlen-Box (`cf65/number-box`)

Kennzahl wie „250+“ oder „98 %“ mit Titel und Text. Die Zahl wird direkt in den Block getippt und kann einen Platzhalter enthalten (siehe 3.14).

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Zahlen-Box | Hochzählen | zählt beim Sichtbarwerden in 1,5 s von 0 hoch; nur auf der Website, nicht bei „Bewegung reduzieren“ |
| Layout → Zahlen-Box | Abstand, Textausrichtung | responsiv |
| Style → Zahl | Schriftgrösse | responsiv, Standard `3em` |
| Style → Farben | Zahl, Text | |

Beim Hochzählen wird die erste Zahl im Text animiert, Text davor und danach bleibt stehen. Das Format bleibt erhalten: `1'250`, `1.250`, `4,5` und `19.90` erscheinen am Ende genau wie eingegeben. Ein einzelnes `.` oder `,` gefolgt von genau drei Ziffern gilt als Tausendertrennzeichen.

#### Preis (`cf65/price`)

Preisangabe, direkt im Block bearbeitet: alter Preis (durchgestrichen), Währung (Standard *CHF*), Betrag, Zeitraum (z. B. `/ Monat`). Leere Teile werden nicht ausgegeben. Jeder Teil kann einen Platzhalter enthalten, z. B. den Preis aus einem ACF-Feld.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Preis | Währung nach dem Betrag | z. B. `19.90 €` |
| Layout → Preis | Ausrichtung | responsiv; ohne Angabe gilt die des Containers |
| Style → Grösse | Grösse des Betrags | Standard `3em`; Währung, Zeitraum und alter Preis sind relativ dazu und wachsen mit |
| Style → Farben | Betrag, Währung, Zeitraum, Alter Preis | |

#### Preis-Box (`cf65/pricing-box`)

Tarif für Preistabellen, mehrere davon z. B. im Feature-Raster. Vorlage: Überschrift (H3), Preis, Text, Icon-Liste, Button. Ist der Button das letzte Element, sitzt er unten, die Buttons nebeneinander stehender Boxen stehen also auf einer Linie.

| Ort | Einstellung | Hinweis |
|---|---|---|
| Layout → Preis-Box | Hervorheben, Badge-Text | Rahmen 2px in der Akzentfarbe und Badge oben mittig; Standard-Text „Beliebt“, leer = kein Badge |
| Layout → Preis-Box | Abstand, Textausrichtung | responsiv; die Icon-Liste bleibt linksbündig |
| Style → Farben | Akzent, Badge-Text | *Akzent* = Rahmen (hervorgehoben) und Badge-Hintergrund |

Das Panel *Rahmen* überschreibt den Standardrahmen, auch den hervorgehobenen.

### 3.14 Dynamische Werte

Bild und Button können ihren Wert aus dem **aktuellen Beitrag** holen, etwa das Beitragsbild, ein ACF-Bild, den Link zum Beitrag oder ein ACF-Link-Feld. Im **Query Loop** gilt das pro Eintrag. So lässt sich ein Teaser einmal gestalten, und jeder Eintrag zeigt seine eigenen Werte.

1. Block auswählen, Tab *Layout*.
2. Bild: Bereich *Bild* → **Dynamischer Wert**. Button: Bereich *Link* → **Dynamischer Wert**.
3. Feld wählen. Die Liste ist nach Quelle gruppiert (*WordPress*, *Post-Meta*, *ACF*) und zeigt nur passende Felder.
4. Zum Lösen der Bindung *Kein (statischer Wert)* wählen.

Verfügbare Felder:

| Gruppe | Bild | Link | Text (Platzhalter) |
|---|---|---|---|
| WordPress | Beitragsbild | Link zum Beitrag | Titel, Auszug, Datum, Link zum Beitrag |
| Post-Meta | – | – | registrierte Meta-Felder mit `show_in_rest` (einzeln, Text/Zahl); keine geschützten (`_…`) |
| ACF | Bild | URL, Link, Seitenlink | Text, Textbereich, Zahl, Bereich, E-Mail, WYSIWYG, Auswahl, Checkbox, Radio, Button-Gruppe, Ja/Nein, Datum, Datum/Zeit, Zeit, Farbe, Beitrag, Relation, URL, Link, Seitenlink |

ACF-Felder erscheinen mit dem Namen ihrer Feldgruppe, z. B. „Projekt: Untertitel“, und nur, wenn die Feldgruppe für den Post-Typ gilt. Repeater, Flexible Content und Gruppenfelder werden noch nicht unterstützt.

ACF-Besonderheiten:

- **Datum** und **Auswahl** erscheinen im Rückgabeformat des Feldes (z. B. `d.m.Y`). Mehrfachauswahl wird kommagetrennt ausgegeben.
- **Ja/Nein** wird als „Ja“ bzw. „Nein“ ausgegeben.
- **Beitrag/Relation** zeigt die Titel der verknüpften Beiträge, **Seitenlink** den Link des ersten. Berücksichtigt werden nur Beiträge, die der Betrachter sehen darf; Entwürfe und private Beiträge bleiben für Besucher verborgen.

Verhalten:

| Situation | Ergebnis |
|---|---|
| Wert vorhanden | Wird im Frontend eingesetzt. Beim Bild auch Breite, Höhe, `wp-image-<id>` (für `srcset` und Lazy Loading) und der Alternativtext aus der Mediathek. |
| Kein Wert (z. B. kein Beitragsbild) | Es gilt der statische Wert als Fallback: Fallback-Bild (Werkzeugleiste) bzw. Fallback-URL. |
| Kein Wert und kein Fallback | Das Bild wird nicht ausgegeben; der Button erscheint ohne Link. |
| Beitrag nicht öffentlich (Entwurf, privat, Passwortschutz) | Kein Wert für Besucher. Wer den Beitrag bearbeiten darf, sieht den Wert. |

Im Editor zeigt der Block eine Vorschau mit dem Wert des Beitrags bzw. des Query-Loop-Eintrags. Ohne Beitrag, etwa in einem Template, erscheint ein Hinweis anstelle des Bildes. Den Wert pro Beitrag gibt es dann erst im Frontend.

#### Platzhalter im Text

In **Text**, **Überschrift** und der **Button-Beschriftung** lassen sich Werte mitten in den Text setzen, z. B. „Neu: ‹Titel›“ oder „Veröffentlicht am ‹Datum›“.

1. Cursor an die gewünschte Stelle setzen (markierter Text wird ersetzt).
2. In der Werkzeugleiste **Dynamischer Wert** wählen. Der Eintrag liegt meist im Menü ▾ für weitere Formatierungen, neben *Fett*, *Kursiv* und *Link*.
3. Feld wählen, z. B. *Titel*, *Datum*, ein Meta-Feld oder ein ACF-Feld (siehe Tabelle oben, Spalte *Text*).

Im Editor erscheint der Feldname gestrichelt umrandet. Steht der Cursor darin, zeigt ein Popover das Feld, eine Vorschau mit dem Wert des geöffneten Beitrags und **Entfernen**.

| Situation | Ergebnis |
|---|---|
| Wert vorhanden | Ersetzt den Platzhalter, als reiner Text (HTML im Titel wird entfernt, Sonderzeichen korrekt dargestellt). Formatierung um den Platzhalter (fett, Farbe des Blocks) bleibt. |
| Kein Wert, Beitrag nicht öffentlich oder Feld unbekannt | Die Stelle bleibt leer; der Platzhaltertext aus dem Editor erscheint nie im Frontend. |
| Block ohne Platzhalter-Unterstützung (z. B. WordPress-Absatz nach dem Umwandeln) | Der Platzhaltertext bleibt stehen, wird aber nicht ersetzt. |

## 4. Erlaubte Werte

Das Plugin prüft alle Stilwerte im Editor und **beim Speichern nochmals auf dem Server**, auch bei Inhalten über REST-API oder Import. Ungültige Werte werden verworfen, es entsteht dann kein CSS dafür.

| Art | Erlaubt | Beispiele |
|---|---|---|
| Farbe | Hex (3/4/6/8 Stellen), `rgb()`/`rgba()`, `hsl()`/`hsla()`, `transparent`, `currentcolor`, CSS-Variable | `#0a7`, `rgba(0,0,0,.5)`, `var(--wp--preset--color--primary)` |
| Länge | Zahl mit `px`, `em`, `rem`, `%`, `vw`, `vh`; `0`; CSS-Variable | `1.5rem`, `-10px`, `var(--abstand-gross)` |
| Link-URL | `http`, `https`, `mailto`, `tel`, relativ; max. 2048 Zeichen | `https://example.com`, `mailto:info@example.com` |
| Bild-URL | `http`, `https`, relativ | `/wp-content/uploads/bild.jpg` |
| Hintergrundbild | wie Bild-URL, zusätzlich ohne runde Klammern; als Objekt `{ url, id? }` gespeichert | `{"url":"/wp-content/uploads/hero.jpg","id":12}` |
| Schatten, Rahmenstil, Hintergrund-Grösse/-Position/-Wiederholung | nur die Werte aus der Auswahl | `solid`, `cover`, `center center` |

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

### Icons

- **Set:** `includes/Icons/icons.json`, erzeugt mit `npm run icons` (`bin/icons.mjs`) aus `lucide-static`, `simple-icons` und – für Marken, die Simple Icons nicht führt – `@fortawesome/free-brands-svg-icons`. Die Auswahl steht im Skript (`GENERAL`, `BRANDS`, `FA_BRANDS`); Font-Awesome-Icons haben eine eigene viewBox (Schlüssel `v`); Lizenzen in `includes/Icons/LICENSES.md`. Die Markenfarben für die Social Buttons erzeugt das Skript als `src/blocks/social-buttons/_brands.scss`.
- **Speichern:** nur der Platzhalter `<span class="cf65-icon-slot" data-cf65-icon="star" aria-hidden="true"></span>` (mit Beschriftung `role="img" aria-label="…"`). SVG wird nie gespeichert, weil kses `<svg>` bei Benutzern ohne `unfiltered_html` entfernt.
- **Ausgabe:** `Icons\IconRenderer` (`render_block`) setzt das SVG in leere Platzhalter ein. `Icons\IconLibrary` baut es aus einer Whitelist von Elementen (`path`, `circle`, `rect` …) und Attributen und escaped jeden Wert. Unbekannte Namen bleiben leer.
- **Ersatz-Icon:** Platzhalter ohne `data-cf65-icon` füllt ein Elternblock mit `supports.cf65.iconFallback` (Attributname, z. B. `"icon"` bei der Icon-Liste); gelesen aus `WP_Block::$attributes`, damit auch Standardwerte greifen.
- **Grösse:** CSS-Variable `--cf65-icon-size` (Standard `1.5em`), Basis-CSS in `src/styles/_icon-slot.scss`.

Gleiches Prinzip beim **Trenner**: Formen in `includes/Blocks/shapes.json`, eingesetzt von `Blocks\SeparatorRenderer`.

### Style-Panels und Style-Map

- **Panels** wählt ein Block in `block.json` unter `supports.cf65.panels`, z. B. `[ "margin", "padding", "border", "shadow", "backgroundColor", "backgroundImage" ]`. Die Definitionen stehen in `includes/Styles/panels.json`. PHP (`Styles\Panels::apply()` über den Filter `block_type_metadata`) und JS (`withPanels()` in `src/extensions/panels/definitions.js`) ergänzen daraus Attribute (Präfix `style…`, bestehende bleiben), Einträge in `supports.cf65.styles` und Bindungen in `supports.cf65.dynamic`. Generator, Guard, CSS-Cache, Payload-Tests und Dynamic Content gelten damit ohne weiteren Code.
- **Editor:** Die Panels erscheinen per Slot/Fill am Ende der Tabs *Layout* und *Style* (`LayoutPanels`, `StylePanels` aus `src/components/inspector-tabs.js`).
- **Style-Map-Einträge** (`supports.cf65.styles`): `attr`, `property`, `type` (`color`, `length`, `enum`, `image`), optional `values` (enum), `responsive`, `state: "hover"`, `selector` (Nachfahre, z. B. `" .cf65-icon"`), `hoverScope`, `deviceVar` und neu `boost` (Blockklasse dreifach, Spezifität 0,3,0).
- **Typ `image`:** Wert `{ url, id? }`; Ausgabe `url(…)` ohne Anführungszeichen. URL wie bei Bildern geprüft, zusätzlich ohne runde Klammern; der Guard normalisiert das Objekt.
- **Dynamisches Hintergrundbild:** Bindung `dynamic.styleBackgroundImage` (`kind: image`, `style: background-image`). Der Renderer setzt `style="background-image:url(…)"` auf das erste Element des Blocks; ohne Wert bleibt das statische Bild aus dem CSS.

### Dynamic Content

- **Bindungen** stehen im Block-Attribut `dynamic`, z. B. `{"url":{"source":"current-post","provider":"core","field":"featured_image"}}`. Bindbar sind nur Attribute, die der Block in `supports.cf65.dynamic` deklariert (bisher `cf65/image` → `url`, `cf65/button` → `url`, `cf65/icon-button` → `url` und bei Blöcken mit Panel *Hintergrundbild* `styleBackgroundImage`).
- **Ausgabe:** Das gespeicherte HTML bleibt statisch. Ein `render_block`-Filter setzt die Werte per `WP_HTML_Tag_Processor` ein. Ausgegeben werden nur Felder, die der Provider selbst anbietet, und nur aus Beiträgen, die öffentlich sichtbar sind oder die der aktuelle Benutzer bearbeiten darf.
- **Inline-Platzhalter** im RichText: `<span data-cf65-source="current-post" data-cf65-provider="core" data-cf65-field="title" class="cf65-dynamic">Titel</span>`. Ersetzt wird der Inhalt nur in Blöcken mit `supports.cf65.inlineDynamic: true` (bisher `cf65/text`, `cf65/heading`, `cf65/subtitle`, `cf65/blockquote`, `cf65/button`, `cf65/icon-label`, `cf65/icon-list-item`). Das Finden übernimmt der HTML-Tokenizer von WordPress, verschachtelte Formatierung im Platzhalter eingeschlossen. Höchstens 200 Platzhalter pro Block.
- **Ausgabetypen** (`kind`): `image` (Bildfelder), `link` (URL-Felder), `text` (Text- und URL-Felder, ohne HTML, max. 10 000 Zeichen).
- **Provider `core`:** `title`, `excerpt`, `date` (Text), `permalink` (URL), `featured_image` (Bild).
- **Provider `meta`:** Schlüssel aus `get_registered_meta_keys( 'post', <Post-Typ> )` mit `show_in_rest`, `single` und Typ `string`/`integer`/`number`; ausgeschlossen sind `is_protected_meta()`-Schlüssel. Label = `description` der Registrierung.
- **Provider `acf`:** nur wenn ACF aktiv ist. Felder aus `acf_get_field_groups( [ 'post_type' => … ] )`, gebunden über den **Feldnamen**. Bilder werden als Attachment-ID gelesen (unformatiert), Textfelder formatiert (`get_field( …, true )`), Relationen und Seitenlinks über die Objektprüfung gefiltert. Ist ACF deaktiviert, bleiben Bindungen gespeichert und liefern keinen Wert.
- **REST** (nur mit `edit_posts`): `GET /wp-json/cf65-blocks/v1/dynamic/fields?kind=image|link|text&postType=…` liefert die Feldliste, `POST /wp-json/cf65-blocks/v1/dynamic/preview` mit `{ kind, postId, postType, bindings }` die aufgelösten Werte. Die Vorschau unterliegt derselben Objektprüfung wie das Frontend.

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
