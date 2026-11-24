/**
 * Inline-Platzhalter im RichText (UMSETZPLAN Kap. 3.2):
 *
 *     <span class="cf65-dynamic" data-cf65-source="current-post"
 *           data-cf65-provider="core" data-cf65-field="title">Titel</span>
 *
 * Den Inhalt ersetzt der Server beim Rendern (includes/Dynamic/InlineScanner).
 */
import { applyFormat, create, insert, remove } from '@wordpress/rich-text';

import { normalizeBinding } from './binding';

export const FORMAT_NAME = 'cf65/dynamic';
export const FORMAT_CLASS = 'cf65-dynamic';

/** Format-Attribute → HTML-Attribute (registerFormatType). */
export const FORMAT_ATTRIBUTES = {
	source: 'data-cf65-source',
	provider: 'data-cf65-provider',
	field: 'data-cf65-field',
};

/**
 * @param {Object|undefined} blockType Blocktyp.
 * @return {boolean} true, wenn der Block Inline-Platzhalter rendert.
 */
export function supportsInlineDynamic( blockType ) {
	return blockType?.supports?.cf65?.inlineDynamic === true;
}

/**
 * Fügt einen Platzhalter an der Auswahl ein (ersetzt markierten Text).
 *
 * @param {Object} value   RichText-Wert.
 * @param {Object} binding Bindung.
 * @param {string} [label] Platzhaltertext (Feldname).
 * @return {Object} Neuer Wert (unverändert bei ungültiger Bindung).
 */
export function insertDynamic( value, binding, label ) {
	const attributes = normalizeBinding( binding );
	if ( ! attributes ) {
		return value;
	}
	const text =
		( typeof label === 'string' && label.trim() ) || attributes.field;
	const token = applyFormat(
		create( { text } ),
		{ type: FORMAT_NAME, attributes },
		0,
		text.length
	);
	return insert( value, token );
}

/**
 * Bereich des Platzhalters an der Cursorposition.
 *
 * @param {Object} value RichText-Wert.
 * @return {{start: number, end: number}|null} Bereich oder null.
 */
export function tokenRange( value ) {
	const has = ( index ) =>
		( value.formats?.[ index ] ?? [] ).some(
			( format ) => format.type === FORMAT_NAME
		);
	let index = value.start;
	if ( ! has( index ) && index > 0 && has( index - 1 ) ) {
		index -= 1;
	}
	if ( ! has( index ) ) {
		return null;
	}
	let start = index;
	let end = index + 1;
	while ( start > 0 && has( start - 1 ) ) {
		start -= 1;
	}
	while ( end < value.text.length && has( end ) ) {
		end += 1;
	}
	return { start, end };
}

/**
 * Entfernt den Platzhalter an der Cursorposition samt Text.
 *
 * @param {Object} value RichText-Wert.
 * @return {Object} Neuer Wert.
 */
export function removeToken( value ) {
	const range = tokenRange( value );
	return range ? remove( value, range.start, range.end ) : value;
}
