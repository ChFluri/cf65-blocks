/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<section>` mit
 * innerem Wrapper (begrenzte Inhaltsbreite) und den Innenblöcken. Das
 * Overlay ist ein `::before` im CSS, nicht im Markup. Änderungen erfordern
 * eine neue Fixture unter tests/fixtures/blocks/hero/ und eine
 * `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const INNER_CLASS = 'cf65-hero__inner';

export default function save( { attributes } ) {
	return (
		<section
			{ ...useBlockProps.save( {
				className: blockClassName( 'hero', attributes.uniqueId ),
			} ) }
		>
			<div
				{ ...useInnerBlocksProps.save( { className: INNER_CLASS } ) }
			/>
		</section>
	);
}
