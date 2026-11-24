/**
 * Helfer für Bindungen im Block-Attribut `dynamic` (UMSETZPLAN Kap. 3.2).
 *
 * Form: `{ url: { source, provider, field } }`. Die Reihenfolge der Schlüssel
 * entspricht der serverseitigen Normalisierung (includes/Dynamic/Binding),
 * damit das Speichern den Inhalt nicht unnötig umschreibt.
 */

export const CURRENT_POST = 'current-post';

const ID = /^[a-z][a-z0-9-]{0,31}$/;
const FIELD = /^[A-Za-z0-9_][A-Za-z0-9_.\-]{0,63}$/;

/**
 * @param {unknown} binding Rohwert.
 * @return {{source: string, provider: string, field: string}|null} Bindung oder null.
 */
export function normalizeBinding( binding ) {
	if ( ! binding || typeof binding !== 'object' ) {
		return null;
	}
	const { source, provider, field } = binding;
	if (
		typeof source !== 'string' ||
		typeof provider !== 'string' ||
		typeof field !== 'string' ||
		! ID.test( source ) ||
		! ID.test( provider ) ||
		! FIELD.test( field )
	) {
		return null;
	}
	return { source, provider, field };
}

/**
 * Setzt oder entfernt die Bindung eines Attributs.
 *
 * @param {Object|undefined} dynamic Bisheriges Attribut `dynamic`.
 * @param {string}           attr    Gebundenes Attribut, z. B. `url`.
 * @param {Object|undefined} binding Neue Bindung oder undefined (entfernen).
 * @return {Object|undefined} Neues Attribut `dynamic` (undefined, wenn leer).
 */
export function withBinding( dynamic, attr, binding ) {
	const next = {
		...( dynamic && typeof dynamic === 'object' ? dynamic : {} ),
	};
	const clean = normalizeBinding( binding );
	if ( clean ) {
		next[ attr ] = clean;
	} else {
		delete next[ attr ];
	}
	return Object.keys( next ).length ? next : undefined;
}

/**
 * Wert für das Auswahlfeld (`provider:field`).
 *
 * @param {Object|undefined} binding Bindung.
 * @return {string} Wert oder ''.
 */
export function bindingValue( binding ) {
	const clean = normalizeBinding( binding );
	return clean ? `${ clean.provider }:${ clean.field }` : '';
}

/**
 * Bindung aus dem Wert des Auswahlfelds.
 *
 * @param {string} value `provider:field` oder ''.
 * @return {Object|undefined} Bindung (Quelle „Aktueller Beitrag“) oder undefined.
 */
export function bindingFromValue( value ) {
	const index = typeof value === 'string' ? value.indexOf( ':' ) : -1;
	if ( index <= 0 ) {
		return undefined;
	}
	return (
		normalizeBinding( {
			source: CURRENT_POST,
			provider: value.slice( 0, index ),
			field: value.slice( index + 1 ),
		} ) ?? undefined
	);
}
