/**
 * CSS-Generator für cf65-Blöcke (Editor).
 *
 * JS-Port von includes/Styles/CssGenerator.php. Die Style-Map kommt aus
 * `block.json` → `supports.cf65.styles`; beide Implementierungen müssen
 * byte-identisches CSS erzeugen (tests/fixtures/css/cases.json).
 */
import {
	sanitizeColor,
	sanitizeCssImage,
	sanitizeEnum,
	sanitizeLength,
	sanitizeUniqueId,
} from '../security/sanitize';

/** Geräte in Ausgabereihenfolge (Desktop-first) mit Media Query. */
export const DEVICES = [
	{ key: 'desktop', media: null },
	{ key: 'tablet', media: '(max-width:1024px)' },
	{ key: 'mobile', media: '(max-width:767px)' },
];

const STATES = [ 'normal', 'hover' ];
const PROPERTY = /^(?:[a-z-]+|--[a-z0-9-]+)$/;
const SELECTOR_SUFFIX = /^(?: [a-z0-9_-]+| \.[a-z0-9_-]+)*$/;

/**
 * @typedef {Object} StyleEntry
 * @property {string}                          attr         Attributname.
 * @property {string}                          property     CSS-Eigenschaft.
 * @property {'color'|'length'|'enum'|'image'} type         Werttyp.
 * @property {string[]}                        [values]     Erlaubte Werte bei `enum`.
 * @property {boolean}                         [responsive] Wert pro Gerät.
 * @property {'hover'}                         [state]      Zustand.
 * @property {string}                          [selector]   Unterselektor, z. B. " .cf65-icon".
 * @property {'block'|'selector'}              [hoverScope] Hover auf dem Block (Standard) oder dem Unterselektor.
 * @property {boolean}                         [boost]      Klasse dreifach (Spezifität 0,3,0).
 * @property {boolean}                         [deviceVar]  Nur für `--`-Variablen: Tablet/Mobil schreiben
 *                                                          `<name>-tablet` / `<name>-mobile`.
 */

/**
 * @param {StyleEntry} entry Map-Eintrag.
 * @param {unknown}    value Rohwert.
 * @return {string|null} Bereinigter Wert.
 */
function sanitizeValue( entry, value ) {
	switch ( entry.type ) {
		case 'color':
			return sanitizeColor( value );
		case 'length':
			return sanitizeLength( value );
		case 'enum':
			return sanitizeEnum( value, entry.values );
		case 'image':
			return sanitizeCssImage( value );
		default:
			return null;
	}
}

/**
 * @param {unknown} value Wert.
 * @return {boolean} true für einfache Objekte.
 */
function isPlainObject( value ) {
	return (
		typeof value === 'object' && value !== null && ! Array.isArray( value )
	);
}

/**
 * Erzeugt gescoptes CSS für eine Blockinstanz.
 *
 * @param {unknown}      uniqueId   Block-ID (Klasse `cf65-<id>`).
 * @param {StyleEntry[]} map        Style-Map aus block.json.
 * @param {Object}       attributes Block-Attribute (unvertrauenswürdig).
 * @return {string} CSS oder leerer String.
 */
export function generateCss( uniqueId, map, attributes ) {
	const id = sanitizeUniqueId( uniqueId );
	if ( ! id || ! Array.isArray( map ) || ! isPlainObject( attributes ) ) {
		return '';
	}

	// buckets[device][state] = Map<Ziel-Selektor, string[]>
	const buckets = {};
	for ( const { key } of DEVICES ) {
		buckets[ key ] = { normal: new Map(), hover: new Map() };
	}

	for ( const entry of map ) {
		if (
			! isPlainObject( entry ) ||
			typeof entry.attr !== 'string' ||
			typeof entry.property !== 'string' ||
			! PROPERTY.test( entry.property )
		) {
			continue;
		}
		const selector = entry.selector ?? '';
		if (
			typeof selector !== 'string' ||
			! SELECTOR_SUFFIX.test( selector )
		) {
			continue;
		}
		const state = entry.state === 'hover' ? 'hover' : 'normal';
		let target = selector;
		if ( state === 'hover' ) {
			target =
				entry.hoverScope === 'selector' && selector !== ''
					? `${ selector }:hover`
					: `:hover${ selector }`;
		}
		// `boost`: Klasse dreifach (Spezifität 0,3,0) – z. B. gegen die
		// Abstandsregeln der WordPress-Layouts (`… > :first-child`).
		if ( entry.boost === true ) {
			target = `.cf65-${ id }.cf65-${ id }${ target }`;
		}
		const deviceVar =
			entry.deviceVar === true && entry.property.startsWith( '--' );
		const raw = Object.prototype.hasOwnProperty.call(
			attributes,
			entry.attr
		)
			? attributes[ entry.attr ]
			: undefined;

		for ( const { key } of DEVICES ) {
			let value;
			if ( entry.responsive ) {
				value =
					isPlainObject( raw ) &&
					Object.prototype.hasOwnProperty.call( raw, key )
						? raw[ key ]
						: undefined;
			} else {
				value = key === 'desktop' ? raw : undefined;
			}
			const clean = sanitizeValue( entry, value );
			if ( clean === null ) {
				continue;
			}
			const property =
				deviceVar && key !== 'desktop'
					? `${ entry.property }-${ key }`
					: entry.property;
			const bucket = buckets[ key ][ state ];
			if ( ! bucket.has( target ) ) {
				bucket.set( target, [] );
			}
			bucket.get( target ).push( `${ property }:${ clean }` );
		}
	}

	let css = '';
	for ( const { key, media } of DEVICES ) {
		let rules = '';
		for ( const state of STATES ) {
			for ( const [ target, declarations ] of buckets[ key ][ state ] ) {
				rules += `.cf65-${ id }${ target }{${ declarations.join(
					';'
				) }}`;
			}
		}
		if ( rules ) {
			css += media ? `@media ${ media }{${ rules }}` : rules;
		}
	}
	return css;
}
