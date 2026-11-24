/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit den
 * Innenblöcken; hervorgehoben mit `is-featured` und optionalem Badge
 * (`<span class="cf65-pricing-box__badge">`, reiner Text). Änderungen
 * erfordern eine neue Fixture unter tests/fixtures/blocks/pricing-box/ und
 * eine `deprecated`-Definition.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const FEATURED_CLASS = 'is-featured';
export const BADGE_CLASS = 'cf65-pricing-box__badge';

/**
 * Klassen des Wrappers.
 *
 * @param {Object} attributes Block-Attribute.
 * @return {string} Klassen.
 */
export function pricingBoxClassName( attributes ) {
	const base = blockClassName( 'pricing-box', attributes.uniqueId );
	return attributes.featured ? `${ base } ${ FEATURED_CLASS }` : base;
}

/**
 * Badge-Text, falls hervorgehoben und nicht leer.
 *
 * @param {Object} attributes Block-Attribute.
 * @return {string} Text oder ''.
 */
export function badgeText( attributes ) {
	return attributes.featured && typeof attributes.badge === 'string'
		? attributes.badge.trim()
		: '';
}

export default function save( { attributes } ) {
	const badge = badgeText( attributes );
	return (
		<div
			{ ...useBlockProps.save( {
				className: pricingBoxClassName( attributes ),
			} ) }
		>
			{ badge && <span className={ BADGE_CLASS }>{ badge }</span> }
			<InnerBlocks.Content />
		</div>
	);
}
