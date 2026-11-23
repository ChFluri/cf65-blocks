# Changelog

Alle relevanten Änderungen werden hier dokumentiert.
Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- Projektgerüst (Phase 0): Plugin-Bootstrap mit Versionsprüfung, PSR-4-Autoloader, Block-Registrierung über Manifest, eigene Block-Kategorie.
- Tooling: `@wordpress/scripts`, wp-env (PHP 8.5, ACF, Pods, Query Monitor), PHPCS mit Security-Sniffs, PHPStan, PHPUnit + Brain Monkey, Vitest, Playwright.
- Block **Überschrift (cf65)** (`cf65/heading`): Ebene H1–H6, responsive Schriftgrösse und Ausrichtung, Text- und Hover-Farbe; Inspector mit Tabs Layout/Style/Erweitert.
- CSS-Generator in PHP und JS mit gemeinsamen Testfällen (identische Ausgabe in Editor und Frontend), typisierter Sanitizer für Farben, Längen und Auswahlwerte.
- Stabile `uniqueId` pro Block; Duplikate erhalten automatisch eine neue ID.
- Update-Sicherheit: Fixture-Test für gespeichertes Markup (`tests/fixtures/blocks/`).
- GitHub: CI, CodeQL, Dependency Review, Dependabot, Release-Workflow mit SHA-256-Prüfsumme, Issue-/PR-Vorlagen, Sicherheitsrichtlinie.
