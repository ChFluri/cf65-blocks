import { describe, expect, it } from 'vitest';

import {
	bindingFromValue,
	bindingValue,
	normalizeBinding,
	withBinding,
} from '../binding';

const BINDING = {
	source: 'current-post',
	provider: 'core',
	field: 'featured_image',
};

describe( 'normalizeBinding', () => {
	it( 'behält gültige Bindungen in fester Schlüsselreihenfolge', () => {
		expect(
			Object.keys(
				normalizeBinding( {
					field: 'title',
					provider: 'core',
					source: 'current-post',
					extra: 'x',
				} )
			)
		).toEqual( [ 'source', 'provider', 'field' ] );
	} );

	it.each( [
		[ null ],
		[ 'current-post' ],
		[ { ...BINDING, source: 'Current' } ],
		[ { ...BINDING, provider: '' } ],
		[ { ...BINDING, field: 'a b' } ],
		[ { ...BINDING, field: '<script>' } ],
		[ { ...BINDING, field: 'x'.repeat( 65 ) } ],
	] )( 'verwirft %j', ( raw ) => {
		expect( normalizeBinding( raw ) ).toBeNull();
	} );
} );

describe( 'withBinding', () => {
	it( 'setzt und entfernt eine Bindung', () => {
		const set = withBinding( undefined, 'url', BINDING );
		expect( set ).toEqual( { url: BINDING } );
		expect( withBinding( set, 'url', undefined ) ).toBeUndefined();
	} );

	it( 'lässt andere Bindungen stehen', () => {
		const other = { alt: { ...BINDING, field: 'title' } };
		expect( withBinding( other, 'url', BINDING ) ).toEqual( {
			...other,
			url: BINDING,
		} );
	} );
} );

describe( 'Auswahlwert', () => {
	it( 'ist umkehrbar', () => {
		expect( bindingValue( BINDING ) ).toBe( 'core:featured_image' );
		expect( bindingFromValue( 'core:featured_image' ) ).toEqual( BINDING );
	} );

	it( 'leer und ungültig ergibt keine Bindung', () => {
		expect( bindingValue( undefined ) ).toBe( '' );
		expect( bindingFromValue( '' ) ).toBeUndefined();
		expect( bindingFromValue( ':title' ) ).toBeUndefined();
		expect( bindingFromValue( 'core:' ) ).toBeUndefined();
	} );

	it( 'erlaubt Punkte im Feldnamen (Pods-Traversal)', () => {
		expect( bindingFromValue( 'pods:related.title' )?.field ).toBe(
			'related.title'
		);
	} );
} );
