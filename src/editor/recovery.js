/**
 * Automatische, verlustfreie Block-Recovery (UMSETZPLAN Kap. 2.2, Schicht 4).
 *
 * Ist ein cf65-Block beim Laden ungültig (gespeichertes HTML passt weder zur
 * aktuellen `save()`-Ausgabe noch zu einer `deprecated`-Version), wird er aus
 * seinen Kommentar-Attributen und InnerBlocks neu erzeugt. Weil cf65-Blöcke
 * keine `source`-Attribute verwenden (Schicht 2), geht dabei nichts verloren.
 *
 * Fremde Blöcke werden nie neu erzeugt (sie könnten Inhalte aus dem HTML
 * lesen); ungültige Fremdblöcke bleiben, wie sie sind.
 *
 * Abschaltbar über den PHP-Filter `cf65_blocks/auto_recovery`.
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { dispatch, select, subscribe } from '@wordpress/data';
import { _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

import { isOwnBlock, NAMESPACE } from './constants';

/**
 * @typedef {Object} BlockLike
 * @property {string}      name          Blockname.
 * @property {string}      [clientId]    Client-ID im Editor.
 * @property {boolean}     [isValid]     Ergebnis der Block-Validierung.
 * @property {Object}      attributes    Attribute (aus dem Block-Kommentar).
 * @property {BlockLike[]} [innerBlocks] Kindblöcke.
 */

/**
 * @param {BlockLike} block Block.
 * @return {boolean} true für einen ungültigen cf65-Block.
 */
export function isBrokenOwnBlock( block ) {
	return isOwnBlock( block?.name ) && block.isValid === false;
}

/**
 * Erzeugt einen ungültigen cf65-Block neu. Ungültige cf65-Nachfahren werden
 * ebenfalls neu erzeugt, alle anderen InnerBlocks unverändert übernommen.
 *
 * `markupVersion` wird entfernt, damit der neue Block die aktuelle Version
 * (Default aus block.json) erhält.
 *
 * @param {BlockLike} block Ungültiger cf65-Block.
 * @return {{ block: BlockLike, count: number }} Neuer Block und Anzahl reparierter Blöcke.
 */
export function rebuildBlock( block ) {
	let count = 1;
	const innerBlocks = ( block.innerBlocks ?? [] ).map( ( inner ) => {
		if ( ! isBrokenOwnBlock( inner ) ) {
			return inner;
		}
		const result = rebuildBlock( inner );
		count += result.count;
		return result.block;
	} );

	const { markupVersion, ...attributes } = block.attributes ?? {};
	return {
		block: createBlock( block.name, attributes, innerBlocks ),
		count,
	};
}

/**
 * Sucht ungültige cf65-Blöcke (oberste betroffene Ebene) im Baum.
 * Unterhalb ungültiger Fremdblöcke wird nicht gesucht.
 *
 * @param {BlockLike[]} blocks Blöcke.
 * @return {BlockLike[]} Zu ersetzende Blöcke.
 */
export function findBrokenBlocks( blocks ) {
	return blocks.flatMap( ( block ) => {
		if ( isBrokenOwnBlock( block ) ) {
			return [ block ];
		}
		if ( block.isValid === false ) {
			return [];
		}
		return findBrokenBlocks( block.innerBlocks ?? [] );
	} );
}

/**
 * Ersetzt alle ungültigen cf65-Blöcke im Editor.
 *
 * @return {number} Anzahl reparierter Blöcke.
 */
export function recoverAll() {
	const broken = findBrokenBlocks( select( blockEditorStore ).getBlocks() );
	const { replaceBlock } = dispatch( blockEditorStore );
	let total = 0;
	for ( const block of broken ) {
		const { block: next, count } = rebuildBlock( block );
		replaceBlock( block.clientId, next );
		total += count;
		// eslint-disable-next-line no-console
		console.info(
			`[${ NAMESPACE }] ${ block.name } automatisch repariert (${ count }).`,
			{ clientId: block.clientId, issues: block.validationIssues }
		);
	}
	return total;
}

/**
 * Startet die Überwachung. Geprüft wird nur, wenn sich die Block-Liste
 * ändert (Laden, Einfügen, Code-Editor), nicht bei jeder Texteingabe.
 *
 * @return {() => void} Funktion zum Beenden.
 */
export function startAutoRecovery() {
	let lastIds = null;
	let running = false;

	return subscribe( () => {
		const ids = select( blockEditorStore ).getClientIdsWithDescendants();
		if ( running || ids === lastIds ) {
			return;
		}
		lastIds = ids;
		running = true;
		try {
			const total = recoverAll();
			if ( total > 0 ) {
				dispatch( noticesStore ).createInfoNotice(
					sprintf(
						/* translators: %d: number of repaired blocks */
						_n(
							'%d cf65-Block wurde automatisch repariert. Bitte speichern, um die Reparatur zu übernehmen.',
							'%d cf65-Blöcke wurden automatisch repariert. Bitte speichern, um die Reparatur zu übernehmen.',
							total,
							'cf65-blocks'
						),
						total
					),
					{ type: 'snackbar', id: 'cf65-blocks-recovery' }
				);
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error(
				`[${ NAMESPACE }] Automatische Reparatur fehlgeschlagen`,
				error
			);
		} finally {
			lastIds = select( blockEditorStore ).getClientIdsWithDescendants();
			running = false;
		}
	}, blockEditorStore );
}
