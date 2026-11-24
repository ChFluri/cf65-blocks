/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): Wrapper, Icon-
 * Platzhalter (SVG beim Rendern) und Text. Änderungen erfordern eine neue
 * Fixture unter tests/fixtures/blocks/icon-label/ und eine
 * `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { IconSlot } from '../../icons/library';

export const TEXT_CLASS = 'cf65-icon-label__text';

export default function save( { attributes } ) {
	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'icon-label', attributes.uniqueId ),
			} ) }
		>
			<IconSlot name={ attributes.icon } />
			<RichText.Content
				tagName="span"
				className={ TEXT_CLASS }
				value={ attributes.content }
			/>
		</div>
	);
}
