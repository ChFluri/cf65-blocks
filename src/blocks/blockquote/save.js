/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<blockquote>` mit
 * Zitattext `<p>` und optionaler Quelle `<cite>`, feste Klassen, keine
 * Inline-Styles. Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/blockquote/ und eine `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export const TEXT_CLASS = 'cf65-blockquote__text';
export const CITE_CLASS = 'cf65-blockquote__cite';

export default function save( { attributes } ) {
	const { uniqueId, content, citation } = attributes;
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'blockquote', uniqueId ),
	} );

	return (
		<blockquote { ...blockProps }>
			<RichText.Content
				tagName="p"
				className={ TEXT_CLASS }
				value={ content }
			/>
			{ ! RichText.isEmpty( citation ) && (
				<RichText.Content
					tagName="cite"
					className={ CITE_CLASS }
					value={ citation }
				/>
			) }
		</blockquote>
	);
}
