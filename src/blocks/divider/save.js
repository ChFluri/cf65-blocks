/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div role="separator">`
 * statt `<hr>`, damit Theme-Stile für `hr` die Linie nicht verändern.
 * Änderungen erfordern eine neue Fixture unter tests/fixtures/blocks/divider/
 * und eine `deprecated`-Definition.
 */
import { useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'divider', attributes.uniqueId ),
				role: 'separator',
			} ) }
		/>
	);
}
