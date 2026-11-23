/**
 * Smoke-Tests: Plugin ist aktiv, Editor lädt ohne Fehler,
 * Block-Kategorie ist registriert.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'cf65 Blocks – Smoke', () => {
	test( 'Plugin ist aktiv', async ( { requestUtils } ) => {
		const plugin = await requestUtils.rest( {
			path: '/wp/v2/plugins/cf65-blocks/cf65-blocks',
		} );
		expect( plugin.status ).toBe( 'active' );
	} );

	test( 'Editor lädt mit cf65-Kategorie und ohne Konsolenfehler', async ( {
		admin,
		page,
	} ) => {
		const errors = [];
		page.on( 'console', ( msg ) => {
			if ( msg.type() === 'error' ) {
				errors.push( msg.text() );
			}
		} );

		await admin.createNewPost();

		const categories = await page.evaluate( () =>
			window.wp.blocks.getCategories().map( ( c ) => c.slug )
		);
		expect( categories ).toContain( 'cf65-blocks' );
		expect( errors ).toEqual( [] );
	} );
} );
