import { createBlock, registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import deprecated from './deprecated';
import save from './save';
import './style.scss';

/**
 * @param {Object} attributes Quell-Attribute.
 * @return {Object} Gemeinsame Text-Attribute (ohne uniqueId).
 */
const shared = ( attributes ) => ( {
	content: attributes.content,
	textAlign: attributes.textAlign,
	fontSize: attributes.fontSize,
	textColor: attributes.textColor,
	textColorHover: attributes.textColorHover,
	anchor: attributes.anchor,
	className: attributes.className,
} );

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	deprecated,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'cf65/text', 'cf65/heading' ],
				transform: ( attributes ) =>
					createBlock( 'cf65/subtitle', shared( attributes ) ),
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'cf65/text' ],
				transform: ( attributes ) =>
					createBlock( 'cf65/text', shared( attributes ) ),
			},
			{
				type: 'block',
				blocks: [ 'cf65/heading' ],
				transform: ( attributes ) =>
					createBlock( 'cf65/heading', shared( attributes ) ),
			},
		],
	},
} );
