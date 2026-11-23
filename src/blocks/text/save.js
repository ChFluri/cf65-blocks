/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1):
 * nur semantisches Minimal-Markup, keine Inline-Styles, keine stilabhängigen
 * Klassen. Änderungen hier erfordern eine neue Fixture unter
 * tests/fixtures/blocks/text/ und eine `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	const { uniqueId, content } = attributes;
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'text', uniqueId ),
	} );

	return <RichText.Content { ...blockProps } tagName="p" value={ content } />;
}
