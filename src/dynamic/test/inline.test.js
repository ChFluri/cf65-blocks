// @vitest-environment jsdom
import {
	create,
	registerFormatType,
	toHTMLString,
	unregisterFormatType,
} from '@wordpress/rich-text';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
	FORMAT_ATTRIBUTES,
	FORMAT_CLASS,
	FORMAT_NAME,
	insertDynamic,
	removeToken,
	supportsInlineDynamic,
	tokenRange,
} from '../inline';

const TITLE = { source: 'current-post', provider: 'core', field: 'title' };

beforeAll( () => {
	registerFormatType( FORMAT_NAME, {
		title: 'Dynamischer Wert',
		tagName: 'span',
		className: FORMAT_CLASS,
		attributes: FORMAT_ATTRIBUTES,
		edit: () => null,
	} );
} );

afterAll( () => {
	unregisterFormatType( FORMAT_NAME );
} );

/**
 * @param {string} html  HTML.
 * @param {number} start Cursor.
 * @return {Object} RichText-Wert mit Cursor.
 */
const valueAt = ( html, start ) => {
	const value = create( { html } );
	return { ...value, start, end: start };
};

describe( 'insertDynamic', () => {
	it( 'erzeugt den Platzhalter im Speicherformat des Servers', () => {
		const value = valueAt( 'Neu: ', 5 );

		expect(
			toHTMLString( { value: insertDynamic( value, TITLE, 'Titel' ) } )
		).toBe(
			'Neu: <span data-cf65-source="current-post" data-cf65-provider="core" data-cf65-field="title" class="cf65-dynamic">Titel</span>'
		);
	} );

	it( 'ersetzt markierten Text und nutzt ohne Label den Feldnamen', () => {
		const value = { ...create( { html: 'a XXX b' } ), start: 2, end: 5 };

		expect( toHTMLString( { value: insertDynamic( value, TITLE ) } ) ).toBe(
			'a <span data-cf65-source="current-post" data-cf65-provider="core" data-cf65-field="title" class="cf65-dynamic">title</span> b'
		);
	} );

	it( 'ignoriert ungültige Bindungen', () => {
		const value = valueAt( 'x', 1 );
		expect( insertDynamic( value, { source: '<x>' }, 'Y' ) ).toBe( value );
	} );
} );

describe( 'tokenRange und removeToken', () => {
	const html =
		'Hallo <span data-cf65-source="current-post" data-cf65-provider="core" data-cf65-field="title" class="cf65-dynamic">Titel</span>!';

	it( 'findet den Platzhalter im und direkt hinter dem Text', () => {
		expect( tokenRange( valueAt( html, 8 ) ) ).toEqual( {
			start: 6,
			end: 11,
		} );
		expect( tokenRange( valueAt( html, 11 ) ) ).toEqual( {
			start: 6,
			end: 11,
		} );
		expect( tokenRange( valueAt( html, 2 ) ) ).toBeNull();
	} );

	it( 'entfernt Text und Format', () => {
		expect(
			toHTMLString( { value: removeToken( valueAt( html, 8 ) ) } )
		).toBe( 'Hallo !' );
	} );
} );

describe( 'supportsInlineDynamic', () => {
	it( 'liest supports.cf65.inlineDynamic', () => {
		expect(
			supportsInlineDynamic( {
				supports: { cf65: { inlineDynamic: true } },
			} )
		).toBe( true );
		expect( supportsInlineDynamic( { supports: {} } ) ).toBe( false );
		expect( supportsInlineDynamic( undefined ) ).toBe( false );
	} );
} );
