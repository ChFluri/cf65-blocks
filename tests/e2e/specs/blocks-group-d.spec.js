/**
 * Blöcke Welle 1, Gruppe D: Icon-Box, Bild-Box, Zahlen-Box, Preis,
 * Preis-Box.
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

const heading = ( content ) => ( {
	name: 'cf65/heading',
	attributes: { content, level: 3 },
} );

test.describe( 'Blöcke Gruppe D', () => {
	test( 'alle Boxen im Frontend, gültig nach dem Neuladen', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/icon-box',
			attributes: { layout: 'side' },
			innerBlocks: [
				{ name: 'cf65/icon', attributes: { icon: 'zap' } },
				heading( 'Schnell' ),
				{ name: 'cf65/text', attributes: { content: 'Kurz.' } },
			],
		} );
		await editor.insertBlock( {
			name: 'cf65/image-box',
			attributes: { overlayOpacity: '0.5', overlayOpacityHover: '0.2' },
			innerBlocks: [ heading( 'Projekt' ) ],
		} );
		await editor.insertBlock( {
			name: 'cf65/number-box',
			attributes: { number: "1'250+", countUp: true },
			innerBlocks: [ heading( 'Kunden' ) ],
		} );
		await editor.insertBlock( {
			name: 'cf65/pricing-box',
			attributes: { featured: true, badge: 'Empfohlen' },
			innerBlocks: [
				heading( 'Pro' ),
				{
					name: 'cf65/price',
					attributes: {
						amount: '49',
						period: '/ Monat',
						oldAmount: '69',
					},
				},
				{
					name: 'cf65/price',
					attributes: {
						amount: '19.90',
						currency: '€',
						currencyAfter: true,
					},
				},
			],
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
				viewport: { width: 1280, height: 900 },
				storageState: { cookies: [], origins: [] },
			} );
		const front = await visitor.newPage();
		await front.goto( `/?p=${ postId }` );

		// Icon-Box: Icon links neben dem Titel.
		const iconBox = front.locator( '.cf65-icon-box' );
		await expect( iconBox ).toHaveClass( /is-layout-side/ );
		await expect( iconBox.locator( '.cf65-icon svg' ) ).toHaveCount( 1 );
		const [ iconRect, headingRect ] = await Promise.all( [
			iconBox.locator( ':scope > .cf65-icon' ).boundingBox(),
			iconBox.locator( ':scope > .cf65-heading' ).boundingBox(),
		] );
		expect( headingRect.x ).toBeGreaterThanOrEqual(
			iconRect.x + iconRect.width
		);
		expect( headingRect.y ).toBeLessThan( iconRect.y + iconRect.height );

		// Bild-Box: Overlay-Deckkraft normal und beim Überfahren.
		const imageBox = front.locator( '.cf65-image-box' );
		const overlayOpacity = () =>
			imageBox.evaluate(
				( el ) => window.getComputedStyle( el, '::before' ).opacity
			);
		expect( await overlayOpacity() ).toBe( '0.5' );
		await imageBox.hover();
		await expect.poll( overlayOpacity ).toBe( '0.2' );

		// Zahlen-Box: zählt hoch und endet im Originalformat.
		const number = front.locator( '.cf65-number-box__number' );
		await expect( number ).toHaveAttribute( 'data-cf65-count-up', '' );
		await number.scrollIntoViewIfNeeded();
		// WordPress (wptexturize) macht aus ' im Frontend ’ – der Zähler
		// übernimmt das Zeichen als Tausendertrennzeichen.
		await expect( number ).toHaveText( '1’250+', { timeout: 5000 } );

		// Preis-Box: Badge, Hervorhebung, Preise in der richtigen Reihenfolge.
		const pricing = front.locator( '.cf65-pricing-box' );
		await expect( pricing ).toHaveClass( /is-featured/ );
		await expect(
			pricing.locator( '.cf65-pricing-box__badge' )
		).toHaveText( 'Empfohlen' );
		await expect( pricing ).toHaveCSS( 'border-top-width', '2px' );
		const prices = pricing.locator( '.cf65-price' );
		await expect(
			prices.first().locator( 'del.cf65-price__old' )
		).toHaveText( '69' );
		await expect( prices.first() ).toHaveText( '69CHF49/ Monat' );
		await expect( prices.nth( 1 ) ).toHaveText( '19.90€' );
		await visitor.close();

		await admin.editPost( postId );
		await expect
			.poll( async () => ( await allBlocks( page ) ).length )
			.toBeGreaterThan( 10 );
		const blocks = await allBlocks( page );
		expect( blocks.filter( ( block ) => ! block.isValid ) ).toEqual( [] );
	} );

	test( 'Hochzählen entfällt bei „Bewegung reduzieren“', async ( {
		requestUtils,
		browser,
	} ) => {
		const post = await requestUtils.rest( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: {
				title: 'Zahl ohne Bewegung',
				status: 'publish',
				content: `<!-- wp:cf65/number-box {"uniqueId":"r3d0c001","number":"500","countUp":true} -->
<div class="wp-block-cf65-number-box cf65-block cf65-number-box cf65-r3d0c001"><p class="cf65-number-box__number" data-cf65-count-up="">500</p></div>
<!-- /wp:cf65/number-box -->`,
			},
		} );
		const visitor = await browser.newContext( {
			baseURL: BASE_URL,
			reducedMotion: 'reduce',
			storageState: { cookies: [], origins: [] },
		} );
		const front = await visitor.newPage();
		await front.goto( `/?p=${ post.id }` );
		const number = front.locator( '.cf65-number-box__number' );
		await expect( number ).toHaveText( '500' );
		// Bleibt unverändert (kein Zurücksetzen auf 0).
		await front.waitForTimeout( 300 );
		await expect( number ).toHaveText( '500' );
		await visitor.close();
		await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			method: 'DELETE',
			params: { force: true },
		} );
	} );

	test( 'neue Blöcke starten mit ihrer Vorlage', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		for ( const name of [
			'cf65/icon-box',
			'cf65/image-box',
			'cf65/number-box',
			'cf65/pricing-box',
		] ) {
			await editor.insertBlock( { name } );
		}
		await expect
			.poll( () =>
				page.evaluate( () =>
					window.wp.data
						.select( 'core/block-editor' )
						.getBlocks()
						.map( ( block ) => [
							block.name,
							block.innerBlocks.map( ( inner ) => inner.name ),
						] )
				)
			)
			.toEqual( [
				[
					'cf65/icon-box',
					[ 'cf65/icon', 'cf65/heading', 'cf65/text' ],
				],
				[ 'cf65/image-box', [ 'cf65/heading', 'cf65/text' ] ],
				[ 'cf65/number-box', [ 'cf65/heading', 'cf65/text' ] ],
				[
					'cf65/pricing-box',
					[
						'cf65/heading',
						'cf65/price',
						'cf65/text',
						'cf65/icon-list',
						'cf65/button',
					],
				],
			] );
	} );
} );
