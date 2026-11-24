/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit
 * optionalem alten Preis (`<del>`), Währung, Betrag und Zeitraum als
 * `<span>`; leere Teile fehlen. Änderungen erfordern eine neue Fixture
 * unter tests/fixtures/blocks/price/ und eine `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const PART_CLASSES = {
	old: 'cf65-price__old',
	currency: 'cf65-price__currency',
	amount: 'cf65-price__amount',
	period: 'cf65-price__period',
};

/**
 * Reihenfolge der Teile (Währung vor oder nach dem Betrag).
 *
 * @param {Object} attributes Block-Attribute.
 * @return {Array<string>} Teile in Ausgabereihenfolge.
 */
export function priceParts( attributes ) {
	return attributes.currencyAfter
		? [ 'old', 'amount', 'currency', 'period' ]
		: [ 'old', 'currency', 'amount', 'period' ];
}

const ATTRIBUTE = {
	old: 'oldAmount',
	currency: 'currency',
	amount: 'amount',
	period: 'period',
};

export default function save( { attributes } ) {
	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'price', attributes.uniqueId ),
			} ) }
		>
			{ priceParts( attributes ).map( ( part ) => {
				const value = attributes[ ATTRIBUTE[ part ] ];
				if ( ! value ) {
					return null;
				}
				return (
					<RichText.Content
						key={ part }
						tagName={ part === 'old' ? 'del' : 'span' }
						className={ PART_CLASSES[ part ] }
						value={ value }
					/>
				);
			} ) }
		</div>
	);
}
