/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): Raster-`<div>` mit
 * den Zellen als direkten Kindern, keine Inline-Styles. Änderungen
 * erfordern eine neue Fixture unter tests/fixtures/blocks/feature-grid/ und
 * eine `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'feature-grid', attributes.uniqueId ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
