/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div>` mit der Zahl
 * (`<p class="cf65-number-box__number">`, optional `data-cf65-count-up`)
 * und den Innenblöcken. Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/number-box/ und eine `deprecated`-Definition.
 */
import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const NUMBER_CLASS = 'cf65-number-box__number';

export default function save( { attributes } ) {
	const { uniqueId, number, countUp } = attributes;
	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'number-box', uniqueId ),
			} ) }
		>
			<RichText.Content
				tagName="p"
				className={ NUMBER_CLASS }
				value={ number }
				data-cf65-count-up={ countUp ? '' : undefined }
			/>
			<InnerBlocks.Content />
		</div>
	);
}
