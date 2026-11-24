/**
 * Dynamic Content, Durchstich (Phase 2.1): Bild-URL und Button-Link aus dem
 * aktuellen Beitrag – im Frontend, im Query Loop, in der Editor-Vorschau –
 * sowie Rechte der REST-Routen und Guard für Bindungen.
 */
const { writeFileSync } = require( 'node:fs' );
const { tmpdir } = require( 'node:os' );
const { join } = require( 'node:path' );

const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BASE_URL = process.env.WP_BASE_URL ?? 'http://localhost:8889';

// 1×1-PNG für den Upload als Beitragsbild.
const PNG =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const binding = ( field ) => ( {
	url: { source: 'current-post', provider: 'core', field },
} );

const buttonMarkup = ( id, extra = {} ) => {
	const attrs = JSON.stringify( {
		uniqueId: id,
		content: 'Weiterlesen',
		...extra,
		dynamic: binding( 'permalink' ),
	} );
	return `<!-- wp:cf65/button ${ attrs } -->
<div class="wp-block-cf65-button cf65-block cf65-button cf65-${ id }"><a class="cf65-button__link">Weiterlesen</a></div>
<!-- /wp:cf65/button -->`;
};

const imageMarkup = ( id ) =>
	`<!-- wp:cf65/image ${ JSON.stringify( {
		uniqueId: id,
		dynamic: binding( 'featured_image' ),
	} ) } -->
<figure class="wp-block-cf65-image cf65-block cf65-image cf65-${ id }"><img alt=""/></figure>
<!-- /wp:cf65/image -->`;

/**
 * @param {Object} requestUtils Request-Utils.
 * @param {Object} data         Beitragsdaten.
 * @return {Promise<Object>} Beitrag.
 */
const createPost = ( requestUtils, data ) =>
	requestUtils.rest( {
		path: '/wp/v2/posts',
		method: 'POST',
		data: { status: 'publish', ...data },
	} );

