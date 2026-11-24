import { describe, expect, it } from 'vitest';

import { generateCss } from '../../../styles/generator';
import { blockPanels, panelTabs, PANELS, withPanels } from '../definitions';

const METADATA = {
	name: 'cf65/test',
	attributes: {
		uniqueId: { type: 'string' },
		styleBorderRadius: { type: 'string', default: '4px' },
	},
	supports: {
		cf65: {
			panels: [ 'margin', 'border', 'backgroundImage', 'unbekannt' ],
			styles: [ { attr: 'textColor', property: 'color', type: 'color' } ],
		},
	},
};

describe( 'withPanels', () => {
	it( 'ergänzt Attribute, Styles und Bindungen wie Panels::apply()', () => {
		const result = withPanels( METADATA );

		expect( result.attributes ).toHaveProperty( 'styleMarginTop' );
		expect( result.attributes ).toHaveProperty( 'styleBackgroundImage' );
		expect( result.attributes ).not.toHaveProperty( 'styleShadow' );
		expect( result.attributes.styleBorderRadius.default ).toBe( '4px' );

		const attrs = result.supports.cf65.styles.map(
			( entry ) => entry.attr
		);
		expect( attrs[ 0 ] ).toBe( 'textColor' );
		expect( attrs ).toEqual(
			expect.arrayContaining( [
				'styleMarginBottom',
				'styleBorderColorHover',
				'styleBackgroundRepeat',
			] )
		);
		expect( result.supports.cf65.dynamic.styleBackgroundImage ).toEqual( {
			kind: 'image',
			style: 'background-image',
		} );
	} );

	it( 'lässt Blöcke ohne Panels unverändert', () => {
		const plain = { name: 'cf65/plain', supports: { cf65: {} } };
		expect( withPanels( plain ) ).toBe( plain );
	} );

	it( 'kennt Tabs und gültige Panels', () => {
		expect( blockPanels( METADATA ) ).toEqual( [
			'margin',
			'border',
			'backgroundImage',
		] );
		expect( panelTabs( METADATA ) ).toEqual( {
			layout: true,
			style: true,
		} );
		expect( Object.keys( PANELS ) ).not.toContain( '$comment' );
	} );

	it( 'erzeugt dasselbe CSS wie der PHP-Test (PanelsTest)', () => {
		const map = withPanels( {
			...METADATA,
			supports: {
				cf65: {
					panels: [
						'margin',
						'padding',
						'border',
						'shadow',
						'backgroundColor',
						'backgroundImage',
					],
					styles: [],
				},
			},
		} ).supports.cf65.styles;

		expect(
			generateCss( 'abcd1234', map, {
				styleMarginTop: { desktop: '2rem', mobile: '1rem' },
				styleBorderWidth: '1px',
				styleBorderStyle: 'solid',
				styleBorderColorHover: '#ff0000',
				styleShadow: '0 4px 12px rgba(0,0,0,.15)',
				styleBackgroundImage: {
					url: '/wp-content/uploads/a.jpg',
					id: 3,
				},
				styleBackgroundPosition: 'center center',
			} )
		).toBe(
			'.cf65-abcd1234.cf65-abcd1234.cf65-abcd1234{margin-top:2rem}.cf65-abcd1234{border-width:1px;border-style:solid;box-shadow:0 4px 12px rgba(0,0,0,.15);background-image:url(/wp-content/uploads/a.jpg);background-position:center center}' +
				'.cf65-abcd1234:hover{border-color:#ff0000}' +
				'@media (max-width:767px){.cf65-abcd1234.cf65-abcd1234.cf65-abcd1234{margin-top:1rem}}'
		);
	} );
} );
