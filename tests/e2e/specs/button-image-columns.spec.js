/**
 * Pilotblöcke Button, Bild, Spalten: Editor → Speichern → Frontend.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Alle Blöcke (inkl. verschachtelter) mit Gültigkeit und uniqueId.
 * @param {import('@playwright/test').Page} page Editor-Seite.
 * @return {Promise<Array<Object>>} Blöcke.
 */
const allBlocks = ( page ) =>
	page.evaluate( () => {
		const flat = ( list ) =>
			list.flatMap( ( block ) => [
				{
					name: block.name,
					isValid: block.isValid,
					uniqueId: block.attributes.uniqueId ?? '',
				},
				...flat( block.innerBlocks ),
			] );
		return flat( window.wp.data.select( 'core/block-editor' ).getBlocks() );
	} );

const waitForIds = ( page, count ) =>
	expect
		.poll(
			async () =>
				( await allBlocks( page ) ).filter( ( b ) =>
					/^[a-z0-9]{8}$/.test( b.uniqueId )
				).length
		)
		.toBe( count );

const expectValidAfterReload = async ( admin, page, postId ) => {
	await admin.editPost( postId );
	const blocks = await allBlocks( page );
	expect( blocks.length ).toBeGreaterThan( 0 );
	expect( blocks.filter( ( b ) => ! b.isValid ) ).toEqual( [] );
};

test.describe( 'cf65/button', () => {
	test( 'Link, Farben und Hover im Frontend', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/button',
			attributes: {
				content: 'Los geht’s',
				url: 'https://example.org/ziel',
				opensInNewTab: true,
				textColor: '#ffffff',
				backgroundColor: '#ff0000',
				backgroundColorHover: '#0000ff',
				paddingInline: { desktop: '40px' },
			},
		} );
		await waitForIds( page, 1 );
		const postId = await editor.publishPost();

		await page.goto( `/?p=${ postId }` );
		const link = page.locator( '.cf65-button .cf65-button__link' );
		await expect( link ).toHaveText( 'Los geht’s' );
		await expect( link ).toHaveAttribute(
			'href',
			'https://example.org/ziel'
		);
		await expect( link ).toHaveAttribute( 'target', '_blank' );
		await expect( link ).toHaveAttribute( 'rel', /noopener/ );
		await expect( link ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
		await expect( link ).toHaveCSS( 'padding-left', '40px' );

		await link.hover();
		await expect( link ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );

		await expectValidAfterReload( admin, page, postId );
	} );

	test( 'javascript:-URL wird nicht ausgegeben', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/button',
			attributes: { content: 'Payload', url: 'javascript:alert(1)' },
		} );
		const postId = await editor.publishPost();

		await page.goto( `/?p=${ postId }` );
		const link = page.locator( '.cf65-button__link' );
		await expect( link ).toHaveText( 'Payload' );
		await expect( link ).not.toHaveAttribute( 'href', /.*/ );
	} );
} );

test.describe( 'cf65/image', () => {
	test( 'Bild mit responsiver Breite und Bildunterschrift', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/image',
			attributes: {
				url: '/wp-includes/images/w-logo-blue.png',
				alt: 'WordPress-Logo',
				caption: 'Logo',
				imageWidth: { desktop: '200px', mobile: '100px' },
				borderRadius: '8px',
			},
		} );
		await waitForIds( page, 1 );
		const postId = await editor.publishPost();

		await page.setViewportSize( { width: 1280, height: 800 } );
		await page.goto( `/?p=${ postId }` );
		const img = page.locator( 'figure.cf65-image img' );
		await expect( img ).toHaveAttribute( 'alt', 'WordPress-Logo' );
		await expect( img ).toHaveCSS( 'width', '200px' );
		await expect( img ).toHaveCSS( 'border-top-left-radius', '8px' );
		await expect(
			page.locator( 'figure.cf65-image .cf65-image__caption' )
		).toHaveText( 'Logo' );

		await page.setViewportSize( { width: 375, height: 800 } );
		await expect( img ).toHaveCSS( 'width', '100px' );

		await expectValidAfterReload( admin, page, postId );
	} );
} );

test.describe( 'cf65/columns', () => {
	test( 'Spalten nebeneinander, mobil gestapelt, Breite pro Spalte', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/columns',
			attributes: { gap: { desktop: '0px' } },
			innerBlocks: [
				{
					name: 'cf65/column',
					attributes: { width: { desktop: '25%' } },
					innerBlocks: [
						{ name: 'cf65/text', attributes: { content: 'A' } },
					],
				},
				{
					name: 'cf65/column',
					innerBlocks: [
						{ name: 'cf65/text', attributes: { content: 'B' } },
					],
				},
			],
		} );
		await waitForIds( page, 5 );
		const postId = await editor.publishPost();

		await page.setViewportSize( { width: 1280, height: 800 } );
		await page.goto( `/?p=${ postId }` );
		const container = page.locator( '.cf65-columns' );
		const [ first, second ] = [
			page.locator( '.cf65-column' ).nth( 0 ),
			page.locator( '.cf65-column' ).nth( 1 ),
		];
		await expect( first ).toHaveText( 'A' );

		const box = await container.boundingBox();
		const a = await first.boundingBox();
		const b = await second.boundingBox();
		// Nebeneinander, erste Spalte 25 %, zweite füllt den Rest.
		expect( Math.abs( a.y - b.y ) ).toBeLessThan( 2 );
		expect( Math.abs( a.width - box.width * 0.25 ) ).toBeLessThan( 2 );
		expect( Math.abs( b.width - box.width * 0.75 ) ).toBeLessThan( 2 );

		// Mobil: gestapelt, volle Breite.
		await page.setViewportSize( { width: 375, height: 800 } );
		const boxMobile = await container.boundingBox();
		const aMobile = await first.boundingBox();
		const bMobile = await second.boundingBox();
		expect( bMobile.y ).toBeGreaterThanOrEqual(
			aMobile.y + aMobile.height - 1
		);
		expect( Math.abs( aMobile.width - boxMobile.width ) ).toBeLessThan( 2 );

		await expectValidAfterReload( admin, page, postId );
	} );
} );
