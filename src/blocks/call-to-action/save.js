/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit den
 * Innenblöcken als direkten Kindern; `is-layout-inline` stellt Buttons
 * rechts neben den übrigen Inhalt. Änderungen erfordern eine neue Fixture
 * unter tests/fixtures/blocks/call-to-action/ und eine
 * `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const INLINE_CLASS = 'is-layout-inline';

/**
 * Klassen des Wrappers.
 *
 * @param {Object} attributes Block-Attribute.
 * @return {string} Klassen.
 */
export function ctaClassName( attributes ) {
	const base = blockClassName( 'call-to-action', attributes.uniqueId );
	return attributes.layout === 'inline'
		? `${ base } ${ INLINE_CLASS }`
		: base;
}

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: ctaClassName( attributes ),
	} );
	return <div { ...useInnerBlocksProps.save( blockProps ) } />;
}
