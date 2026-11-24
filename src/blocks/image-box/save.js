/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit den
 * Innenblöcken als direkten Kindern; Bild über das Panel Hintergrundbild,
 * Overlay als `::before` im CSS. Änderungen erfordern eine neue Fixture
 * unter tests/fixtures/blocks/image-box/ und eine `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'image-box', attributes.uniqueId ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
