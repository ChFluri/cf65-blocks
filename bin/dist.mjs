#!/usr/bin/env node
/**
 * Verschiebt das von `wp-scripts plugin-zip` erzeugte ZIP nach `dist/`
 * und schreibt eine SHA-256-Prüfsumme im Format von `sha256sum`.
 *
 * Aufruf über `npm run dist` (baut vorher und erstellt das ZIP).
 * Prüfen: `cd dist && sha256sum -c cf65-blocks.zip.sha256`
 */
/* eslint-disable no-console -- CLI-Skript, Ausgabe auf der Konsole ist gewollt. */
import { createHash } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const NAME = 'cf65-blocks.zip';
const DIST = 'dist';

if ( ! existsSync( NAME ) ) {
	console.error(
		`[cf65-blocks] ${ NAME } fehlt – zuerst wp-scripts plugin-zip ausführen.`
	);
	process.exit( 1 );
}

rmSync( DIST, { recursive: true, force: true } );
mkdirSync( DIST );

const target = join( DIST, NAME );
renameSync( NAME, target );

const hash = createHash( 'sha256' )
	.update( readFileSync( target ) )
	.digest( 'hex' );
writeFileSync( `${ target }.sha256`, `${ hash }  ${ NAME }\n` );

console.log( `[cf65-blocks] ${ target } (sha256 ${ hash })` );
