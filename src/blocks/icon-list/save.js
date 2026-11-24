/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<ul>` mit den
 * Einträgen (cf65/icon-list-item). Leere Icon-Platzhalter der Einträge füllt
 * der Server mit dem Icon der Liste (`supports.cf65.iconFallback`).
 * Änderungen erfordern eine neue Fixture unter tests/fixtures/blocks/icon-list/
 * und eine `deprecated`-Definition.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	return (
		<ul
			{ ...useBlockProps.save( {
				className: blockClassName( 'icon-list', attributes.uniqueId ),
			} ) }
		>
			<InnerBlocks.Content />
		</ul>
	);
}
