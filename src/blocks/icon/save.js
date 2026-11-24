/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): Wrapper + Icon-
 * Platzhalter. Das SVG wird nicht gespeichert (kses), sondern beim Rendern
 * eingesetzt (includes/Icons/IconRenderer). Änderungen erfordern eine neue
 * Fixture unter tests/fixtures/blocks/icon/ und eine `deprecated`-Definition.
 */
import { useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { IconSlot } from '../../icons/library';

export default function save( { attributes } ) {
	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'icon', attributes.uniqueId ),
			} ) }
		>
			<IconSlot name={ attributes.icon } label={ attributes.label } />
		</div>
	);
}
