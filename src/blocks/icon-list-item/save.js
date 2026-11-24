/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<li>` mit Icon-
 * Platzhalter und Text. Ohne eigenes Icon bleibt `data-cf65-icon` weg; der
 * Server setzt dann das Icon der Liste ein. Änderungen erfordern eine neue
 * Fixture unter tests/fixtures/blocks/icon-list-item/ und eine
 * `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { IconSlot } from '../../icons/library';

export const TEXT_CLASS = 'cf65-icon-list-item__text';

export default function save( { attributes } ) {
	return (
		<li
			{ ...useBlockProps.save( {
				className: blockClassName( 'icon-list-item' ),
			} ) }
		>
			<IconSlot name={ attributes.icon } />
			<RichText.Content
				tagName="span"
				className={ TEXT_CLASS }
				value={ attributes.content }
			/>
		</li>
	);
}
