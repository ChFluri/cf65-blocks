import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock( '@wordpress/api-fetch', () => ( { default: vi.fn() } ) );

const { default: apiFetch } = await import( '@wordpress/api-fetch' );
const { clearDynamicCache, fetchFields, fetchPreview } =
	await import( '../api' );

const BINDING = { source: 'current-post', provider: 'core', field: 'title' };

beforeEach( () => {
	clearDynamicCache();
	apiFetch.mockReset();
} );

describe( 'fetchFields', () => {
	it( 'fragt einmal pro Ausgabetyp und Post-Typ', async () => {
		apiFetch.mockResolvedValue( { sources: [], providers: [] } );

		await fetchFields( 'image', 'post' );
		await fetchFields( 'image', 'post' );
		await fetchFields( 'link', 'post' );

		expect( apiFetch ).toHaveBeenCalledTimes( 2 );
		expect( apiFetch.mock.calls[ 0 ][ 0 ].path ).toBe(
			'/cf65-blocks/v1/dynamic/fields?kind=image&postType=post'
		);
	} );

	it( 'vergisst fehlgeschlagene Anfragen', async () => {
		apiFetch.mockRejectedValueOnce( new Error( 'offline' ) );
		apiFetch.mockResolvedValueOnce( { sources: [], providers: [] } );

		await expect( fetchFields( 'image' ) ).rejects.toThrow( 'offline' );
		await expect( fetchFields( 'image' ) ).resolves.toEqual( {
			sources: [],
			providers: [],
		} );
	} );
} );

describe( 'fetchPreview', () => {
	it( 'sendet die Bindung und liefert den Wert', async () => {
		apiFetch.mockResolvedValue( { values: { value: 'Hallo' } } );

		await expect(
			fetchPreview( 'link', BINDING, 7, 'page' )
		).resolves.toBe( 'Hallo' );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/cf65-blocks/v1/dynamic/preview',
			method: 'POST',
			data: {
				kind: 'link',
				postId: 7,
				postType: 'page',
				bindings: { value: BINDING },
			},
		} );
	} );

	it( 'teilt Anfragen gleicher Beiträge', async () => {
		apiFetch.mockResolvedValue( { values: { value: null } } );

		await Promise.all( [
			fetchPreview( 'link', BINDING, 7 ),
			fetchPreview( 'link', BINDING, 7 ),
			fetchPreview( 'link', BINDING, 8 ),
		] );

		expect( apiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'ohne Beitrag keine Anfrage', async () => {
		await expect( fetchPreview( 'link', BINDING, 0 ) ).resolves.toBeNull();
		expect( apiFetch ).not.toHaveBeenCalled();
	} );
} );