test.describe( 'Dynamic Content', () => {
	let media;

	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllMedia();
		const file = join( tmpdir(), 'cf65-dynamic.png' );
		writeFileSync( file, Buffer.from( PNG, 'base64' ) );
		media = await requestUtils.uploadMedia( file );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllMedia();
	} );

	test( 'Button verlinkt auf den aktuellen Beitrag', async ( {
		page,
		requestUtils,
	} ) => {
		const post = await createPost( requestUtils, {
			title: 'Button dynamisch',
			content: buttonMarkup( 'd1n2b3t4', { opensInNewTab: true } ),
		} );

		await page.goto( `/?p=${ post.id }` );
		const link = page.locator( '.cf65-button__link' );
		await expect( link ).toHaveAttribute(
			'href',
			new RegExp( `\\?p=${ post.id }$` )
		);
		await expect( link ).toHaveAttribute( 'target', '_blank' );
		await expect( link ).toHaveAttribute( 'rel', 'noopener' );
	} );

	test( 'Bild zeigt das Beitragsbild, ohne Beitragsbild fehlt es', async ( {
		page,
		requestUtils,
	} ) => {
		const withImage = await createPost( requestUtils, {
			title: 'Mit Beitragsbild',
			content: imageMarkup( 'd1n2i3m4' ),
			featured_media: media.id,
		} );
		const withoutImage = await createPost( requestUtils, {
			title: 'Ohne Beitragsbild',
			content: imageMarkup( 'd5n6i7m8' ),
		} );

		await page.goto( `/?p=${ withImage.id }` );
		const img = page.locator( '.cf65-image img' );
		await expect( img ).toHaveAttribute( 'src', media.source_url );
		await expect( img ).toHaveClass(
			new RegExp( `(^|\\s)wp-image-${ media.id }(\\s|$)` )
		);

		await page.goto( `/?p=${ withoutImage.id }` );
		await expect(
			page.getByText( 'Ohne Beitragsbild' ).first()
		).toBeVisible();
		await expect( page.locator( '.cf65-image' ) ).toHaveCount( 0 );
	} );

	test( 'Query Loop: jeder Eintrag verlinkt auf sich selbst', async ( {
		page,
		requestUtils,
	} ) => {
		const first = await createPost( requestUtils, { title: 'Eintrag A' } );
		const second = await createPost( requestUtils, { title: 'Eintrag B' } );
		const loop = await requestUtils.rest( {
			path: '/wp/v2/pages',
			method: 'POST',
			data: {
				title: 'Liste',
				status: 'publish',
				content: `<!-- wp:query {"queryId":1,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","inherit":false}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title /-->
${ buttonMarkup( 'l0o0p0b1' ) }
<!-- /wp:post-template --></div>
<!-- /wp:query -->`,
			},
		} );

		await page.goto( `/?page_id=${ loop.id }` );
		const hrefs = await page
			.locator( '.wp-block-post .cf65-button__link' )
			.evaluateAll( ( links ) =>
				links.map( ( link ) => link.getAttribute( 'href' ) )
			);
		for ( const post of [ first, second ] ) {
			expect( hrefs ).toContainEqual(
				expect.stringMatching( new RegExp( `\\?p=${ post.id }$` ) )
			);
		}
	} );

	test( 'Editor-Vorschau zeigt das Beitragsbild', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const post = await createPost( requestUtils, {
			title: 'Vorschau',
			status: 'draft',
			content: imageMarkup( 'p1r2e3v4' ),
			featured_media: media.id,
		} );

		await admin.editPost( post.id );
		await expect(
			editor.canvas.locator( '.cf65-image img' )
		).toHaveAttribute( 'src', media.source_url );

		const valid = await page.evaluate( () =>
			window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.every( ( block ) => block.isValid )
		);
		expect( valid ).toBe( true );
	} );

	test( 'REST-Routen nur für angemeldete Redakteure', async ( {
		playwright,
	} ) => {
		const anonymous = await playwright.request.newContext( {
			baseURL: BASE_URL,
		} );
		const fields = await anonymous.get(
			'/?rest_route=/cf65-blocks/v1/dynamic/fields&kind=image'
		);
		expect( fields.status() ).toBe( 401 );
		const preview = await anonymous.post(
			'/?rest_route=/cf65-blocks/v1/dynamic/preview',
			{
				data: {
					kind: 'link',
					postId: 1,
					bindings: { value: binding( 'permalink' ).url },
				},
			}
		);
		expect( preview.status() ).toBe( 401 );
		await anonymous.dispose();
	} );

	test( 'Feldliste und Vorschau für Redakteure', async ( {
		requestUtils,
	} ) => {
		const fields = await requestUtils.rest( {
			path: '/cf65-blocks/v1/dynamic/fields',
			params: { kind: 'link', postType: 'post' },
		} );
		expect( fields.providers ).toContainEqual(
			expect.objectContaining( {
				id: 'core',
				fields: [
					{
						name: 'permalink',
						label: 'Link zum Beitrag',
						type: 'url',
					},
				],
			} )
		);

		const post = await createPost( requestUtils, { title: 'REST' } );
		const preview = await requestUtils.rest( {
			path: '/cf65-blocks/v1/dynamic/preview',
			method: 'POST',
			data: {
				kind: 'link',
				postId: post.id,
				bindings: {
					value: binding( 'permalink' ).url,
					kaputt: { source: '<x>' },
				},
			},
		} );
		expect( preview.values.value ).toMatch(
			new RegExp( `\\?p=${ post.id }$` )
		);
		expect( preview.values.kaputt ).toBeNull();
	} );

	test( 'Guard entfernt ungültige Bindungen beim Speichern', async ( {
		requestUtils,
	} ) => {
		const content = `<!-- wp:cf65/button {"uniqueId":"g1u2a3r4","content":"X","dynamic":{"url":{"source":"current-post","provider":"core","field":"permalink","evil":"1"},"content":{"source":"current-post","provider":"core","field":"title"},"href":{"source":"javascript:"}}} -->
<div class="wp-block-cf65-button cf65-block cf65-button cf65-g1u2a3r4"><a class="cf65-button__link">X</a></div>
<!-- /wp:cf65/button -->`;
		const post = await createPost( requestUtils, {
			title: 'Guard',
			status: 'draft',
			content,
		} );
		const saved = await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			params: { context: 'edit' },
		} );
		const attrs = JSON.parse(
			saved.content.raw.match( /<!-- wp:cf65\/button (\{.*?\}) -->/ )[ 1 ]
		);
		expect( attrs.dynamic ).toEqual( binding( 'permalink' ) );
	} );
} );
