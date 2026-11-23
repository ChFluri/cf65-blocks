# Changelog

Alle relevanten Änderungen werden hier dokumentiert.
Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- Projektgerüst (Phase 0): Plugin-Bootstrap mit Versionsprüfung, PSR-4-Autoloader, Block-Registrierung über Manifest, eigene Block-Kategorie.
- Tooling: `@wordpress/scripts`, wp-env (PHP 8.5, ACF, Pods, Query Monitor), PHPCS mit Security-Sniffs, PHPStan, PHPUnit + Brain Monkey, Vitest, Playwright.
- Block **Überschrift (cf65)** (`cf65/heading`): Ebene H1–H6, responsive Schriftgrösse und Ausrichtung, Text- und Hover-Farbe; Inspector mit Tabs Layout/Style/Erweitert.
- Block **Text (cf65)** (`cf65/text`): Absatz mit denselben Stil-Optionen; Enter teilt, Rücktaste führt zusammen; Umwandlung von/zu Absatz und Überschrift (cf65).
- Block **Button (cf65)** (`cf65/button`): Link mit Ziel-URL (nur http(s), mailto, tel, relativ), „In neuem Tab öffnen“, Text-/Hintergrundfarbe inkl. Hover, responsive Schriftgrösse und Innenabstände, Eckenradius.
- Block **Bild (cf65)** (`cf65/image`): Mediathek/Upload/URL, Alternativtext, Bildunterschrift, responsive Breite, Ausrichtung, Eckenradius; `wp-image-<id>` für automatisches srcset.
- Blöcke **Spalten (cf65)** / **Spalte (cf65)** (`cf65/columns`, `cf65/column`): 1–6 Spalten, responsiver Abstand und vertikale Ausrichtung, Spaltenbreite pro Gerät; stapelt mobil automatisch.
- CSS-Generator: `hoverScope: "selector"` (Hover am Unterelement) und `deviceVar` (CSS-Variable pro Gerät).
- CSS-Generator in PHP und JS mit gemeinsamen Testfällen (identische Ausgabe in Editor und Frontend), typisierter Sanitizer für Farben, Längen und Auswahlwerte.
- Stabile `uniqueId` pro Block; Duplikate erhalten automatisch eine neue ID.
- Update-Sicherheit: Fixture-Test für gespeichertes Markup (`tests/fixtures/blocks/`), inkl. Prüfung auf Fixture der aktuellen `markupVersion`; `deprecated.js` pro Block.
- Auto-Recovery im Editor: ungültige cf65-Blöcke werden beim Laden verlustfrei aus ihren Attributen neu erzeugt (mit Hinweis, rückgängig machbar); fremde Blöcke bleiben unangetastet. Abschaltbar über den Filter `cf65_blocks/auto_recovery`.
- GitHub: CI, CodeQL, Dependency Review, Dependabot, Release-Workflow mit SHA-256-Prüfsumme, Issue-/PR-Vorlagen, Sicherheitsrichtlinie.
