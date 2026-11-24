/**
 * React-Hooks für Feldliste und Vorschau.
 */
import { useEffect, useState } from '@wordpress/element';

import { fetchFields, fetchPreview } from './api';
import { normalizeBinding } from './binding';

/**
 * @typedef {Object} AsyncState
 * @property {'idle'|'loading'|'ready'|'error'} status Zustand.
 * @property {unknown}                          value  Ergebnis (bei `ready`).
 */

const IDLE = { status: 'idle', value: null };

/**
 * Lädt ein Promise, sobald sich der Schlüssel ändert.
 *
 * @param {string|null}            key  Schlüssel (null = nichts laden).
 * @param {() => Promise<unknown>} load Liefert ein Promise.
 * @return {AsyncState} Zustand.
 */
function useAsync( key, load ) {
	const [ state, setState ] = useState( IDLE );

	useEffect( () => {
		if ( key === null ) {
			setState( IDLE );
			return undefined;
		}
		let active = true;
		setState( { status: 'loading', value: null } );
		load().then(
			( value ) => active && setState( { status: 'ready', value } ),
			() => active && setState( { status: 'error', value: null } )
		);
		return () => {
			active = false;
		};
		// `load` hängt nur vom Schlüssel ab.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ key ] );

	return state;
}

/**
 * Felder je Provider für einen Ausgabetyp.
 *
 * @param {string} kind       `image` oder `link`.
 * @param {string} [postType] Post-Typ.
 * @return {AsyncState} Zustand, `value.providers` bei Erfolg.
 */
export function useDynamicFields( kind, postType = '' ) {
	return useAsync( `${ kind }|${ postType }`, () =>
		fetchFields( kind, postType )
	);
}

/**
 * Vorschauwert einer Bindung im Block-Kontext.
 *
 * @param {Object|undefined} binding Bindung.
 * @param {string}           kind    `image` oder `link`.
 * @param {Object}           context Block-Kontext (`postId`, `postType`).
 * @return {AsyncState} Zustand.
 */
export function useDynamicPreview( binding, kind, context ) {
	const clean = normalizeBinding( binding );
	const postId = Number.isInteger( context?.postId ) ? context.postId : 0;
	const postType =
		typeof context?.postType === 'string' ? context.postType : '';
	const key = clean
		? JSON.stringify( [ kind, postId, postType, clean ] )
		: null;

	return useAsync( key, () => fetchPreview( kind, clean, postId, postType ) );
}
