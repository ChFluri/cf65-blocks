/**
 * Typisierte Validierung von Stilwerten.
 *
 * Spiegelbild von includes/Security/Sanitizer.php – beide müssen für jede
 * Eingabe dasselbe Ergebnis liefern (geprüft über tests/fixtures/css/cases.json).
 * Regeln: nur ASCII-Zeichenklassen, kein trim(), ungültig → null.
 */

const MAX_LENGTH = 80;

const HEX_COLOR =
	/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNCTION_COLOR = /^(?:rgba?|hsla?)\([0-9., %/]+\)$/;
const COLOR_KEYWORDS = [ 'transparent', 'currentcolor' ];
const CSS_VARIABLE = /^var\(--[a-z0-9-]{1,72}\)$/;
const LENGTH = /^-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:px|em|rem|%|vw|vh)$/;
const UNIQUE_ID = /^[a-z0-9]{4,16}$/;

/**
 * @param {unknown} value Rohwert.
 * @return {value is string} true für nicht-leere Strings bis MAX_LENGTH.
 */
function isCandidate( value ) {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length <= MAX_LENGTH
	);
}

/**
 * @param {unknown} value Farbwert (Hex, rgb/hsl, Schlüsselwort, CSS-Variable).
 * @return {string|null} Bereinigter Wert oder null.
 */
export function sanitizeColor( value ) {
	if ( ! isCandidate( value ) ) {
		return null;
	}
	if (
		HEX_COLOR.test( value ) ||
		FUNCTION_COLOR.test( value ) ||
		CSS_VARIABLE.test( value )
	) {
		return value;
	}
	const keyword = value.toLowerCase();
	return COLOR_KEYWORDS.includes( keyword ) ? keyword : null;
}

/**
 * @param {unknown} value Länge mit Einheit, `0` oder CSS-Variable.
 * @return {string|null} Bereinigter Wert oder null.
 */
export function sanitizeLength( value ) {
	if ( ! isCandidate( value ) ) {
		return null;
	}
	if ( value === '0' || LENGTH.test( value ) || CSS_VARIABLE.test( value ) ) {
		return value;
	}
	return null;
}

/**
 * @param {unknown}  value   Rohwert.
 * @param {string[]} allowed Erlaubte Werte (exakter Vergleich).
 * @return {string|null} Wert oder null.
 */
export function sanitizeEnum( value, allowed ) {
	return typeof value === 'string' &&
		Array.isArray( allowed ) &&
		allowed.includes( value )
		? value
		: null;
}

/**
 * @param {unknown} value Block-ID.
 * @return {string|null} ID oder null.
 */
export function sanitizeUniqueId( value ) {
	return typeof value === 'string' && UNIQUE_ID.test( value ) ? value : null;
}
