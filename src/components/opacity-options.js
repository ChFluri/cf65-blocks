/**
 * Deckkraft-Auswahl aus den erlaubten Werten einer Style-Map-Zeile.
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * @param {Array<Object>} styles      `supports.cf65.styles` aus block.json.
 * @param {string}        attr        Attributname.
 * @param {string}        defaultText Beschriftung für „Standard“.
 * @return {Array<{label: string, value: string}>} Optionen ('' = Standard).
 */
export function opacityOptions( styles, attr, defaultText ) {
	const entry = styles.find( ( item ) => item.attr === attr );
	return [
		{ label: defaultText, value: '' },
		...( entry?.values ?? [] ).map( ( value ) => ( {
			label: sprintf(
				/* translators: %d: Deckkraft in Prozent. */
				__( '%d %%', 'cf65-blocks' ),
				Math.round( Number( value ) * 100 )
			),
			value,
		} ) ),
	];
}
