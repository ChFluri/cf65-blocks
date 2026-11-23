/**
 * Security (UMSETZPLAN Kap. 7.5): Ein Mitarbeiter speichert manipulierte
 * cf65-Attribute direkt per REST (Editor umgangen). Der AttributeGuard muss
 * sie serverseitig entfernen – auch für Admins.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BASE_URL = process.env.WP_BASE_URL ?? 'http://localhost:8889';
const CONTRIBUTOR = {
	username: 'cf65-contributor',
	email: 'cf65-contributor@example.org',
	password: 'cf65-contributor-pass',
	roles: [ 'contributor' ],
};

// Payloads, die kses nicht entfernt (kein HTML), damit der Guard geprüft wird.
const MALICIOUS = `<!-- wp:cf65/button {"uniqueId":"x}body{","content":"Klick","url":"javascript:alert(1)","textColor":"red;}body{display:none","fontSize":{"desktop":"10px;color:red","mobile":"14px"},"backgroundColor":"#00ff00"} -->
<div class="wp-block-cf65-button cf65-block cf65-button"><a class="cf65-button__link">Klick</a></div>
<!-- /wp:cf65/button -->`;

/**
 * @param {string} raw Gespeicherter Inhalt.
 * @return {Object} Attribute des ersten cf65/button-Blocks.
 */
function buttonAttributes( raw ) {
	const match = raw.match( /<!-- wp:cf65\/button (\{.*?\}) -->/ );
	return match ? JSON.parse( match[ 1 ] ) : {};
}

const EXPECTED = {
	content: 'Klick',
	fontSize: { mobile: '14px' },
	backgroundColor: '#00ff00',
};

test.describe( 'AttributeGuard', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllUsers();
		await requestUtils.createUser( CONTRIBUTOR );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllUsers();
	} );

	test( 'Mitarbeiter: manipulierte Attribute werden beim Speichern entfernt', async ( {
		browser,
		requestUtils,
	} ) => {
		const context = await browser.newContext( {
			baseURL: BASE_URL,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( '/wp-login.php' );
		await page.fill( '#user_login', CONTRIBUTOR.username );
		await page.fill( '#user_pass', CONTRIBUTOR.password );
		await page.click( '#wp-submit' );
		await page.waitForURL( /wp-admin/ );

		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction( () => window.wp?.apiFetch );
		const id = await page.evaluate(
			async ( content ) =>
				(
					await window.wp.apiFetch( {
						path: '/wp/v2/posts',
						method: 'POST',
						data: { title: 'Payload', content, status: 'draft' },
					} )
				).id,
			MALICIOUS
		);
		await context.close();

		const post = await requestUtils.rest( {
			path: `/wp/v2/posts/${ id }`,
			params: { context: 'edit' },
		} );
		const raw = post.content.raw;

		expect( raw ).not.toContain( 'javascript:' );
		expect( raw ).not.toContain( 'display:none' );
		expect( raw ).not.toContain( 'color:red' );
		expect( buttonAttributes( raw ) ).toEqual( EXPECTED );
	} );

	test( 'Admin: Guard greift ebenfalls', async ( { requestUtils } ) => {
		const post = await requestUtils.createPost( {
			title: 'Payload Admin',
			content: MALICIOUS,
			status: 'draft',
		} );
		const saved = await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			params: { context: 'edit' },
		} );

		expect( buttonAttributes( saved.content.raw ) ).toEqual( EXPECTED );
	} );

	test( 'gültiger Inhalt bleibt byte-identisch', async ( {
		requestUtils,
	} ) => {
		const content = `<!-- wp:cf65/text {"uniqueId":"t1x2t3x4","content":"Ok","textColor":"#0000ff","fontSize":{"desktop":"18px"}} -->
<p class="wp-block-cf65-text cf65-block cf65-text cf65-t1x2t3x4">Ok</p>
<!-- /wp:cf65/text -->`;
		const post = await requestUtils.createPost( {
			title: 'Unverändert',
			content,
			status: 'draft',
		} );
		const saved = await requestUtils.rest( {
			path: `/wp/v2/posts/${ post.id }`,
			params: { context: 'edit' },
		} );

		expect( saved.content.raw ).toBe( content );
	} );
} );
