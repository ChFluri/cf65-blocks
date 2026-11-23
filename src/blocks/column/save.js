/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1):
 * `<div>` mit dem Inhalt der Spalte, keine Inline-Styles. Änderungen
 * erfordern eine neue Fixture unter tests/fixtures/blocks/column/ und eine
 * `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'column', attributes.uniqueId ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
