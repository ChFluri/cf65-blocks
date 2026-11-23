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

import buttonMetadata from '../button/block.json';
import buttonSave from '../button/save';
import columnMetadata from '../column/block.json';
import columnSave from '../column/save';
import columnsMetadata from '../columns/block.json';
import columnsSave from '../columns/save';
import headingMetadata from '../heading/block.json';
import headingSave from '../heading/save';
import imageMetadata from '../image/block.json';
import imageSave from '../image/save';
import textMetadata from '../text/block.json';
import textSave from '../text/save';

const FIXTURES = join( __dirname, '../../../tests/fixtures/blocks' );

/** Blöcke mit save (und später deprecated) – ohne Editor-UI. */
const BLOCKS = [
	{ metadata: headingMetadata, save: headingSave },
	{ metadata: textMetadata, save: textSave },
	{ metadata: buttonMetadata, save: buttonSave },
	{ metadata: imageMetadata, save: imageSave },
	{ metadata: columnsMetadata, save: columnsSave },
	{ metadata: columnMetadata, save: columnSave },
];

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
		const covered = ( name ) =>
			cases.some( ( [ , path ] ) =>
				readFileSync( path, 'utf8' ).includes( `<!-- wp:${ name } ` )
			);
		const missing = BLOCKS.map( ( { metadata } ) => metadata.name ).filter(
			( name ) => ! covered( name )
		);
		expect( missing ).toEqual( [] );
	} );

	it.each( cases )( '%s', ( _name, path ) => {
		const blocks = parse( readFileSync( path, 'utf8' ) ).filter(
			( block ) => block.name !== null
		);

		expect( blocks.length ).toBeGreaterThan( 0 );
		const flatten = ( list ) =>
			list.flatMap( ( block ) => [
				block,
				...flatten( block.innerBlocks ?? [] ),
			] );
		for ( const block of flatten( blocks ) ) {
			expect( block.name.startsWith( 'cf65/' ) ).toBe( true );
			// Zuerst die Issues vergleichen: zeigt bei Fehlern den Grund an.
			expect( block.validationIssues ?? [] ).toEqual( [] );
			expect( block.isValid ).toBe( true );
		}
	} );
} );
