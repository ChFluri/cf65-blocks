/**
 * Hook: CSS einer Blockinstanz im Editor (memoisiert).
 *
 * Im Debug-Modus (`window.cf65BlocksConfig.debug`, nur für Admins) wird
 * jede Neuberechnung mit `performance.measure` erfasst
 * (DevTools → Performance bzw. `performance.getEntriesByName`).
 */
import { useMemo } from '@wordpress/element';

import { generateCss } from './generator';

export const MEASURE_NAME = 'cf65-css';

/**
 * @return {boolean} true, wenn der Debug-Modus für den Editor aktiv ist.
 */
function isDebug() {
	return globalThis.window?.cf65BlocksConfig?.debug === true;
}

/**
 * Erzeugt CSS und misst die Dauer im Debug-Modus.
 *
 * @param {unknown}  uniqueId   Block-ID.
 * @param {Object[]} map        Style-Map aus block.json.
 * @param {Object}   attributes Block-Attribute.
 * @return {string} CSS.
 */
export function measuredCss( uniqueId, map, attributes ) {
	if ( ! isDebug() || typeof performance?.mark !== 'function' ) {
		return generateCss( uniqueId, map, attributes );
	}
	const start = performance.now();
	const css = generateCss( uniqueId, map, attributes );
	performance.measure( MEASURE_NAME, {
		start,
		end: performance.now(),
		detail: { uniqueId, bytes: css.length },
	} );
	return css;
}

/**
 * @param {unknown}  uniqueId   Block-ID.
 * @param {Object[]} map        Style-Map aus block.json.
 * @param {Object}   attributes Block-Attribute.
 * @return {string} CSS.
 */
export default function useBlockCss( uniqueId, map, attributes ) {
	return useMemo(
		() => measuredCss( uniqueId, map, attributes ),
		[ uniqueId, map, attributes ]
	);
}
