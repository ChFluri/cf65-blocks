#!/usr/bin/env node
/**
 * Baut bzw. beobachtet alle Blöcke unter `src/blocks` (je ein block.json).
 *
 * Wrapper um `wp-scripts`, damit der Build auch ohne Blöcke (Phase 0)
 * sauber durchläuft.
 *
 * Aufruf: node bin/blocks.mjs build|start
 */
/* eslint-disable no-console -- CLI-Skript, Ausgabe auf der Konsole ist gewollt. */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[ 2 ];
if ( ! [ 'build', 'start' ].includes( mode ) ) {
	console.error( 'Aufruf: node bin/blocks.mjs build|start' );
	process.exit( 1 );
}

const srcDir = join( 'src', 'blocks' );
const hasBlocks =
	existsSync( srcDir ) &&
	readdirSync( srcDir, { withFileTypes: true } ).some(
		( entry ) =>
			entry.isDirectory() &&
			existsSync( join( srcDir, entry.name, 'block.json' ) )
	);

if ( ! hasBlocks ) {
	console.log(
		'[cf65-blocks] Keine Blöcke unter src/blocks – übersprungen.'
	);
	process.exit( 0 );
}

const result = spawnSync(
	'wp-scripts',
	[
		mode,
		'--webpack-src-dir=src/blocks',
		'--output-path=build/blocks',
		'--blocks-manifest',
		'--experimental-modules',
	],
	{ stdio: 'inherit', shell: process.platform === 'win32' }
);

process.exit( result.status ?? 1 );
