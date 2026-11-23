// @vitest-environment jsdom

/**
 * Update-Sicherheit (UMSETZPLAN Kap. 2.2, Schicht 3):
 * Jede gespeicherte Markup-Version unter tests/fixtures/blocks/<block>/
 * muss mit dem aktuellen Code als gültig erkannt werden (direkt oder über
 * eine `deprecated`-Migration). Ändert sich `save()` ohne neue Fixture,
 * schlägt dieser Test fehl.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getBlockTypes, parse, registerBlockType } from '@wordpress/blocks';
import { beforeAll, describe, expect, it } from 'vitest';

import headingMetadata from '../heading/block.json';
import headingSave from '../heading/save';

const FIXTURES = join( __dirname, '../../../tests/fixtures/blocks' );

/** Blöcke mit save (und später deprecated) – ohne Editor-UI. */
const BLOCKS = [ { metadata: headingMetadata, save: headingSave } ];

beforeAll( () => {
	for ( const { metadata, save, deprecated } of BLOCKS ) {
		if ( ! getBlockTypes().some( ( b ) => b.name === metadata.name ) ) {
			registerBlockType( metadata, {
				edit: () => null,
				save,
				deprecated,
			} );
		}
	}
} );

const cases = readdirSync( FIXTURES ).flatMap( ( block ) =>
	readdirSync( join( FIXTURES, block ) )
		.filter( ( file ) => file.endsWith( '.html' ) )
		.map( ( file ) => [
			`${ block }/${ file }`,
			join( FIXTURES, block, file ),
		] )
);

describe( 'Block-Fixtures bleiben gültig', () => {
	it( 'es gibt Fixtures für jeden Block', () => {
		const withFixtures = new Set(
			cases.map( ( [ name ] ) => name.split( '/' )[ 0 ] )
		);
		for ( const { metadata } of BLOCKS ) {
			expect( withFixtures ).toContain( metadata.name.split( '/' )[ 1 ] );
		}
	} );

	it.each( cases )( '%s', ( _name, path ) => {
		const blocks = parse( readFileSync( path, 'utf8' ) ).filter(
			( block ) => block.name !== null
		);

		expect( blocks.length ).toBeGreaterThan( 0 );
		for ( const block of blocks ) {
			expect( block.name.startsWith( 'cf65/' ) ).toBe( true );
			// Zuerst die Issues vergleichen: zeigt bei Fehlern den Grund an.
			expect( block.validationIssues ?? [] ).toEqual( [] );
			expect( block.isValid ).toBe( true );
		}
	} );
} );
