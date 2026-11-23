/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1):
 * Wrapper + Link mit fester Klasse, keine Inline-Styles. Änderungen hier
 * erfordern eine neue Fixture unter tests/fixtures/blocks/button/ und eine
 * `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { sanitizeUrl } from '../../security/sanitize';

export const LINK_CLASS = 'cf65-button__link';

export default function save( { attributes } ) {
	const { uniqueId, content, url, opensInNewTab } = attributes;
	const href = sanitizeUrl( url ) ?? undefined;
	const newTab = Boolean( href && opensInNewTab );
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'button', uniqueId ),
	} );

	return (
		<div { ...blockProps }>
			<RichText.Content
				tagName="a"
				className={ LINK_CLASS }
				href={ href }
				target={ newTab ? '_blank' : undefined }
				rel={ newTab ? 'noopener' : undefined }
				value={ content }
			/>
		</div>
	);
}
