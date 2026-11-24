/**
 * Gemeinsame Style-Panels (Abstände, Rahmen, Schatten, Hintergrund) und
 * dynamisches Hintergrundbild.
 */
const { writeFileSync } = require( 'node:fs' );
const { tmpdir } = require( 'node:os' );
const { join } = require( 'node:path' );

const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

// 1×1-PNG.
const PNG =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const created = [];

/**
 * @param {Object} requestUtils Request-Utils.
 * @param {Object} data         Beitragsdaten.
 * @return {Promise<Object>} Beitrag.
 */
const createPost = async ( requestUtils, data ) => {
	const post = await requestUtils.rest( {
		path: '/wp/v2/posts',
		method: 'POST',
		data: { status: 'publish', ...data },
	} );
	created.push( post.id );
	return post;
};

/**
 * @param {string} id    uniqueId.
 * @param {Object} attrs Weitere Attribute.
 * @return {string} Markup eines Text-Blocks.
 */
const textBlock = ( id, attrs ) =>
	`<!-- wp:cf65/text ${ JSON.stringify( {
		uniqueId: id,
		content: 'Panel',
		...attrs,
	} ) } -->
<p class="wp-block-cf65-text cf65-block cf65-text cf65-${ id }">Panel</p>
<!-- /wp:cf65/text -->`;

/**
 * @param {string} id    uniqueId.
 * @param {Object} attrs Weitere Attribute.
 * @return {string} Markup eines Spalten-Blocks mit einer leeren Spalte.
 */
const columnsBlock = ( id, attrs ) =>
	`<!-- wp:cf65/columns ${ JSON.stringify( {
		uniqueId: id,
		...attrs,
	} ) } -->
<div class="wp-block-cf65-columns cf65-block cf65-columns cf65-${ id }"><!-- wp:cf65/column {"uniqueId":"${ id }c1"} -->
<div class="wp-block-cf65-column cf65-block cf65-column cf65-${ id }c1"></div>
<!-- /wp:cf65/column --></div>
<!-- /wp:cf65/columns -->`;

