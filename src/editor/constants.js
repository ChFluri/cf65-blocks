export const NAMESPACE = 'cf65-blocks';
export const BLOCK_PREFIX = 'cf65/';

/**
 * Prüft, ob ein Blockname zu diesem Plugin gehört.
 *
 * @param {string} name Blockname, z. B. `cf65/heading`.
 * @return {boolean} true für cf65-Blöcke.
 */
export function isOwnBlock( name ) {
	return typeof name === 'string' && name.startsWith( BLOCK_PREFIX );
}
