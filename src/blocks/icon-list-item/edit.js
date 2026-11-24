import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { blockClassName } from '../../extensions/unique-id';
import IconPicker from '../../icons/icon-picker';
import { IconSlot } from '../../icons/library';
import { TEXT_CLASS } from './save';

export default function Edit( {
	attributes,
	setAttributes,
	context,
	mergeBlocks,
	onRemove,
} ) {
	const blockProps = useBlockProps( {
		className: blockClassName( 'icon-list-item' ),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Eintrag', 'cf65-blocks' ) }>
					<IconPicker
						label={ __( 'Eigenes Icon', 'cf65-blocks' ) }
						help={ __( 'Leer: Icon der Liste.', 'cf65-blocks' ) }
						allowReset
						value={ attributes.icon }
						onChange={ ( next ) => setAttributes( { icon: next } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<li { ...blockProps }>
				<IconSlot
					name={ attributes.icon }
					preview={ context[ 'cf65/iconListIcon' ] }
					edit
				/>
				<RichText
					identifier="content"
					tagName="span"
					className={ TEXT_CLASS }
					value={ attributes.content }
					onChange={ ( next ) => setAttributes( { content: next } ) }
					onMerge={ mergeBlocks }
					onRemove={ onRemove }
					placeholder={ __( 'Eintrag …', 'cf65-blocks' ) }
				/>
			</li>
		</>
	);
}
