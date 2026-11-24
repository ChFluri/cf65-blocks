/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<p>` mit RichText,
 * keine Inline-Styles. Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/subtitle/ und eine `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'subtitle', attributes.uniqueId ),
	} );

	return (
		<RichText.Content
			{ ...blockProps }
			tagName="p"
			value={ attributes.content }
		/>
	);
}
