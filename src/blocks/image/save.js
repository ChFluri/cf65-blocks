/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1):
 * `<figure>` + `<img>` (Klasse `wp-image-<id>`, damit WordPress im Frontend
 * srcset/sizes/loading ergänzt) + optionale `<figcaption>`. Keine
 * Inline-Styles. Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/image/ und eine `deprecated`-Definition.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { IMAGE_SCHEMES, sanitizeUrl } from '../../security/sanitize';

export const CAPTION_CLASS = 'cf65-image__caption';

/**
 * @param {unknown} value Zahl.
 * @return {number|undefined} Positive Ganzzahl oder undefined.
 */
export function positiveInt( value ) {
	return Number.isInteger( value ) && value > 0 ? value : undefined;
}

/**
 * @param {Object} attributes Block-Attribute.
 * @return {boolean} true, wenn die Bild-URL an einen dynamischen Wert gebunden ist.
 */
export function hasDynamicUrl( attributes ) {
	const binding = attributes?.dynamic?.url;
	return Boolean( binding && typeof binding === 'object' );
}

/*
 * Dynamisch gebundenes Bild ohne statische URL: `<img>` ohne `src`; der
 * Server setzt den Wert beim Rendern ein (includes/Dynamic/DynamicRenderer)
 * oder lässt den Block weg. Inhalte ohne `dynamic` bleiben byte-identisch.
 */
export default function save( { attributes } ) {
	const { uniqueId, id, url, alt, caption, width, height } = attributes;
	const src = sanitizeUrl( url, IMAGE_SCHEMES ) ?? undefined;
	if ( ! src && ! hasDynamicUrl( attributes ) ) {
		return null;
	}
	const mediaId = positiveInt( id );
	const blockProps = useBlockProps.save( {
		className: blockClassName( 'image', uniqueId ),
	} );

	return (
		<figure { ...blockProps }>
			<img
				src={ src }
				alt={ typeof alt === 'string' ? alt : '' }
				className={ mediaId ? `wp-image-${ mediaId }` : undefined }
				width={ positiveInt( width ) }
				height={ positiveInt( height ) }
			/>
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					tagName="figcaption"
					className={ CAPTION_CLASS }
					value={ caption }
				/>
			) }
		</figure>
	);
}
