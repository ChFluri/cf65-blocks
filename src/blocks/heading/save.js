/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1):
 * nur semantisches Minimal-Markup, keine Inline-Styles, keine stilabhängigen
 * Klassen. Änderungen hier erfordern eine neue Fixture unter
 * tests/fixtures/blocks/heading/ und eine `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

/**
 * @param {unknown} level Gespeicherte Ebene.
 * @return {number} Ebene 1–6 (Standard 2).
 */
export function safeLevel( level ) {
	return Number.isInteger( level ) && level >= 1 && level <= 6 ? level : 2;
}

export default function save( { attributes } ) {
	const { uniqueId, content, level } = attributes;
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'heading', uniqueId ),
	} );

	return (
		<RichText.Content
			{ ...blockProps }
			tagName={ `h${ safeLevel( level ) }` }
			value={ content }
		/>
	);
}
