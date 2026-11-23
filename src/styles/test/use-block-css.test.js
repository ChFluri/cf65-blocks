// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { generateCss } from '../generator';
import { MEASURE_NAME, measuredCss } from '../use-block-css';

const MAP = [ { attr: 'textColor', property: 'color', type: 'color' } ];
const ATTRS = { textColor: '#ff0000' };

describe( 'measuredCss', () => {
	afterEach( () => {
		delete window.cf65BlocksConfig;
		performance.clearMeasures( MEASURE_NAME );
	} );

	it( 'misst nichts ohne Debug-Modus', () => {
		expect( measuredCss( 'abcd1234', MAP, ATTRS ) ).toBe(
			generateCss( 'abcd1234', MAP, ATTRS )
		);
		expect( performance.getEntriesByName( MEASURE_NAME ) ).toHaveLength(
			0
		);
	} );

	it( 'erfasst eine Messung im Debug-Modus', () => {
		window.cf65BlocksConfig = { debug: true };

		const css = measuredCss( 'abcd1234', MAP, ATTRS );

		expect( css ).toBe( '.cf65-abcd1234{color:#ff0000}' );
		const [ entry ] = performance.getEntriesByName( MEASURE_NAME );
		expect( entry.detail ).toEqual( {
			uniqueId: 'abcd1234',
			bytes: css.length,
		} );
	} );
} );
