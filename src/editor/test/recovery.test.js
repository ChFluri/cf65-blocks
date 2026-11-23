// @vitest-environment jsdom

/**
 * Auto-Recovery (UMSETZPLAN Kap. 2.2, Schicht 4): ungültige cf65-Blöcke
 * werden verlustfrei aus ihren Attributen neu erzeugt; fremde Blöcke
 * bleiben unangetastet.
 */
import * as blocksApi from '@wordpress/blocks';
import { beforeAll, describe, expect, it } from 'vitest';

import { registerDefinitions } from '../../blocks/definitions';
import { findBrokenBlocks, rebuildBlock } from '../recovery';

const { parse, registerBlockType, serialize, getBlockType } = blocksApi;

beforeAll( () => {
	registerDefinitions( blocksApi );
	if ( ! getBlockType( 'test/foreign' ) ) {
		registerBlockType( 'test/foreign', {
			apiVersion: 3,
			title: 'Fremd',
			category: 'text',
			attributes: {
				// Fremde Blöcke dürfen Inhalte aus dem HTML lesen.
				content: { type: 'string', source: 'html', selector: 'p' },
			},
			edit: () => null,
			save: ( { attributes } ) => (
				<div className="foreign">
					<p>{ attributes.content }</p>
				</div>
			),
		} );
	}
} );

// Simuliertes „altes“ Markup: andere Klasse, zusätzliches <span>.
const BROKEN_HEADING = `<!-- wp:cf65/heading {"uniqueId":"a1b2c3d4","content":"Hallo \\u003cem\\u003eWelt\\u003c/em\\u003e","level":3,"textColor":"#ff0000","markupVersion":0} -->
<h3 class="cf65-heading-old"><span>Hallo <em>Welt</em></span></h3>
<!-- /wp:cf65/heading -->`;

describe( 'Auto-Recovery', () => {
	it( 'erzeugt einen ungültigen Block verlustfrei neu', () => {
		const [ block ] = parse( BROKEN_HEADING );
		expect( block.isValid ).toBe( false );

		const { block: rebuilt, count } = rebuildBlock( block );
		expect( count ).toBe( 1 );
		expect( rebuilt.attributes ).toMatchObject( {
			uniqueId: 'a1b2c3d4',
			content: 'Hallo <em>Welt</em>',
			level: 3,
			textColor: '#ff0000',
			markupVersion: 1,
		} );

		// Das neu serialisierte Markup ist gültig.
		const [ reparsed ] = parse( serialize( [ rebuilt ] ) );
		expect( reparsed.isValid ).toBe( true );
		expect( reparsed.attributes.content ).toBe( 'Hallo <em>Welt</em>' );
	} );

	it( 'findet ungültige Blöcke auch verschachtelt und repariert nur diese', () => {
		const html = `<!-- wp:cf65/columns {"uniqueId":"c0l5abcd"} -->
<div class="wp-block-cf65-columns cf65-block cf65-columns cf65-c0l5abcd"><!-- wp:cf65/column {"uniqueId":"c0l1aaaa"} -->
<div class="wp-block-cf65-column cf65-block cf65-column cf65-c0l1aaaa"><!-- wp:cf65/text {"uniqueId":"t3x7aaaa","content":"Kaputt"} -->
<p class="falsch">Kaputt</p>
<!-- /wp:cf65/text --></div>
<!-- /wp:cf65/column --></div>
<!-- /wp:cf65/columns -->`;
		const blocks = parse( html );
		expect( blocks[ 0 ].isValid ).toBe( true );

		const broken = findBrokenBlocks( blocks );
		expect( broken.map( ( b ) => b.name ) ).toEqual( [ 'cf65/text' ] );

		const { block: rebuilt } = rebuildBlock( broken[ 0 ] );
		expect( rebuilt.attributes.content ).toBe( 'Kaputt' );
	} );

	it( 'repariert ungültige cf65-Kinder eines ungültigen cf65-Blocks mit', () => {
		const html = `<!-- wp:cf65/column {"uniqueId":"c0l1aaaa"} -->
<section><!-- wp:cf65/text {"uniqueId":"t3x7aaaa","content":"Innen"} -->
<p>Innen</p>
<!-- /wp:cf65/text --></section>
<!-- /wp:cf65/column -->`;
		const [ column ] = parse( html );
		expect( column.isValid ).toBe( false );
		expect( column.innerBlocks[ 0 ].isValid ).toBe( false );

		const { block: rebuilt, count } = rebuildBlock( column );
		expect( count ).toBe( 2 );
		const [ reparsed ] = parse( serialize( [ rebuilt ] ) );
		expect( reparsed.isValid ).toBe( true );
		expect( reparsed.innerBlocks[ 0 ].isValid ).toBe( true );
		expect( reparsed.innerBlocks[ 0 ].attributes.content ).toBe( 'Innen' );
	} );

	it( 'lässt fremde Blöcke und deren Inhalt unangetastet', () => {
		const html = `<!-- wp:test/foreign -->
<div class="anders"><p>Fremd</p><!-- wp:cf65/text {"uniqueId":"t3x7aaaa","content":"X"} -->
<p>X</p>
<!-- /wp:cf65/text --></div>
<!-- /wp:test/foreign -->`;
		const blocks = parse( html );
		expect( blocks[ 0 ].isValid ).toBe( false );
		expect( findBrokenBlocks( blocks ) ).toEqual( [] );
	} );

	it( 'gültige Blöcke werden nicht gemeldet', () => {
		const ok = `<!-- wp:cf65/text {"uniqueId":"t1x2t3x4","content":"Ok"} -->
<p class="wp-block-cf65-text cf65-block cf65-text cf65-t1x2t3x4">Ok</p>
<!-- /wp:cf65/text -->`;
		expect( findBrokenBlocks( parse( ok ) ) ).toEqual( [] );
	} );
} );
