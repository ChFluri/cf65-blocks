import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import deprecated from './deprecated';
import save from './save';
import transforms from './transforms';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	deprecated,
	transforms,
	merge: ( attributes, attributesToMerge ) => ( {
		content:
			( attributes.content ?? '' ) + ( attributesToMerge.content ?? '' ),
	} ),
} );
