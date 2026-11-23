import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import deprecated from './deprecated';
import save from './save';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	deprecated,
} );
