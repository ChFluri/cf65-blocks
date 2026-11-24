import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveLength from '../../components/responsive-length';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import IconPicker from '../../icons/icon-picker';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;
const ALLOWED_BLOCKS = [ 'cf65/icon-list-item' ];
const TEMPLATE = [
	[ 'cf65/icon-list-item' ],
	[ 'cf65/icon-list-item' ],
	[ 'cf65/icon-list-item' ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'icon-list', uniqueId ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Liste', 'cf65-blocks' ) }>
							<IconPicker
								label={ __( 'Icon', 'cf65-blocks' ) }
								help={ __(
									'Gilt für alle Einträge ohne eigenes Icon.',
									'cf65-blocks'
								) }
								value={ attributes.icon }
								onChange={ ( next ) =>
									setAttributes( { icon: next } )
								}
							/>
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __(
									'Abstand zwischen Einträgen',
									'cf65-blocks'
								) }
							/>
							<LengthControl
								label={ __(
									'Abstand Icon – Text',
									'cf65-blocks'
								) }
								value={ attributes.iconGap }
								onChange={ ( next ) =>
									setAttributes( { iconGap: next } )
								}
							/>
						</PanelBody>
					}
					style={
						<>
							<PanelBody title={ __( 'Grösse', 'cf65-blocks' ) }>
								<ResponsiveLength
									{ ...props }
									attribute="iconSize"
									label={ __( 'Icon-Grösse', 'cf65-blocks' ) }
								/>
								<ResponsiveLength
									{ ...props }
									attribute="fontSize"
									label={ __(
										'Schriftgrösse',
										'cf65-blocks'
									) }
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Icon', 'cf65-blocks' ),
										value: attributes.iconColor,
										onChange: ( next ) =>
											setAttributes( {
												iconColor: next,
											} ),
									},
									{
										label: __( 'Text', 'cf65-blocks' ),
										value: attributes.textColor,
										onChange: ( next ) =>
											setAttributes( {
												textColor: next,
											} ),
									},
								] }
							/>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<ul { ...innerBlocksProps } />
		</>
	);
}
