import { describe, expect, it } from 'vitest';

import { IMAGE_SCHEMES, sanitizeUrl } from '../sanitize';

describe( 'sanitizeUrl', () => {
	it.each( [
		'https://example.org/pfad?x=1#a',
		'http://example.org',
		'mailto:info@example.org',
		'tel:+41441234567',
		'/kontakt/',
		'#anker',
		'?seite=2',
		'seite.html',
		'../bild.jpg',
		'HTTPS://EXAMPLE.ORG',
	] )( 'erlaubt %s', ( url ) => {
		expect( sanitizeUrl( url ) ).toBe( url );
	} );

	it.each( [
		'javascript:alert(1)',
		'JavaScript:alert(1)',
		'java\tscript:alert(1)',
		' javascript:alert(1)',
		'\njavascript:alert(1)',
		'data:text/html;base64,PHNjcmlwdD4=',
		'vbscript:x',
		'https://example.org/"onmouseover="x',
		'https://example.org/<script>',
		'https://exa mple.org',
		'\\evil.example',
		'',
		'x'.repeat( 2049 ),
		null,
		42,
		{},
	] )( 'verwirft %j', ( url ) => {
		expect( sanitizeUrl( url ) ).toBeNull();
	} );

	it( 'Bildquellen nur http(s)', () => {
		expect( sanitizeUrl( 'mailto:a@b.c', IMAGE_SCHEMES ) ).toBeNull();
		expect( sanitizeUrl( 'https://a.b/c.jpg', IMAGE_SCHEMES ) ).toBe(
			'https://a.b/c.jpg'
		);
	} );
} );
