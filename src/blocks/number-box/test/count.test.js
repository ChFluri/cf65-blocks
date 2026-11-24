import { describe, expect, it } from 'vitest';

import { formatNumber, parseNumber } from '../count';

describe( 'parseNumber / formatNumber', () => {
	it.each( [
		[ '250+', 250, '', '+', '250' ],
		[ '98 %', 98, '', ' %', '98' ],
		[ "CHF 1'200", 1200, 'CHF ', '', "1'200" ],
		[ '4,5 Sterne', 4.5, '', ' Sterne', '4,5' ],
		[ '1.000', 1000, '', '', '1.000' ],
		[ '1.234.567', 1234567, '', '', '1.234.567' ],
		[ "1'234.56", 1234.56, '', '', "1'234.56" ],
		[ '1.234,5', 1234.5, '', '', '1.234,5' ],
		[ '1 000 000 Kunden', 1000000, '', ' Kunden', '1 000 000' ],
	] )( '%s', ( text, value, before, after, formatted ) => {
		const parts = parseNumber( text );
		expect( parts ).toMatchObject( { value, before, after } );
		expect( formatNumber( parts.value, parts ) ).toBe( formatted );
		expect(
			parts.before + formatNumber( parts.value, parts ) + parts.after
		).toBe( text );
	} );

	it( 'formatiert Zwischenwerte im gleichen Format', () => {
		const parts = parseNumber( "1'234.56" );
		expect( formatNumber( 0, parts ) ).toBe( '0.00' );
		expect( formatNumber( 617.284, parts ) ).toBe( '617.28' );
	} );

	it( 'ohne Zahl: null', () => {
		expect( parseNumber( 'viele' ) ).toBeNull();
		expect( parseNumber( '' ) ).toBeNull();
	} );
} );
