/**
 * Blöcke Welle 1, Gruppe C: Container mit Innenblöcken – Karte, Hero,
 * Feature, Feature-Raster, Call to Action, Hinweis.
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
					content: block.attributes.content,
				},
				...flat( block.innerBlocks ),
			] );
		return flat( window.wp.data.select( 'core/block-editor' ).getBlocks() );
	} );

const text = ( content ) => ( {
	name: 'cf65/text',
	attributes: { content },
} );

test.describe( 'Blöcke Gruppe C', () => {
	test( 'alle Container im Frontend, gültig nach dem Neuladen', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'cf65/hero',
			attributes: {
				minHeight: { desktop: '500px' },
				overlayColor: '#000000',
				overlayOpacity: '0.6',
			},
			innerBlocks: [
				{
					name: 'cf65/heading',
					attributes: { content: 'Willkommen', level: 1 },
				},
			],
		} );
		await editor.insertBlock( {
			name: 'cf65/feature',
			attributes: { reversed: true },
			innerBlocks: [
				{ name: 'cf65/column', innerBlocks: [ text( 'Bildspalte' ) ] },
				{
					name: 'cf65/column',
					innerBlocks: [
						text( 'Eins' ),
						text( 'Zwei' ),
						text( 'Drei' ),
						text( 'Vier (mehr als die Vorlage)' ),
					],
				},
			],
		} );
		await editor.insertBlock( {
			name: 'cf65/feature-grid',
			attributes: { columns: { desktop: '4' } },
			innerBlocks: [ 'A', 'B', 'C', 'D', 'E' ].map( ( label ) => ( {
				name: 'cf65/card',
				innerBlocks: [ text( `Karte ${ label }` ) ],
			} ) ),
		} );
		await editor.insertBlock( {
			name: 'cf65/call-to-action',
			attributes: { layout: 'inline' },
			innerBlocks: [
				{
					name: 'cf65/heading',
					attributes: { content: 'Bereit?' },
				},
				text( 'Jetzt starten.' ),
				{
					name: 'cf65/button',
					attributes: {
						content: 'Los',
						url: 'https://example.org/los',
					},
				},
			],
		} );
		await editor.insertBlock( {
			name: 'cf65/notification',
			attributes: {
				type: 'warning',
				icon: 'triangle-exclamation-point',
				dismissible: true,
			},
			innerBlocks: [ text( 'Wartung am Montag.' ) ],
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

		// Hero: Mindesthöhe, Overlay als ::before mit Farbe und Deckkraft.
		const hero = front.locator( 'section.cf65-hero' );
		await expect( hero ).toHaveCSS( 'min-height', '500px' );
		const overlay = await hero.evaluate( ( el ) => {
			const style = window.getComputedStyle( el, '::before' );
			return [ style.backgroundColor, style.opacity ];
		} );
		expect( overlay ).toEqual( [ 'rgb(0, 0, 0)', '0.6' ] );
		await expect( hero.locator( '.cf65-hero__inner h1' ) ).toHaveText(
			'Willkommen'
		);

		// Feature: Bild rechts, Inhalt über die Vorlage hinaus erhalten.
		const feature = front.locator( '.cf65-feature' );
		await expect( feature ).toHaveClass( /is-reversed/ );
		await expect( feature ).toHaveCSS( 'flex-direction', 'row-reverse' );
		await expect( feature.locator( ':scope > .cf65-column' ) ).toHaveCount(
			2
		);
		await expect( feature.locator( '.cf65-text' ) ).toHaveCount( 5 );

		// Raster: 4 Spalten auf Desktop, Karten gleich hoch.
		const grid = front.locator( '.cf65-feature-grid' );
		const columns = await grid.evaluate(
			( el ) =>
				window.getComputedStyle( el ).gridTemplateColumns.split( ' ' )
					.length
		);
		expect( columns ).toBe( 4 );
		await expect( grid.locator( ':scope > .cf65-card' ) ).toHaveCount( 5 );
		await expect( grid.locator( '.cf65-card' ).first() ).toHaveCSS(
			'flex-direction',
			'column'
		);

		// Call to Action: Button rechts in eigener Rasterspalte.
		const cta = front.locator( '.cf65-call-to-action' );
		await expect( cta ).toHaveCSS( 'display', 'grid' );
		const [ headingBox, buttonBox ] = await Promise.all( [
			cta.locator( '.cf65-heading' ).boundingBox(),
			cta.locator( '.cf65-button' ).boundingBox(),
		] );
		expect( buttonBox.x ).toBeGreaterThan(
			headingBox.x + headingBox.width - 1
		);

		// Hinweis: Icon eingesetzt, Schliessen blendet aus.
		const note = front.locator( '.cf65-notification' );
		await expect( note ).toHaveAttribute( 'role', 'note' );
		await expect( note ).toHaveClass( /is-type-warning/ );
		await expect( note.locator( '.cf65-icon-slot svg' ) ).toHaveCount( 2 );
		const close = note.locator( '.cf65-notification__close' );
		await expect( close ).toHaveAttribute( 'aria-label', 'Schliessen' );
		await close.click();
		await expect( note ).toBeHidden();
		await visitor.close();

		// Neu laden: alles gültig, Feature-Inhalt nicht auf die Vorlage gekürzt.
		await admin.editPost( postId );
		await expect
			.poll( async () =>
				( await allBlocks( page ) ).filter(
					( block ) => block.name === 'cf65/text'
				)
			)
			.toHaveLength( 5 + 5 + 1 + 1 );
		const blocks = await allBlocks( page );
		expect( blocks.filter( ( block ) => ! block.isValid ) ).toEqual( [] );
		expect(
			blocks.some(
				( block ) => block.content === 'Vier (mehr als die Vorlage)'
			)
		).toBe( true );
	} );

	test( 'neue Blöcke starten mit ihrer Vorlage', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		for ( const name of [
			'cf65/card',
			'cf65/hero',
			'cf65/feature',
			'cf65/feature-grid',
			'cf65/call-to-action',
			'cf65/notification',
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
					'cf65/card',
					[
						'cf65/image',
						'cf65/heading',
						'cf65/text',
						'cf65/button',
					],
				],
				[
					'cf65/hero',
					[
						'cf65/subtitle',
						'cf65/heading',
						'cf65/text',
						'cf65/button',
					],
				],
				[ 'cf65/feature', [ 'cf65/column', 'cf65/column' ] ],
				[
					'cf65/feature-grid',
					[ 'cf65/card', 'cf65/card', 'cf65/card' ],
				],
				[
					'cf65/call-to-action',
					[ 'cf65/heading', 'cf65/text', 'cf65/button' ],
				],
				[ 'cf65/notification', [ 'cf65/text' ] ],
			] );

		// Feature: Bild links, Titel/Text/Button rechts.
		const featureColumns = await page.evaluate( () =>
			window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.find( ( block ) => block.name === 'cf65/feature' )
				.innerBlocks.map( ( column ) =>
					column.innerBlocks.map( ( inner ) => inner.name )
				)
		);
		expect( featureColumns ).toEqual( [
			[ 'cf65/image' ],
			[ 'cf65/heading', 'cf65/text', 'cf65/button' ],
		] );
	} );
} );