test.describe( 'Style-Panels', () => {
	let media;

	test.beforeAll( async ( { requestUtils } ) => {
		const file = join( tmpdir(), 'cf65-panels.png' );
		writeFileSync( file, Buffer.from( PNG, 'base64' ) );
		media = await requestUtils.uploadMedia( file );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of created.splice( 0 ) ) {
			await requestUtils.rest( {
				path: `/wp/v2/posts/${ id }`,
				method: 'DELETE',
				params: { force: true },
			} );
		}
		if ( media ) {
			await requestUtils.deleteMedia( media.id );
		}
	} );

	test( 'Abstände, Rahmen, Schatten und Hintergrund im Frontend', async ( {
		page,
		requestUtils,
	} ) => {
		const post = await createPost( requestUtils, {
			title: 'Panels',
			content: textBlock( 'p4n3l5aa', {
				styleMarginTop: { desktop: '40px', mobile: '10px' },
				stylePaddingBlock: { desktop: '12px' },
				styleBorderWidth: '3px',
				styleBorderStyle: 'dashed',
				styleBorderColor: '#ff0000',
				styleBorderRadius: '6px',
				styleShadow: '0 4px 12px rgba(0,0,0,.15)',
				styleBackgroundColor: '#00ff00',
				styleBackgroundColorHover: '#0000ff',
				styleBackgroundImage: { url: media.source_url, id: media.id },
				styleBackgroundSize: 'cover',
			} ),
		} );

		await page.goto( post.link );
		const block = page.locator( '.cf65-p4n3l5aa' );
		await expect( block ).toHaveCSS( 'margin-top', '40px' );
		await expect( block ).toHaveCSS( 'padding-top', '12px' );
		await expect( block ).toHaveCSS( 'border-top-width', '3px' );
		await expect( block ).toHaveCSS( 'border-top-style', 'dashed' );
		await expect( block ).toHaveCSS( 'border-top-color', 'rgb(255, 0, 0)' );
		await expect( block ).toHaveCSS( 'border-top-left-radius', '6px' );
		await expect( block ).toHaveCSS( 'box-shadow', /12px/ );
		await expect( block ).toHaveCSS( 'background-color', 'rgb(0, 255, 0)' );
		await expect( block ).toHaveCSS(
			'background-image',
			`url("${ media.source_url }")`
		);
		await expect( block ).toHaveCSS( 'background-size', 'cover' );

		await block.hover();
		await expect( block ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );

		await page.setViewportSize( { width: 600, height: 800 } );
		await expect( block ).toHaveCSS( 'margin-top', '10px' );
	} );

	test( 'Dynamisches Hintergrundbild mit statischem Fallback', async ( {
		page,
		requestUtils,
	} ) => {
		const attrs = {
			styleBackgroundImage: {
				url: '/wp-includes/images/w-logo-blue.png',
			},
			dynamic: {
				styleBackgroundImage: {
					source: 'current-post',
					provider: 'core',
					field: 'featured_image',
				},
			},
		};
		const withImage = await createPost( requestUtils, {
			title: 'Hero mit Bild',
			content: columnsBlock( 'h3r0aaaa', attrs ),
			featured_media: media.id,
		} );
		const withoutImage = await createPost( requestUtils, {
			title: 'Hero ohne Bild',
			content: columnsBlock( 'h3r0bbbb', attrs ),
		} );

		await page.goto( withImage.link );
		const hero = page.locator( '.cf65-h3r0aaaa' );
		await expect( hero ).toHaveAttribute(
			'style',
			`background-image:url(${ media.source_url })`
		);
		await expect( hero ).toHaveCSS(
			'background-image',
			`url("${ media.source_url }")`
		);

		await page.goto( withoutImage.link );
		const fallback = page.locator( '.cf65-h3r0bbbb' );
		await expect( fallback ).not.toHaveAttribute( 'style', /.*/ );
		await expect( fallback ).toHaveCSS(
			'background-image',
			/w-logo-blue\.png/
		);
	} );

	test( 'Guard entfernt unsichere Hintergrundbilder und Werte', async ( {
		requestUtils,
	} ) => {
		const post = await createPost( requestUtils, {
			title: 'Panels Guard',
			status: 'draft',
			content: textBlock( 'g4u4rdaa', {
				styleBackgroundImage: { url: "x.jpg');}body{display:none" },
				styleShadow: '0 0 0 red;}body{',
				styleBorderStyle: 'solid',
			} ),
		} );
		const saved = await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			params: { context: 'edit' },
		} );
		const attrs = JSON.parse(
			saved.content.raw.match( /<!-- wp:cf65\/text (\{.*?\}) -->/ )[ 1 ]
		);
		expect( attrs.styleBackgroundImage ).toBeUndefined();
		expect( attrs.styleShadow ).toBeUndefined();
		expect( attrs.styleBorderStyle ).toBe( 'solid' );
	} );

	test( 'Editor: Panels in den Tabs, Block bleibt gültig', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const post = await createPost( requestUtils, {
			title: 'Panels Editor',
			status: 'draft',
			content: textBlock( 'e4d1t0aa', { styleBorderWidth: '2px' } ),
		} );

		await admin.editPost( post.id );
		await editor.canvas.locator( '.cf65-e4d1t0aa' ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.locator( '.interface-complementary-area' )
			.getByRole( 'tab', { name: /^(Block)$/ } )
			.click();
		const sidebar = page.locator( '.cf65-inspector-tabs' );

		await sidebar.getByRole( 'tab', { name: 'Layout' } ).click();
		await expect(
			sidebar.getByRole( 'button', { name: 'Abstände' } )
		).toBeVisible();

		await sidebar.getByRole( 'tab', { name: 'Style' } ).click();
		await expect(
			sidebar.getByRole( 'button', { name: 'Rahmen', exact: true } )
		).toBeVisible();
		await expect(
			sidebar.getByRole( 'button', { name: 'Hintergrundbild' } )
		).toBeVisible();

		await expect( editor.canvas.locator( '.cf65-e4d1t0aa' ) ).toHaveCSS(
			'border-top-width',
			'2px'
		);
		const valid = await page.evaluate( () =>
			window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.every( ( block ) => block.isValid )
		);
		expect( valid ).toBe( true );
	} );
} );
