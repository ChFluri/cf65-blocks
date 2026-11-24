/**
 * Zahl in einem Text erkennen und für das Hochzählen formatieren.
 *
 * Erkannt wird die erste Zahl im Text, z. B. „250+“, „98 %“, „CHF 1'200“,
 * „4,5“. Tausendertrennzeichen (' ’ . , Leerzeichen) bleiben erhalten;
 * ein einzelnes „.“ oder „,“ ohne genau drei Folgeziffern gilt als
 * Dezimaltrennzeichen.
 */

const NUMBER = /\d(?:[\d'’., ]*\d)?/;

/**
 * @param {string} text Text.
 * @return {{ before: string, after: string, value: number, decimals: number, decimalSep: string, groupSep: string }|null} Teile oder null.
 */
export function parseNumber( text ) {
	const match = NUMBER.exec( text );
	if ( ! match ) {
		return null;
	}
	const raw = match[ 0 ];
	const separators = raw.replace( /\d/g, '' );
	let decimalSep = '';
	let decimals = 0;
	const last = separators.at( -1 );
	if (
		( last === '.' || last === ',' ) &&
		separators.indexOf( last ) === separators.length - 1
	) {
		const tail = raw.slice( raw.lastIndexOf( last ) + 1 );
		if ( tail.length !== 3 || separators.length > 1 ) {
			decimalSep = last;
			decimals = tail.length;
		}
	}
	const intPart = decimalSep
		? raw.slice( 0, raw.lastIndexOf( decimalSep ) )
		: raw;
	const digits = intPart.replace( /\D/g, '' );
	const fraction = decimalSep
		? raw.slice( raw.lastIndexOf( decimalSep ) + 1 )
		: '';
	const value = Number( `${ digits }.${ fraction || '0' }` );
	if ( ! Number.isFinite( value ) ) {
		return null;
	}
	const groupSep = intPart.replace( /\d/g, '' ).charAt( 0 );
	return {
		before: text.slice( 0, match.index ),
		after: text.slice( match.index + raw.length ),
		value,
		decimals,
		decimalSep,
		groupSep,
	};
}

/**
 * @param {number}                                                     value Wert.
 * @param {{ decimals: number, decimalSep: string, groupSep: string }} parts Format aus parseNumber.
 * @return {string} Formatierte Zahl.
 */
export function formatNumber( value, { decimals, decimalSep, groupSep } ) {
	const [ int, fraction ] = value.toFixed( decimals ).split( '.' );
	const grouped = groupSep
		? int.replace( /\B(?=(\d{3})+(?!\d))/g, groupSep )
		: int;
	return fraction ? `${ grouped }${ decimalSep }${ fraction }` : grouped;
}
