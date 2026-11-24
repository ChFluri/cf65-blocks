import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveControl from '../../components/responsive-control';
import ResponsiveLength from '../../components/responsive-length';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const STYLE_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Durchgezogen', 'cf65-blocks' ), value: 'solid' },
	{ label: __( 'Gestrichelt', 'cf65-blocks' ), value: 'dashed' },
	{ label: __( 'Gepunktet', 'cf65-blocks' ), value: 'dotted' },
	{ label: __( 'Doppelt', 'cf65-blocks' ), value: 'double' },
];

const ALIGN_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: '0 auto' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'auto' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'auto 0' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'divider', uniqueId ),
		role: 'separator',
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
							<ResponsiveControl
								label={ __( 'Ausrichtung', 'cf65-blocks' ) }
								value={ attributes.align }
								onChange={ ( next ) =>
									setAttributes( { align: next } )
								}
							>
								{ ( value, onChange ) => (
									<SelectControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __(
											'Ausrichtung',
											'cf65-blocks'
										) }
										hideLabelFromVision
										value={ value ?? '' }
										options={ ALIGN_OPTIONS }
										onChange={ onChange }
									/>
								) }
							</ResponsiveControl>
						</PanelBody>
					}
					style={
						<>
							<PanelBody title={ __( 'Linie', 'cf65-blocks' ) }>
								<SelectControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __( 'Stil', 'cf65-blocks' ) }
									value={ attributes.lineStyle ?? '' }
									options={ STYLE_OPTIONS }
									onChange={ ( next ) =>
										setAttributes( {
											lineStyle: next || undefined,
										} )
									}
								/>
								<LengthControl
									label={ __( 'Stärke', 'cf65-blocks' ) }
									value={ attributes.thickness }
									onChange={ ( next ) =>
										setAttributes( { thickness: next } )
									}
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Linie', 'cf65-blocks' ),
										value: attributes.color,
										onChange: ( next ) =>
											setAttributes( { color: next } ),
									},
								] }
							/>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...blockProps } />
		</>
	);
}
