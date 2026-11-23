/**
 * Stabile Block-ID (`uniqueId`) für gescoptes CSS (`.cf65-<id>`).
 *
 * - Neue Blöcke erhalten beim ersten Rendern eine ID.
 * - Duplizierte/kopierte Blöcke (gleiche ID wie ein früherer Block im
 *   Dokument) erhalten eine neue ID; das Original behält seine.
 * - Die Änderung erzeugt keinen eigenen Undo-Schritt.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

import { sanitizeUniqueId } from '../security/sanitize';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * @param {number} [length=8] Länge der ID.
 * @return {string} Zufällige ID aus [a-z0-9].
 */
export function generateUniqueId( length = 8 ) {
	const bytes = new Uint8Array( length );
	globalThis.crypto.getRandomValues( bytes );
	return Array.from(
		bytes,
		( byte ) => ALPHABET[ byte % ALPHABET.length ]
	).join( '' );
}

/**
 * Klassen des Markup-Vertrags: `cf65-block cf65-<name> cf65-<id>`.
 *
 * @param {string}  blockSlug Kurzname, z. B. `heading`.
 * @param {unknown} uniqueId  Block-ID.
 * @return {string} Klassenliste.
 */
export function blockClassName( blockSlug, uniqueId ) {
	const id = sanitizeUniqueId( uniqueId );
	return [ 'cf65-block', `cf65-${ blockSlug }`, id ? `cf65-${ id }` : null ]
		.filter( Boolean )
		.join( ' ' );
}

/**
 * Hook: sorgt für eine gültige, im Dokument eindeutige `uniqueId`.
 *
 * @param {string}                  clientId      Client-ID des Blocks.
 * @param {unknown}                 uniqueId      Aktuelle ID.
 * @param {(attrs: Object) => void} setAttributes Setter des Blocks.
 */
export function useUniqueId( clientId, uniqueId, setAttributes ) {
	const needsNewId = useSelect(
		( select ) => {
			if ( ! sanitizeUniqueId( uniqueId ) ) {
				return true;
			}
			const { getClientIdsWithDescendants, getBlockAttributes } =
				select( blockEditorStore );
			const first = getClientIdsWithDescendants().find(
				( id ) => getBlockAttributes( id )?.uniqueId === uniqueId
			);
			return first !== undefined && first !== clientId;
		},
		[ clientId, uniqueId ]
	);

	const { __unstableMarkNextChangeAsNotPersistent: markNotPersistent } =
		useDispatch( blockEditorStore );

	useEffect( () => {
		if ( needsNewId ) {
			markNotPersistent?.();
			setAttributes( { uniqueId: generateUniqueId() } );
		}
	}, [ needsNewId, markNotPersistent, setAttributes ] );
}
