# cf65 Blocks

Erweiterte Gutenberg-Blöcke für WordPress mit

- **Dynamic Content** aus **ACF** und **Pods** (Text, Bilder, Hintergründe, Links – auch im Query Loop)
- **Conditional Display** (Login, Rolle, Datum, Post-Daten, Feldwerte)
- **erweiterten Einstellungen pro Block** (responsiv, Hover, Motion Effects, Transform, Custom CSS)
- **Update-Sicherheit** ohne Blockfehler nach Plugin-Updates
- **Debug-Modus** mit Performance-Messung

> Status: in Entwicklung (Phase 1). Noch nicht für produktive Sites geeignet.
> Umsetzungsplan: [docs/UMSETZPLAN.md](docs/UMSETZPLAN.md) · Benutzung der Blöcke: [docs/BENUTZUNG.md](docs/BENUTZUNG.md)

## Voraussetzungen

| | Version |
|---|---|
| WordPress | ≥ 6.7 |
| PHP | ≥ 8.5 |

## Installation

Vorerst manuell: `cf65-blocks.zip` aus den [Releases](https://github.com/ChFluri/cf65-blocks/releases) herunterladen, Prüfsumme kontrollieren (siehe [SECURITY.md](SECURITY.md)) und unter *Plugins → Installieren → Plugin hochladen* installieren.

## Entwicklung

Benötigt: Node ≥ 22 (empfohlen 24, siehe `.nvmrc`), Composer 2, PHP 8.5 (mit `openssl`, `mbstring`), Docker.

```sh
npm install
composer install

npm run build          # Editor-Skript + Blöcke bauen
npm run env:start      # WordPress + ACF + Pods + Query Monitor unter http://localhost:8888 (admin / password)

composer lint          # PHPCS inkl. Security-Sniffs
composer analyse       # PHPStan
composer test          # PHPUnit
npm run lint           # ESLint, Stylelint, package.json
npm run test:unit      # Vitest
npm run test:e2e       # Playwright gegen wp-env (Port 8889)

npm run dist           # Build + Plugin-ZIP mit SHA-256 nach dist/
```

Für ein Release-ZIP mit Laufzeit-Abhängigkeiten vorher `composer install --no-dev` ausführen (so baut es auch der Release-Workflow).

### Debug-Modus

In `wp-config.php` `define( 'CF65_BLOCKS_DEBUG', true );` setzen (in wp-env bereits aktiv) oder die Option `cf65_blocks_debug` einschalten. Messwerte sehen nur Benutzer mit `manage_options`:

- Admin-Bar-Menü **cf65 Performance** (Blöcke, CSS, DB-Queries, Speicher, langsamste Blöcke)
- `Server-Timing`-Header (`cf65-render`, `cf65-css`, `cf65-queries`) in den Browser-DevTools
- im Editor `performance.measure( 'cf65-css' )` pro CSS-Neuberechnung

Benchmark eines Beitrags:

```sh
npx wp-env run cli wp cf65 bench <post-id> --runs=20 [--format=json]
```

Beiträge: siehe [CONTRIBUTING.md](CONTRIBUTING.md).

## Lizenz

[GPL-2.0-or-later](LICENSE)
