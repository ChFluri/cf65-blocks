/**
 * Umwandlungen Absatz ↔ cf65/text ↔ cf65/heading.
 *
 * Die uniqueId wird bewusst nicht übernommen: der neue Block vergibt im
 * Editor selbst eine (useUniqueId).
 */
import { createBlock } from '@wordpress/blocks';

/**
 * @param {Object} attributes Quell-Attribute.
 * @return {Object} Übertragbare Stil-Attribute.
 */
function styleAttributes( attributes ) {
	const { textAlign, fontSize, textColor, textColorHover } = attributes;
	return { textAlign, fontSize, textColor, textColorHover };
}

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			transform: ( { content, anchor, className } ) =>
				createBlock( 'cf65/text', {
					content: String( content ?? '' ),
					anchor,
					className,
				} ),
		},
		{
			type: 'block',
			blocks: [ 'cf65/heading' ],
			transform: ( attributes ) =>
				createBlock( 'cf65/text', {
					...styleAttributes( attributes ),
					content: attributes.content,
					anchor: attributes.anchor,
					className: attributes.className,
				} ),
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			transform: ( { content, anchor, className } ) =>
				createBlock( 'core/paragraph', { content, anchor, className } ),
		},
		{
			type: 'block',
			blocks: [ 'cf65/heading' ],
			transform: ( attributes ) =>
				createBlock( 'cf65/heading', {
					...styleAttributes( attributes ),
					content: attributes.content,
					anchor: attributes.anchor,
					className: attributes.className,
				} ),
		},
	],
};

export default transforms;
