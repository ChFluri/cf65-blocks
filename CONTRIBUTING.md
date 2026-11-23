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

## Neuer Block

1. `src/blocks/<slug>/` mit `block.json` (inkl. `markupVersion` mit Default 1 und `supports.cf65.styles`), `edit.js`, `save.js`, `deprecated.js` (leeres Array), `index.js`.
2. In [src/blocks/definitions.js](src/blocks/definitions.js) eintragen.
3. Fixture `tests/fixtures/blocks/<slug>/v1.html` mit typischen Varianten anlegen.
4. E2E-Test unter `tests/e2e/specs/` (Frontend-CSS, erneutes Laden ohne Blockfehler).

Alle Attribute ohne `source` definieren (Inhalt steht im Block-Kommentar). Nur so kann die Auto-Recovery einen Block verlustfrei neu erzeugen.

## Markup eines Blocks ändern

Gutenberg vergleicht gespeichertes HTML mit der aktuellen `save()`-Ausgabe. Jede Änderung an `save()` braucht deshalb:

1. Das **bisherige** `save()` (und ggf. Attribute/Supports) als ersten Eintrag in `deprecated.js` übernehmen, bei Bedarf mit `migrate()`.
2. `markupVersion`-Default in `block.json` um 1 erhöhen.
3. Neue Fixture `v<neu>.html` anlegen. Die alten Fixtures bleiben unverändert und müssen weiter gültig sein (über `deprecated`).

Die CI prüft das: Der Fixture-Test schlägt fehl, wenn eine alte Fixture ungültig wird oder zur aktuellen `markupVersion` keine Fixture existiert.

Falls trotzdem ein Block ungültig lädt, repariert ihn die **Auto-Recovery** im Editor aus seinen Attributen. Ein Hinweis erscheint, nach dem Speichern ist das neue Markup gespeichert. Abschalten mit:

```php
add_filter( 'cf65_blocks/auto_recovery', '__return_false' );
```

## Versionierung

[SemVer](https://semver.org/lang/de/). Releases entstehen durch einen Tag `vX.Y.Z`; die Version im Plugin-Header muss dem Tag entsprechen.
