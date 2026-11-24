/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): leeres `<div>`,
 * für Screenreader ausgeblendet. Änderungen erfordern eine neue Fixture
 * unter tests/fixtures/blocks/spacer/ und eine `deprecated`-Definition.
 */
import { useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'spacer', attributes.uniqueId ),
				'aria-hidden': 'true',
			} ) }
		/>
	);
}
