/**
 * Blöcke Welle 1, Gruppe A: Abstandhalter, Trennlinie, Trenner, Untertitel,
 * Zitat – Editor → Speichern → Frontend, gültig nach dem Neuladen.
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
	page.evaluate( () =>
		window.wp.data
			.select( 'core/block-editor' )
			.getBlocks()
			.map( ( block ) => ( {
				name: block.name,
				isValid: block.isValid,
				uniqueId: block.attributes.uniqueId ?? '',
			} ) )
	);

test.describe( 'Blöcke Gruppe A', () => {
	test( 'alle fünf Blöcke im Frontend, gültig nach dem Neuladen', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/subtitle',
			attributes: {
				content: 'Dachzeile',
				textColor: '#ff0000',
				letterSpacing: '4px',
			},
		} );
		await editor.insertBlock( {
			name: 'cf65/spacer',
			attributes: { height: { desktop: '120px', mobile: '30px' } },
		} );
		await editor.insertBlock( {
			name: 'cf65/divider',
			attributes: {
				lineStyle: 'dashed',
				thickness: '3px',
				color: '#00ff00',
				width: { desktop: '50%' },
			},
		} );
		await editor.insertBlock( {
			name: 'cf65/separator',
			attributes: {
				design: 'triangle',
				color: '#0000ff',
				height: { desktop: '60px' },
				flipY: true,
			},
		} );
		await editor.insertBlock( {
			name: 'cf65/blockquote',
			attributes: {
				content: 'Weniger ist mehr.',
				citation: 'Mies van der Rohe',
				accentColor: '#ff00ff',
				accentWidth: '6px',
				citationColor: '#00ffff',
			},
		} );
		await expect
			.poll( async () =>
				( await allBlocks( page ) ).every( ( block ) =>
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

		const subtitle = front.locator( '.cf65-subtitle' );
		await expect( subtitle ).toHaveText( 'Dachzeile' );
		await expect( subtitle ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( subtitle ).toHaveCSS( 'text-transform', 'uppercase' );
		await expect( subtitle ).toHaveCSS( 'letter-spacing', '4px' );

		const spacer = front.locator( '.cf65-spacer' );
		await expect( spacer ).toHaveAttribute( 'aria-hidden', 'true' );
		await expect( spacer ).toHaveCSS( 'height', '120px' );

		const divider = front.locator( '.cf65-divider' );
		await expect( divider ).toHaveAttribute( 'role', 'separator' );
		await expect( divider ).toHaveCSS( 'border-top-style', 'dashed' );
		await expect( divider ).toHaveCSS( 'border-top-width', '3px' );
		await expect( divider ).toHaveCSS(
			'border-top-color',
			'rgb(0, 255, 0)'
		);

		const separator = front.locator( '.cf65-separator' );
		await expect( separator ).toHaveClass( /cf65-separator--flip-y/ );
		await expect( separator ).toHaveCSS( 'height', '60px' );
		await expect( separator.locator( 'svg path' ) ).toHaveAttribute(
			'd',
			'M0 100L500 0L1000 100Z'
		);
		await expect( separator.locator( 'svg' ) ).toHaveCSS(
			'fill',
			'rgb(0, 0, 255)'
		);

		const quote = front.locator( 'blockquote.cf65-blockquote' );
		await expect( quote.locator( '.cf65-blockquote__text' ) ).toHaveText(
			'Weniger ist mehr.'
		);
		await expect( quote.locator( 'cite' ) ).toHaveCSS(
			'color',
			'rgb(0, 255, 255)'
		);
		await expect( quote ).toHaveCSS(
			'border-left-color',
			'rgb(255, 0, 255)'
		);
		await expect( quote ).toHaveCSS( 'border-left-width', '6px' );

		await front.setViewportSize( { width: 600, height: 800 } );
		await expect( spacer ).toHaveCSS( 'height', '30px' );
		await visitor.close();

		await admin.editPost( postId );
		const blocks = await allBlocks( page );
		expect( blocks ).toHaveLength( 5 );
		expect( blocks.filter( ( block ) => ! block.isValid ) ).toEqual( [] );
		await expect(
			editor.canvas.locator( '.cf65-separator svg path' )
		).toHaveAttribute( 'd', 'M0 100L500 0L1000 100Z' );
	} );

	test( 'Trenner bleibt gültig, wenn ein Mitarbeiter speichert (kses)', async ( {
		requestUtils,
	} ) => {
		// Gespeichertes Markup enthält kein SVG – kses kann nichts entfernen.
		const post = await requestUtils.rest( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: {
				title: 'Trenner kses',
				status: 'draft',
				content: `<!-- wp:cf65/separator {"uniqueId":"k5e5s5aa","design":"curve"} -->
<div class="wp-block-cf65-separator cf65-block cf65-separator cf65-k5e5s5aa" aria-hidden="true"></div>
<!-- /wp:cf65/separator -->`,
			},
		} );
		const saved = await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			params: { context: 'edit' },
		} );
		expect( saved.content.raw ).not.toContain( '<svg' );
		expect( saved.content.rendered ).toContain(
			'<svg viewBox="0 0 1000 100"'
		);
		await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			method: 'DELETE',
			params: { force: true },
		} );
	} );
} );
