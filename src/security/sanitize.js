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

const URL_MAX_LENGTH = 2048;
const URL_SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;
// Steuerzeichen, Leerzeichen, Anführungszeichen, spitze Klammern, Backslash.

const URL_FORBIDDEN = /[\u0000-\u0020\u007f"'<>\\`]/;

/** Erlaubte Schemata für Links. */
export const LINK_SCHEMES = [ 'http', 'https', 'mailto', 'tel' ];
/** Erlaubte Schemata für Bildquellen. */
export const IMAGE_SCHEMES = [ 'http', 'https' ];

/**
 * URL für `href`/`src`: absolute URL mit erlaubtem Schema oder relative URL.
 *
 * @param {unknown}  value     Rohwert.
 * @param {string[]} [schemes] Erlaubte Schemata (Kleinbuchstaben).
 * @return {string|null} URL oder null.
 */
export function sanitizeUrl( value, schemes = LINK_SCHEMES ) {
	if (
		typeof value !== 'string' ||
		value.length === 0 ||
		// Bytes (UTF-8) wie in PHP strlen().
		new TextEncoder().encode( value ).length > URL_MAX_LENGTH ||
		URL_FORBIDDEN.test( value )
	) {
		return null;
	}
	const scheme = URL_SCHEME.exec( value );
	if ( scheme ) {
		return schemes.includes( scheme[ 1 ].toLowerCase() ) ? value : null;
	}
	// Ohne Schema: relativ. Ein ":" vor dem ersten "/", "?" oder "#" wäre
	// ein (ungültiges) Schema.
	const head = value.split( /[/?#]/, 1 )[ 0 ];
	return head.includes( ':' ) ? null : value;
}

/**
 * Bild-Objekt `{ url, id? }` (Spiegel von Sanitizer::image()).
 *
 * @param {unknown} value Rohwert.
 * @return {{url: string, id?: number}|null} Normalisiertes Bild oder null.
 */
export function sanitizeImage( value ) {
	if ( ! value || typeof value !== 'object' || Array.isArray( value ) ) {
		return null;
	}
	const url = sanitizeUrl( value.url, IMAGE_SCHEMES );
	if ( ! url ) {
		return null;
	}
	return Number.isInteger( value.id ) && value.id > 0
		? { url, id: value.id }
		: { url };
}

/**
 * CSS-Wert `url(…)` ohne Anführungszeichen (Spiegel von
 * Sanitizer::css_image()); URLs mit runden Klammern werden abgelehnt.
 *
 * @param {unknown} value Rohwert.
 * @return {string|null} CSS-Wert oder null.
 */
export function sanitizeCssImage( value ) {
	const image = sanitizeImage( value );
	return image && ! /[()]/.test( image.url ) ? `url(${ image.url })` : null;
}
