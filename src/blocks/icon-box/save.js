/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit den
 * Innenblöcken als direkten Kindern; `is-layout-side` stellt das Icon
 * (cf65/icon) links neben den übrigen Inhalt. Änderungen erfordern eine
 * neue Fixture unter tests/fixtures/blocks/icon-box/ und eine
 * `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const SIDE_CLASS = 'is-layout-side';

/**
 * Klassen des Wrappers.
 *
 * @param {Object} attributes Block-Attribute.
 * @return {string} Klassen.
 */
export function iconBoxClassName( attributes ) {
	const base = blockClassName( 'icon-box', attributes.uniqueId );
	return attributes.layout === 'side' ? `${ base } ${ SIDE_CLASS }` : base;
}

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: iconBoxClassName( attributes ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
