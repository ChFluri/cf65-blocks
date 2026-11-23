/**
 * Update-Sicherheit, Schicht 4: Beitrag mit „altem“ (ungültigem) cf65-Markup
 * öffnen → Blöcke werden automatisch und verlustfrei repariert.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

// Simuliert Markup einer früheren Plugin-Version (andere Struktur/Klassen).
const LEGACY_CONTENT = `<!-- wp:cf65/heading {"uniqueId":"leg4cy01","content":"Alte \\u003cem\\u003eÜberschrift\\u003c/em\\u003e","level":3,"textColor":"#ff0000","markupVersion":0} -->
<h3 class="cf65-heading-v0"><span>Alte <em>Überschrift</em></span></h3>
<!-- /wp:cf65/heading -->

<!-- wp:cf65/columns {"uniqueId":"leg4cy02"} -->
<div class="wp-block-cf65-columns cf65-block cf65-columns cf65-leg4cy02"><!-- wp:cf65/column {"uniqueId":"leg4cy03"} -->
<div class="wp-block-cf65-column cf65-block cf65-column cf65-leg4cy03"><!-- wp:cf65/text {"uniqueId":"leg4cy04","content":"Alter Text"} -->
<p class="alt">Alter Text</p>
<!-- /wp:cf65/text --></div>
<!-- /wp:cf65/column --></div>
<!-- /wp:cf65/columns -->`;

test.describe( 'Auto-Recovery', () => {
	test( 'ungültige cf65-Blöcke werden beim Laden repariert', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const post = await requestUtils.createPost( {
			title: 'Recovery',
			content: LEGACY_CONTENT,
			status: 'draft',
		} );

		await admin.editPost( post.id );

		await expect(
			page.locator( '.components-snackbar', {
				hasText: 'automatisch repariert',
			} )
		).toBeVisible();

		const blocks = await page.evaluate( () => {
			const flat = ( list ) =>
				list.flatMap( ( b ) => [
					{
						name: b.name,
						isValid: b.isValid,
						content: String( b.attributes.content ?? '' ),
						uniqueId: b.attributes.uniqueId,
						markupVersion: b.attributes.markupVersion,
					},
					...flat( b.innerBlocks ),
				] );
			return flat(
				window.wp.data.select( 'core/block-editor' ).getBlocks()
			);
		} );

		expect( blocks.filter( ( b ) => ! b.isValid ) ).toEqual( [] );
		expect( blocks ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					name: 'cf65/heading',
					content: 'Alte <em>Überschrift</em>',
					uniqueId: 'leg4cy01',
					markupVersion: 1,
				} ),
				expect.objectContaining( {
					name: 'cf65/text',
					content: 'Alter Text',
					uniqueId: 'leg4cy04',
				} ),
			] )
		);

		// Keine „unerwarteter Inhalt“-Warnung im Editor.
		await expect(
			editor.canvas.locator( '.block-editor-warning' )
		).toHaveCount( 0 );
	} );
} );
