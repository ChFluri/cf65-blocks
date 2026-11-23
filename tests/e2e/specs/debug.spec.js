/**
 * Debug-Modus (CF65_BLOCKS_DEBUG in .wp-env.json): Messwerte nur für Admins.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const CONTENT = `<!-- wp:cf65/heading {"uniqueId":"dbg00001","content":"Debug","textColor":"#ff0000"} -->
<h2 class="wp-block-cf65-heading cf65-block cf65-heading cf65-dbg00001">Debug</h2>
<!-- /wp:cf65/heading -->`;

test.describe( 'Debug-Modus', () => {
	let postId;

	test.beforeAll( async ( { requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title: 'Debug',
			content: CONTENT,
			status: 'publish',
		} );
		postId = post.id;
	} );

	test( 'Admin erhält Server-Timing und Admin-Bar-Menü', async ( {
		page,
	} ) => {
		const response = await page.goto( `/?p=${ postId }` );
		const timing = response.headers()[ 'server-timing' ] ?? '';

		expect( timing ).toMatch(
			/cf65-render;dur=\d+\.\d{2};desc="cf65 blocks: 1"/
		);
		expect( timing ).toMatch( /cf65-css;dur=\d+\.\d{2};desc="css: \d+ B"/ );
		// CSS wurde beim Speichern vorberechnet (Post-Meta) → Cache-Treffer.
		expect( timing ).toMatch(
			/cf65-css-cache;dur=\d+\.\d{2};desc="hits: 1, misses: 0"/
		);
		await expect(
			page.locator( '#wp-admin-bar-cf65-performance' )
		).toContainText( 'cf65 Performance' );
		// Seite selbst wird trotz Pufferung vollständig ausgeliefert.
		await expect( page.locator( '.cf65-heading' ) ).toHaveCSS(
			'color',
			'rgb(255, 0, 0)'
		);
	} );

	test( 'Besucher sehen keine Messwerte', async ( { browser } ) => {
		const context = await browser.newContext( {
			baseURL: process.env.WP_BASE_URL ?? 'http://localhost:8889',
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const response = await page.goto( `/?p=${ postId }` );

		expect( response.headers()[ 'server-timing' ] ?? '' ).not.toContain(
			'cf65-'
		);
		await expect(
			page.locator( '#wp-admin-bar-cf65-performance' )
		).toHaveCount( 0 );
		await expect( page.locator( '.cf65-heading' ) ).toHaveText( 'Debug' );
		await context.close();
	} );

	test( 'Editor misst die CSS-Erzeugung', async ( { admin, page } ) => {
		await admin.editPost( postId );
		await expect
			.poll( () =>
				page.evaluate( () => window.cf65BlocksConfig?.debug ?? null )
			)
			.toBe( true );
		await expect
			.poll( () =>
				page.evaluate(
					() => performance.getEntriesByName( 'cf65-css' ).length
				)
			)
			.toBeGreaterThan( 0 );
	} );
} );
