/**
 * Blöcke Welle 1, Gruppe B: Icon, Icon mit Text, Icon-Liste, Icon-Button,
 * Social Buttons – Icons als Platzhalter gespeichert, SVG beim Rendern.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BASE_URL = process.env.WP_BASE_URL ?? 'http://localhost:8889';

/**
 * Alle Blöcke (inkl. verschachtelter) mit Gültigkeit.
 *
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
					uniqueId: block.attributes.uniqueId,
				},
				...flat( block.innerBlocks ),
			] );
		return flat( window.wp.data.select( 'core/block-editor' ).getBlocks() );
	} );

test.describe( 'Blöcke Gruppe B', () => {
	test( 'alle Icon-Blöcke im Frontend, gültig nach dem Neuladen', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/icon',
			attributes: {
				icon: 'heart',
				label: 'Favorit',
				color: '#ff0000',
				size: { desktop: '40px' },
			},
		} );
		await editor.insertBlock( {
			name: 'cf65/icon-label',
			attributes: { icon: 'mail', content: 'info@example.org' },
		} );
		await editor.insertBlock( {
			name: 'cf65/icon-list',
			attributes: { icon: 'check', iconColor: '#00aa00' },
			innerBlocks: [
				{
					name: 'cf65/icon-list-item',
					attributes: { content: 'Eins' },
				},
				{
					name: 'cf65/icon-list-item',
					attributes: { content: 'Zwei', icon: 'star' },
				},
			],
		} );
		await editor.insertBlock( {
			name: 'cf65/icon-button',
			attributes: {
				icon: 'arrow-right',
				label: 'Weiter',
				url: 'https://example.org/weiter',
			},
		} );
		await editor.insertBlock( {
			name: 'cf65/social-buttons',
			attributes: {
				brandColors: true,
				links: [
					{
						network: 'facebook',
						url: 'https://facebook.com/beispiel',
					},
					{ network: 'github', url: 'https://github.com/beispiel' },
					{ network: 'x', url: '' },
				],
			},
		} );
		await expect
			.poll( async () =>
				( await allBlocks( page ) )
					.filter( ( block ) => block.name !== 'cf65/icon-list-item' )
					.every( ( block ) =>
						/^[a-z0-9]{8}$/.test( block.uniqueId )
					)
			)
			.toBe( true );
		const postId = await editor.publishPost();

		const visitor = await page
			.context()
			.browser()
			.newContext( {
				baseURL: BASE_URL,
				storageState: { cookies: [], origins: [] },
			} );
		const front = await visitor.newPage();
		await front.goto( `/?p=${ postId }` );

		const icon = front.locator( '.cf65-icon .cf65-icon-slot' );
		await expect( icon ).toHaveAttribute( 'role', 'img' );
		await expect( icon ).toHaveAttribute( 'aria-label', 'Favorit' );
		await expect( icon.locator( 'svg.cf65-icon' ) ).toHaveAttribute(
			'aria-hidden',
			'true'
		);
		await expect( icon.locator( 'svg' ) ).toHaveCSS( 'width', '40px' );
		await expect( icon ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );

		await expect(
			front.locator( '.cf65-icon-label .cf65-icon-slot svg' )
		).toHaveCount( 1 );
		await expect( front.locator( '.cf65-icon-label__text' ) ).toHaveText(
			'info@example.org'
		);

		// Liste: Eintrag ohne Icon bekommt das Icon der Liste, der zweite sein eigenes.
		const items = front.locator( '.cf65-icon-list-item' );
		await expect( items ).toHaveCount( 2 );
		await expect( items.locator( 'svg' ) ).toHaveCount( 2 );
		const [ listIcon, ownIcon ] = await items
			.locator( 'svg' )
			.evaluateAll( ( svgs ) => svgs.map( ( svg ) => svg.innerHTML ) );
		expect( listIcon ).not.toBe( ownIcon );
		await expect( items.first().locator( '.cf65-icon-slot' ) ).toHaveCSS(
			'color',
			'rgb(0, 170, 0)'
		);

		const button = front.locator( '.cf65-icon-button__link' );
		await expect( button ).toHaveAttribute(
			'href',
			'https://example.org/weiter'
		);
		await expect( button ).toHaveAttribute( 'aria-label', 'Weiter' );
		await expect( button.locator( 'svg' ) ).toHaveCount( 1 );

		// Social: Eintrag ohne URL fehlt, Markenfarbe als Hintergrund.
		const social = front.locator( '.cf65-social-buttons__link' );
		await expect( social ).toHaveCount( 2 );
		await expect( social.first() ).toHaveAttribute(
			'aria-label',
			'Facebook'
		);
		await expect( social.first() ).toHaveAttribute( 'target', '_blank' );
		await expect( social.first() ).toHaveCSS(
			'background-color',
			'rgb(8, 102, 255)'
		);
		await expect( social.locator( 'svg' ) ).toHaveCount( 2 );
		await visitor.close();

		await admin.editPost( postId );
		const blocks = await allBlocks( page );
		expect( blocks.filter( ( block ) => ! block.isValid ) ).toEqual( [] );
		await expect(
			editor.canvas.locator( '.cf65-icon-list-item svg' )
		).toHaveCount( 2 );
	} );

	test( 'Icons werden nicht gespeichert, nur beim Ausgeben eingesetzt', async ( {
		requestUtils,
	} ) => {
		const post = await requestUtils.rest( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: {
				title: 'Icons kses',
				status: 'draft',
				content: `<!-- wp:cf65/icon {"uniqueId":"k1s2e3s4","icon":"star"} -->
<div class="wp-block-cf65-icon cf65-block cf65-icon cf65-k1s2e3s4"><span class="cf65-icon-slot" data-cf65-icon="star" aria-hidden="true"></span></div>
<!-- /wp:cf65/icon -->

<!-- wp:cf65/icon {"uniqueId":"k5s6e7s8","icon":"star"} -->
<div class="wp-block-cf65-icon cf65-block cf65-icon cf65-k5s6e7s8"><span class="cf65-icon-slot" data-cf65-icon="&quot;&gt;&lt;script&gt;" aria-hidden="true"></span></div>
<!-- /wp:cf65/icon -->`,
			},
		} );
		const saved = await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			params: { context: 'edit' },
		} );
		expect( saved.content.raw ).not.toContain( '<svg' );
		expect(
			saved.content.rendered.match( /<svg class="cf65-icon"/g )
		).toHaveLength( 1 );
		expect( saved.content.rendered ).not.toContain( '<script' );
		await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			method: 'DELETE',
			params: { force: true },
		} );
	} );
} );
