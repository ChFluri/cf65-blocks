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

import * as blocksApi from '@wordpress/blocks';
import { beforeAll, describe, expect, it } from 'vitest';

import { BLOCK_DEFINITIONS, registerDefinitions } from '../definitions';

const { parse } = blocksApi;
const FIXTURES = join( __dirname, '../../../tests/fixtures/blocks' );

beforeAll( () => registerDefinitions( blocksApi ) );

const cases = readdirSync( FIXTURES ).flatMap( ( block ) =>
	readdirSync( join( FIXTURES, block ) )
		.filter( ( file ) => file.endsWith( '.html' ) )
		.map( ( file ) => [
			`${ block }/${ file }`,
			join( FIXTURES, block, file ),
		] )
);

/** @type {Array<{ file: string, content: string }>} */
const fixtureFiles = cases.map( ( [ name, path ] ) => ( {
	file: name.split( '/' )[ 1 ],
	content: readFileSync( path, 'utf8' ),
} ) );

const flatten = ( list ) =>
	list.flatMap( ( block ) => [
		block,
		...flatten( block.innerBlocks ?? [] ),
	] );

describe( 'Block-Fixtures bleiben gültig', () => {
	it( 'jeder Block hat eine Fixture seiner aktuellen markupVersion', () => {
		const missing = BLOCK_DEFINITIONS.map( ( { metadata } ) => {
			const version = metadata.attributes.markupVersion?.default;
			return { name: metadata.name, version };
		} ).filter(
			( { name, version } ) =>
				! Number.isInteger( version ) ||
				! fixtureFiles.some(
					( { file, content } ) =>
						file === `v${ version }.html` &&
						content.includes( `<!-- wp:${ name } ` )
				)
		);
		expect( missing ).toEqual( [] );
	} );

	it( 'jeder Block hat ein deprecated-Array', () => {
		const invalid = BLOCK_DEFINITIONS.filter(
			( { deprecated } ) => ! Array.isArray( deprecated )
		).map( ( { metadata } ) => metadata.name );
		expect( invalid ).toEqual( [] );
	} );

	it.each( cases )( '%s', ( _name, path ) => {
		const blocks = parse( readFileSync( path, 'utf8' ) ).filter(
			( block ) => block.name !== null
		);

		expect( blocks.length ).toBeGreaterThan( 0 );
		for ( const block of flatten( blocks ) ) {
			expect( block.name.startsWith( 'cf65/' ) ).toBe( true );
			// Zuerst die Issues vergleichen: zeigt bei Fehlern den Grund an.
			expect( block.validationIssues ?? [] ).toEqual( [] );
			expect( block.isValid ).toBe( true );
		}
	} );
} );
