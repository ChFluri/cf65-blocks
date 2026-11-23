/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1):
 * Container-`<div>` mit den Spalten als direkten Kindern, keine
 * Inline-Styles. Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/columns/ und eine `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'columns', attributes.uniqueId ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
