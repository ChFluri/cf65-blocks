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
import { cloneBlock, createBlock } from '@wordpress/blocks';
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
 * Baut einen Block-Baum neu auf, falls er ungültige cf65-Blöcke enthält:
 *
 * - ungültiger cf65-Block → aus Attributen neu erzeugt (`createBlock`);
 *   `markupVersion` wird entfernt, damit die aktuelle Version gilt
 * - ungültiger Fremdblock → unverändert (samt Inhalt), kein Abstieg
 * - gültiger Block mit betroffenen Nachfahren → `cloneBlock` mit neuen
 *   InnerBlocks (verlustfrei, da seine Attribute vollständig geparst sind)
 * - sonst → unverändert
 *
 * Ersetzt wird später immer der oberste Block: Ersetzungen verschachtelter
 * Blöcke setzt der Editor (WP ≥ 6.8) beim initialen Abgleich teils zurück.
 *
 * @param {BlockLike} block Block.
 * @return {{ block: BlockLike, count: number }} (Neuer) Block und Anzahl reparierter cf65-Blöcke.
 */
export function rebuildTree( block ) {
	if ( block.isValid === false && ! isOwnBlock( block.name ) ) {
		return { block, count: 0 };
	}

	let count = 0;
	const innerBlocks = ( block.innerBlocks ?? [] ).map( ( inner ) => {
		const result = rebuildTree( inner );
		count += result.count;
		return result.block;
	} );

	if ( isBrokenOwnBlock( block ) ) {
		const { markupVersion, ...attributes } = block.attributes ?? {};
		return {
			block: createBlock( block.name, attributes, innerBlocks ),
			count: count + 1,
		};
	}
	if ( count === 0 ) {
		return { block, count };
	}
	return { block: cloneBlock( block, {}, innerBlocks ), count };
}

/**
 * Liefert die ungültigen cf65-Blöcke eines Baums (für Protokoll/Tests).
 * Unterhalb ungültiger Fremdblöcke wird nicht gesucht.
 *
 * @param {BlockLike[]} blocks Blöcke.
 * @return {BlockLike[]} Ungültige cf65-Blöcke (alle Ebenen).
 */
export function findBrokenBlocks( blocks ) {
	return blocks.flatMap( ( block ) => {
		if ( block.isValid === false && ! isOwnBlock( block.name ) ) {
			return [];
		}
		const inner = findBrokenBlocks( block.innerBlocks ?? [] );
		return isBrokenOwnBlock( block ) ? [ block, ...inner ] : inner;
	} );
}

/** Maximale Reparaturversuche pro Block der obersten Ebene. */
const MAX_ATTEMPTS = 3;

/**
 * Ersetzt alle Blöcke der obersten Ebene, die ungültige cf65-Blöcke
 * enthalten, durch ihren neu aufgebauten Baum.
 *
 * @param {Map<string, number>} [attempts] Versuche pro Block (wird fortgeschrieben).
 * @return {number} Anzahl reparierter cf65-Blöcke.
 */
export function recoverAll( attempts = new Map() ) {
	const { replaceBlock } = dispatch( blockEditorStore );
	let total = 0;
	for ( const root of select( blockEditorStore ).getBlocks() ) {
		const broken = findBrokenBlocks( [ root ] );
		if ( broken.length === 0 ) {
			continue;
		}
		const key = `${ root.name }:${
			root.attributes?.uniqueId ?? root.clientId
		}`;
		const tries = attempts.get( key ) ?? 0;
		if ( tries >= MAX_ATTEMPTS ) {
			continue;
		}
		attempts.set( key, tries + 1 );

		const { block: next, count } = rebuildTree( root );
		replaceBlock( root.clientId, next );
		total += count;
		// eslint-disable-next-line no-console
		console.info(
			`[${ NAMESPACE }] ${ count } Block/Blöcke in ${ root.name } automatisch repariert.`,
			broken.map( ( b ) => ( {
				name: b.name,
				uniqueId: b.attributes?.uniqueId,
				issues: b.validationIssues,
			} ) )
		);
	}
	return total;
}

/**
 * Startet die Überwachung. Geprüft wird nur, wenn sich die Block-Liste
 * ändert (Laden, Einfügen, Code-Editor), nicht bei jeder Texteingabe.
 *
 * Die Reparatur läuft verzögert (nach dem aktuellen Dispatch), damit die
 * Synchronisation zwischen Editor und Block-Store abgeschlossen ist und
 * die Ersetzung nicht wieder überschrieben wird. Jede weitere Änderung der
 * Block-Liste (auch durch die Reparatur selbst) löst eine erneute Prüfung
 * aus; MAX_ATTEMPTS verhindert Endlosschleifen.
 *
 * @return {() => void} Funktion zum Beenden.
 */
export function startAutoRecovery() {
	const attempts = new Map();
	let lastIds = null;
	let timer = null;

	const run = () => {
		timer = null;
		try {
			const total = recoverAll( attempts );
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
		}
	};

	const unsubscribe = subscribe( () => {
		const ids = select( blockEditorStore ).getClientIdsWithDescendants();
		if ( ids === lastIds ) {
			return;
		}
		lastIds = ids;
		if ( timer === null ) {
			timer = setTimeout( run, 0 );
		}
	}, blockEditorStore );

	return () => {
		unsubscribe();
		if ( timer !== null ) {
			clearTimeout( timer );
		}
	};
}
