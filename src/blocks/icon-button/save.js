/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): Wrapper, Link mit
 * `aria-label` und Icon-Platzhalter (SVG beim Rendern). Änderungen erfordern
 * eine neue Fixture unter tests/fixtures/blocks/icon-button/ und eine
 * `deprecated`-Definition.
 */
import { useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { IconSlot } from '../../icons/library';
import { sanitizeUrl } from '../../security/sanitize';

export const LINK_CLASS = 'cf65-icon-button__link';

export default function save( { attributes } ) {
	const { uniqueId, icon, label, url, opensInNewTab } = attributes;
	const href = sanitizeUrl( url ) ?? undefined;
	const newTab = Boolean( href && opensInNewTab );
	const text = typeof label === 'string' ? label.trim() : '';

	return (
		<div
			{ ...useBlockProps.save( {
				className: blockClassName( 'icon-button', uniqueId ),
			} ) }
		>
			{ /* eslint-disable-next-line react/jsx-no-target-blank -- rel="noopener" genügt; der Referrer bleibt bewusst erhalten (wie bei cf65/button). */ }
			<a
				className={ LINK_CLASS }
				href={ href }
				target={ newTab ? '_blank' : undefined }
				rel={ newTab ? 'noopener' : undefined }
				aria-label={ text || undefined }
			>
				<IconSlot name={ icon } />
			</a>
		</div>
	);
}
