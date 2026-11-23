import { describe, expect, it } from 'vitest';

import fixtures from '../../../tests/fixtures/css/cases.json';
import { generateCss } from '../generator';

describe( 'generateCss (gemeinsame Fälle mit PHP)', () => {
	it.each( fixtures.cases )(
		'$name',
		( { uniqueId, attributes, expected } ) => {
			expect( generateCss( uniqueId, fixtures.map, attributes ) ).toBe(
				expected
			);
		}
	);
} );

describe( 'generateCss (Robustheit)', () => {
	it( 'ignoriert ungültige Map-Einträge', () => {
		const map = [
			null,
			{ attr: 'a', property: 'color;x', type: 'color' },
			{ attr: 'a', property: 'color', type: 'color', selector: '{}' },
			{ attr: 'a', property: 'color', type: 'unknown' },
			{ attr: 'a', property: 'color', type: 'color' },
		];
		expect( generateCss( 'abcd', map, { a: '#fff' } ) ).toBe(
			'.cf65-abcd{color:#fff}'
		);
	} );

	it( 'liefert leeren String bei fehlenden Eingaben', () => {
		expect( generateCss( 'abcd', null, {} ) ).toBe( '' );
		expect( generateCss( 'abcd', [], null ) ).toBe( '' );
	} );
} );
