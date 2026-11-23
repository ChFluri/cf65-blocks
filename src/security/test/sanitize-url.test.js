import { describe, expect, it } from 'vitest';

import urls from '../../../tests/fixtures/security/urls.json';
import { IMAGE_SCHEMES, sanitizeUrl } from '../sanitize';

describe( 'sanitizeUrl (gemeinsame Fälle mit PHP)', () => {
	it.each( urls.cases.map( ( c ) => [ JSON.stringify( c.url ), c ] ) )(
		'%s',
		( _label, { url, link, image } ) => {
			expect( sanitizeUrl( url ) ).toBe( link ? url : null );
			expect( sanitizeUrl( url, IMAGE_SCHEMES ) ).toBe(
				image ? url : null
			);
		}
	);

	it( 'verwirft Nicht-Strings und zu lange Werte (Bytes)', () => {
		expect( sanitizeUrl( null ) ).toBeNull();
		expect( sanitizeUrl( 42 ) ).toBeNull();
		expect( sanitizeUrl( {} ) ).toBeNull();
		expect( sanitizeUrl( 'https://x.y/' + 'a'.repeat( 2048 ) ) ).toBeNull();
		expect( sanitizeUrl( 'https://x.y/' + 'ä'.repeat( 1020 ) ) ).toBeNull();
	} );
} );
