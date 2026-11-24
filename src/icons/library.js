/**
 * Mitgelieferte Icons (includes/Icons/icons.json, erzeugt von bin/icons.mjs).
 *
 * Im Editor rendert `IconSvg` dasselbe SVG wie IconLibrary::svg() auf dem
 * Server. Gespeichert wird nur der Platzhalter `IconSlot` (ohne SVG).
 */
import data from '../../includes/Icons/icons.json';

export const ICONS = data.icons;
export const SLOT_CLASS = 'cf65-icon-slot';

const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VIEW_BOX = /^0 0 [1-9]\d{0,3} [1-9]\d{0,3}$/;
export const DEFAULT_VIEW_BOX = '0 0 24 24';

/**
 * viewBox eines Icons (wie IconLibrary::view_box()).
 *
 * @param {unknown} value Wert aus icons.json.
 * @return {string} viewBox.
 */
export function viewBox( value ) {
	return typeof value === 'string' && VIEW_BOX.test( value )
		? value
		: DEFAULT_VIEW_BOX;
}
const ALLOWED = {
	path: [ 'd' ],
	circle: [ 'cx', 'cy', 'r' ],
	ellipse: [ 'cx', 'cy', 'rx', 'ry' ],
	rect: [ 'x', 'y', 'width', 'height', 'rx', 'ry' ],
	line: [ 'x1', 'y1', 'x2', 'y2' ],
	polyline: [ 'points' ],
	polygon: [ 'points' ],
};

/**
 * @param {unknown} name Icon-Name.
 * @return {boolean} true, wenn das Icon existiert.
 */
export function hasIcon( name ) {
	return (
		typeof name === 'string' &&
		NAME.test( name ) &&
		Object.prototype.hasOwnProperty.call( ICONS, name )
	);
}

/**
 * Anzeigename eines Icons (Marken: Name, sonst Kennung).
 *
 * @param {string} name Icon-Name.
 * @return {string} Name.
 */
export function iconLabel( name ) {
	return ICONS[ name ]?.l ?? name;
}

/**
 * Icons einer Gruppe, optional gefiltert.
 *
 * @param {'general'|'brands'} group  Gruppe.
 * @param {string}             [term] Suchbegriff.
 * @return {string[]} Namen.
 */
export function iconNames( group, term = '' ) {
	const query = term.trim().toLowerCase();
	return Object.keys( ICONS ).filter(
		( name ) =>
			ICONS[ name ].g === group &&
			( ! query ||
				name.includes( query ) ||
				iconLabel( name ).toLowerCase().includes( query ) )
	);
}

/**
 * Inline-SVG eines Icons (dekorativ).
 *
 * @param {Object} props
 * @param {string} props.name Icon-Name.
 * @return {Element|null} SVG.
 */
export function IconSvg( { name } ) {
	if ( ! hasIcon( name ) ) {
		return null;
	}
	const icon = ICONS[ name ];
	const paint =
		icon.t === 'f'
			? { fill: 'currentColor' }
			: {
					fill: 'none',
					stroke: 'currentColor',
					strokeWidth: 2,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
				};
	return (
		<svg
			className="cf65-icon"
			viewBox={ viewBox( icon.v ) }
			aria-hidden="true"
			focusable="false"
			{ ...paint }
		>
			{ icon.e.map( ( [ tag, attrs ], index ) => {
				const Tag = ALLOWED[ tag ] ? tag : null;
				if ( ! Tag ) {
					return null;
				}
				const props = {};
				for ( const key of ALLOWED[ tag ] ) {
					if ( attrs[ key ] !== undefined ) {
						props[ key ] = attrs[ key ];
					}
				}
				return <Tag key={ index } { ...props } />;
			} ) }
		</svg>
	);
}

/**
 * Attribute des gespeicherten Platzhalters.
 *
 * @param {unknown} name    Icon-Name (leer = vom Elternblock).
 * @param {string}  [label] Beschriftung für Screenreader (leer = dekorativ).
 * @return {Object} Props für `<span>`.
 */
export function slotProps( name, label ) {
	const text = typeof label === 'string' ? label.trim() : '';
	return {
		className: SLOT_CLASS,
		'data-cf65-icon': hasIcon( name ) ? name : undefined,
		...( text
			? { role: 'img', 'aria-label': text }
			: { 'aria-hidden': 'true' } ),
	};
}

/**
 * Platzhalter: im Editor mit SVG (`preview`), gespeichert ohne.
 *
 * @param {Object}  props
 * @param {string}  [props.name]    Icon-Name.
 * @param {string}  [props.label]   Beschriftung für Screenreader.
 * @param {string}  [props.preview] Icon für die Vorschau (z. B. vom Elternblock).
 * @param {boolean} [props.edit]    Editor (SVG anzeigen).
 * @return {Element} Platzhalter.
 */
export function IconSlot( { name, label, preview, edit = false } ) {
	return (
		<span { ...slotProps( name, label ) }>
			{ edit && <IconSvg name={ hasIcon( name ) ? name : preview } /> }
		</span>
	);
}
