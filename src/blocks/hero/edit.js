import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import {
	HORIZONTAL_OPTIONS,
	TEXT_ALIGN_OPTIONS,
	VERTICAL_OPTIONS,
} from '../../components/options';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { INNER_CLASS } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [
	[ 'cf65/subtitle' ],
	[ 'cf65/heading', { level: 1 } ],
	[ 'cf65/text' ],
	[ 'cf65/button' ],
];

const OPACITY_OPTIONS = [
	{ label: __( 'Standard (50 %)', 'cf65-blocks' ), value: '' },
	...metadata.supports.cf65.styles
		.find( ( entry ) => entry.attr === 'overlayOpacity' )
		.values.map( ( value ) => ( {
			label: `${ Math.round( Number( value ) * 100 ) } %`,
			value,
		} ) ),
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'hero', uniqueId ),
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: INNER_CLASS },
		{ template: TEMPLATE, templateLock: false }
	);
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Hero', 'cf65-blocks' ) }>
							<ResponsiveLength
								{ ...props }
								attribute="minHeight"
								label={ __( 'Mindesthöhe', 'cf65-blocks' ) }
							/>
							<ResponsiveLength
								{ ...props }
								attribute="contentWidth"
								label={ __(
									'Maximale Inhaltsbreite',
									'cf65-blocks'
								) }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="verticalAlign"
								label={ __( 'Inhalt vertikal', 'cf65-blocks' ) }
								options={ VERTICAL_OPTIONS }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="horizontalAlign"
								label={ __(
									'Inhalt horizontal',
									'cf65-blocks'
								) }
								options={ HORIZONTAL_OPTIONS }
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
								<SelectControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __( 'Deckkraft', 'cf65-blocks' ) }
									help={ __(
										'Wirkt nur mit einer Overlay-Farbe; dunkelt das Hintergrundbild für besser lesbaren Text ab.',
										'cf65-blocks'
									) }
									value={ attributes.overlayOpacity ?? '' }
									options={ OPACITY_OPTIONS }
									onChange={ ( next ) =>
										setAttributes( {
											overlayOpacity: next || undefined,
										} )
									}
								/>
							</PanelBody>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<section { ...blockProps }>
				<div { ...innerBlocksProps } />
			</section>
		</>
	);
}
