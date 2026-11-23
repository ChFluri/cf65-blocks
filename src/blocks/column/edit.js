import {
	InnerBlocks,
	InspectorControls,
	PanelColorSettings,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import ResponsiveLength from '../../components/responsive-length';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = metadata.supports.cf65.styles;

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const hasChildren = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ) > 0,
		[ clientId ]
	);

	const blockProps = useBlockProps( {
		className: blockClassName( 'column', uniqueId ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
		renderAppender: hasChildren
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Grösse', 'cf65-blocks' ) }>
							<ResponsiveLength
								{ ...props }
								attribute="width"
								label={ __( 'Breite', 'cf65-blocks' ) }
							/>
							<ResponsiveLength
								{ ...props }
								attribute="padding"
								label={ __( 'Innenabstand', 'cf65-blocks' ) }
							/>
						</PanelBody>
					}
					style={
						<PanelColorSettings
							title={ __( 'Farben', 'cf65-blocks' ) }
							colorSettings={ [
								{
									label: __( 'Hintergrund', 'cf65-blocks' ),
									value: attributes.backgroundColor,
									onChange: ( next ) =>
										setAttributes( {
											backgroundColor: next,
										} ),
								},
							] }
						/>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...innerBlocksProps } />
		</>
	);
}
