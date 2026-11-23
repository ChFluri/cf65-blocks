# Mitwirken an cf65 Blocks

Danke für dein Interesse! Grundlage aller Arbeiten ist der [Umsetzplan](docs/UMSETZPLAN.md).

## Ablauf

1. Issue eröffnen oder bestehendes kommentieren (bei grösseren Änderungen vorher abstimmen).
2. Branch von `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
3. Commits nach [Conventional Commits](https://www.conventionalcommits.org/de/) (`feat(dynamic): pods provider`).
4. Pull Request mit ausgefüllter Checkliste (Sicherheit, Update-Sicherheit, Performance).
5. CI muss grün sein; mindestens ein Review.

## Grundregeln

- **Sicherheit zuerst** (Umsetzplan Kap. 7): Block-Attribute sind unvertrauenswürdig, spät escapen, jede REST-Route mit `permission_callback`, kein `eval`.
- **Update-Sicherheit** (Kap. 2.2): Änderungen an `save()` nur mit neuer Fixture und `deprecated`-Eintrag.
- **Performance** (Kap. 8): Assets nur bei Bedarf laden, Debug-Messpunkte für neue Render-Pfade.
- **Präfixe:** PHP-Namespace `Cf65\Blocks`, Hooks/Optionen `cf65_blocks_…` bzw. `cf65_blocks/…`, Blöcke `cf65/…`, CSS-Klassen `cf65-…`.
- **Code-Stil:** WordPress Coding Standards (PHPCS), `@wordpress/scripts` (ESLint/Prettier/Stylelint).
- **Sprache:** Code und Bezeichner Englisch, Kommentare und Doku Deutsch; UI-Texte übersetzbar (`cf65-blocks`).

## Versionierung

[SemVer](https://semver.org/lang/de/). Releases entstehen durch einen Tag `vX.Y.Z`; die Version im Plugin-Header muss dem Tag entsprechen.
