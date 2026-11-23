/**
 * Heading-Block: Editor → Speichern → Frontend-CSS → erneutes Laden ohne Blockfehler.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'cf65/heading', () => {
	test( 'CSS aus Attributen wirkt im Frontend, responsive', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/heading',
			attributes: {
				content: 'Hallo cf65',
				level: 3,
				textColor: '#ff0000',
				fontSize: { desktop: '40px', mobile: '20px' },
			},
		} );

		// uniqueId wird im Editor vergeben.
		await expect
			.poll( async () =>
				page.evaluate(
					() =>
						window.wp.data
							.select( 'core/block-editor' )
							.getBlocks()[ 0 ]?.attributes?.uniqueId ?? ''
				)
			)
			.toMatch( /^[a-z0-9]{8}$/ );

		const postId = await editor.publishPost();

		await page.setViewportSize( { width: 1280, height: 800 } );
		await page.goto( `/?p=${ postId }` );
		const heading = page.locator( 'h3.cf65-heading' );
		await expect( heading ).toHaveText( 'Hallo cf65' );
		await expect( heading ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( heading ).toHaveCSS( 'font-size', '40px' );

		await page.setViewportSize( { width: 375, height: 800 } );
		await expect( heading ).toHaveCSS( 'font-size', '20px' );

		// Erneut im Editor öffnen: Block muss gültig sein.
		await admin.editPost( postId );
		const valid = await page.evaluate( () =>
			window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.every( ( block ) => block.isValid )
		);
		expect( valid ).toBe( true );
	} );

	test( 'manipulierte Attribute erzeugen kein CSS', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/heading',
			attributes: {
				content: 'Payload',
				textColor: 'red}</style><script>window.__cf65xss=1</script>',
			},
		} );
		const postId = await editor.publishPost();

		await page.goto( `/?p=${ postId }` );
		await expect( page.locator( '.cf65-heading' ) ).toHaveText( 'Payload' );
		expect( await page.evaluate( () => window.__cf65xss ) ).toBeUndefined();
		const inline = await page
			.locator( '#cf65-blocks-dynamic-inline-css' )
			.count();
		expect( inline ).toBe( 0 );
	} );
} );
