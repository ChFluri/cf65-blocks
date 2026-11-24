import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import { opacityOptions } from '../../components/opacity-options';
import { TEXT_ALIGN_OPTIONS, VERTICAL_OPTIONS } from '../../components/options';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [ [ 'cf65/heading', { level: 3 } ], [ 'cf65/text' ] ];

const OPACITY = opacityOptions(
	metadata.supports.cf65.styles,
	'overlayOpacity',
	__( 'Standard (40 %)', 'cf65-blocks' )
);
const OPACITY_HOVER = opacityOptions(
	metadata.supports.cf65.styles,
	'overlayOpacityHover',
	__( 'Wie normal', 'cf65-blocks' )
);

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'image-box', uniqueId ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );
	const props = { attributes, setAttributes };

	const opacitySelect = ( attr, label, options ) => (
		<SelectControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ label }
			value={ attributes[ attr ] ?? '' }
			options={ options }
			onChange={ ( next ) =>
				setAttributes( { [ attr ]: next || undefined } )
			}
		/>
	);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Bild-Box', 'cf65-blocks' ) }>
							<ResponsiveLength
								{ ...props }
								attribute="minHeight"
								label={ __( 'Mindesthöhe', 'cf65-blocks' ) }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="verticalAlign"
								label={ __( 'Inhalt vertikal', 'cf65-blocks' ) }
								options={ VERTICAL_OPTIONS }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="textAlign"
								label={ __( 'Textausrichtung', 'cf65-blocks' ) }
								options={ TEXT_ALIGN_OPTIONS }
							/>
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __(
									'Abstand zwischen Elementen',
									'cf65-blocks'
								) }
							/>
						</PanelBody>
					}
					style={
						<>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Text', 'cf65-blocks' ),
										value: attributes.textColor,
										onChange: ( next ) =>
											setAttributes( {
												textColor: next,
											} ),
									},
									{
										label: __( 'Overlay', 'cf65-blocks' ),
										value: attributes.overlayColor,
										onChange: ( next ) =>
											setAttributes( {
												overlayColor: next,
											} ),
									},
								] }
							/>
							<PanelBody title={ __( 'Overlay', 'cf65-blocks' ) }>
								{ opacitySelect(
									'overlayOpacity',
									__( 'Deckkraft', 'cf65-blocks' ),
									OPACITY
								) }
								{ opacitySelect(
									'overlayOpacityHover',
									__( 'Deckkraft (Hover)', 'cf65-blocks' ),
									OPACITY_HOVER
								) }
							</PanelBody>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...innerBlocksProps } />
		</>
	);
}
