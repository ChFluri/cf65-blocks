/**
 * REST-Zugriff für Feld-Picker und Vorschau (includes/Dynamic/RestController).
 *
 * Antworten werden pro Editor-Sitzung zwischengespeichert, damit z. B. ein
 * Query Loop mit vielen gleichen Blöcken nur eine Anfrage pro Beitrag stellt.
 */
import apiFetch from '@wordpress/api-fetch';

const BASE = '/cf65-blocks/v1/dynamic';
const MAX_ENTRIES = 500;

const fieldsCache = new Map();
const previewCache = new Map();

/**
 * @param {Map}                    cache  Cache.
 * @param {string}                 key    Schlüssel.
 * @param {() => Promise<unknown>} create Liefert ein Promise.
 * @return {Promise<unknown>} Promise (fehlgeschlagene werden nicht behalten).
 */
function cached( cache, key, create ) {
	if ( ! cache.has( key ) ) {
		if ( cache.size >= MAX_ENTRIES ) {
			cache.clear();
		}
		const promise = create().catch( ( error ) => {
			cache.delete( key );
			throw error;
		} );
		cache.set( key, promise );
	}
	return cache.get( key );
}

/**
 * Felder je Provider für einen Ausgabetyp.
 *
 * @param {string} kind       `image` oder `link`.
 * @param {string} [postType] Post-Typ des Kontexts.
 * @return {Promise<{sources: Array, providers: Array}>} Antwort.
 */
export function fetchFields( kind, postType = '' ) {
	const query = new URLSearchParams( { kind } );
	if ( postType ) {
		query.set( 'postType', postType );
	}
	const path = `${ BASE }/fields?${ query.toString() }`;
	return cached( fieldsCache, path, () => apiFetch( { path } ) );
}

/**
 * Aufgelöster Wert einer Bindung für einen Beitrag.
 *
 * @param {string} kind       `image` oder `link`.
 * @param {Object} binding    Bindung.
 * @param {number} postId     Beitrag aus dem Block-Kontext (0 = keiner).
 * @param {string} [postType] Post-Typ.
 * @return {Promise<unknown>} Wert oder null.
 */
export function fetchPreview( kind, binding, postId, postType = '' ) {
	if ( ! Number.isInteger( postId ) || postId <= 0 ) {
		return Promise.resolve( null );
	}
	const key = JSON.stringify( [ kind, postId, postType, binding ] );
	return cached( previewCache, key, () =>
		apiFetch( {
			path: `${ BASE }/preview`,
			method: 'POST',
			data: { kind, postId, postType, bindings: { value: binding } },
		} ).then( ( response ) => response?.values?.value ?? null )
	);
}

/**
 * Leert die Caches (Tests, nach dem Speichern).
 */
export function clearDynamicCache() {
	fieldsCache.clear();
	previewCache.clear();
}
