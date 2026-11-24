/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit zwei
 * cf65/column (Bild, Inhalt) als direkten Kindern; `is-reversed` stellt das
 * Bild auf Desktop/Tablet nach rechts. Änderungen erfordern eine neue
 * Fixture unter tests/fixtures/blocks/feature/ und eine
 * `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const REVERSED_CLASS = 'is-reversed';

/**
 * Klassen des Wrappers.
 *
 * @param {Object} attributes Block-Attribute.
 * @return {string} Klassen.
 */
export function featureClassName( attributes ) {
	const base = blockClassName( 'feature', attributes.uniqueId );
	return attributes.reversed ? `${ base } ${ REVERSED_CLASS }` : base;
}

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: featureClassName( attributes ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
