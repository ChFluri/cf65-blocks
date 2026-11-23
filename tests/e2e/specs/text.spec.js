/**
 * Text-Block: Editor → Speichern → Frontend-CSS → erneutes Laden ohne Blockfehler;
 * Umwandlung aus core/paragraph.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const blocks = ( page ) =>
	page.evaluate( () =>
		window.wp.data
			.select( 'core/block-editor' )
			.getBlocks()
			.map( ( { name, isValid, attributes } ) => ( {
				name,
				isValid,
				uniqueId: attributes.uniqueId ?? '',
				content: String( attributes.content ?? '' ),
			} ) )
	);

test.describe( 'cf65/text', () => {
	test( 'CSS aus Attributen wirkt im Frontend, responsive', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/text',
			attributes: {
				content: 'Hallo Text',
				textColor: '#0000ff',
				textAlign: { desktop: 'right', mobile: 'center' },
				fontSize: { desktop: '22px', mobile: '14px' },
			},
		} );

		await expect
			.poll( async () => ( await blocks( page ) )[ 0 ]?.uniqueId )
			.toMatch( /^[a-z0-9]{8}$/ );

		const postId = await editor.publishPost();

		await page.setViewportSize( { width: 1280, height: 800 } );
		await page.goto( `/?p=${ postId }` );
		const text = page.locator( 'p.cf65-text' );
		await expect( text ).toHaveText( 'Hallo Text' );
		await expect( text ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );
		await expect( text ).toHaveCSS( 'font-size', '22px' );
		await expect( text ).toHaveCSS( 'text-align', 'right' );

		await page.setViewportSize( { width: 375, height: 800 } );
		await expect( text ).toHaveCSS( 'font-size', '14px' );
		await expect( text ).toHaveCSS( 'text-align', 'center' );

		await admin.editPost( postId );
		expect(
			( await blocks( page ) ).every( ( block ) => block.isValid )
		).toBe( true );
	} );

	test( 'Absatz lässt sich in cf65/text umwandeln', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'core/paragraph',
			attributes: { content: 'Aus <strong>Absatz</strong>' },
		} );
		await editor.transformBlockTo( 'cf65/text' );

		await expect
			.poll( async () => ( await blocks( page ) )[ 0 ] )
			.toMatchObject( {
				name: 'cf65/text',
				isValid: true,
				content: 'Aus <strong>Absatz</strong>',
				uniqueId: expect.stringMatching( /^[a-z0-9]{8}$/ ),
			} );
	} );
} );
