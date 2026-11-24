import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import { TEXT_ALIGN_OPTIONS } from '../../components/options';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { BADGE_CLASS, badgeText, pricingBoxClassName } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [
	[ 'cf65/heading', { level: 3 } ],
	[ 'cf65/price' ],
	[ 'cf65/text' ],
	[
		'cf65/icon-list',
		{},
		[
			[ 'cf65/icon-list-item' ],
			[ 'cf65/icon-list-item' ],
			[ 'cf65/icon-list-item' ],
		],
	],
	[ 'cf65/button' ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, featured } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: pricingBoxClassName( attributes ),
	} );
	const { children, ...innerProps } = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );
	const props = { attributes, setAttributes };
	const badge = badgeText( attributes );

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Preis-Box', 'cf65-blocks' ) }>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Hervorheben', 'cf65-blocks' ) }
								help={ __(
									'Rahmen in der Akzentfarbe und Badge oben, z. B. für den empfohlenen Tarif.',
									'cf65-blocks'
								) }
								checked={ featured }
								onChange={ ( next ) =>
									setAttributes( { featured: next } )
								}
							/>
							{ featured && (
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __( 'Badge-Text', 'cf65-blocks' ) }
									help={ __(
										'Leer = kein Badge.',
										'cf65-blocks'
									) }
									value={ attributes.badge }
									onChange={ ( next ) =>
										setAttributes( { badge: next } )
									}
								/>
							) }
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __(
									'Abstand zwischen Elementen',
									'cf65-blocks'
								) }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="textAlign"
								label={ __( 'Textausrichtung', 'cf65-blocks' ) }
								options={ TEXT_ALIGN_OPTIONS }
							/>
						</PanelBody>
					}
					style={
						<PanelColorSettings
							title={ __( 'Farben', 'cf65-blocks' ) }
							colorSettings={ [
								{
									label: __( 'Akzent', 'cf65-blocks' ),
									value: attributes.accentColor,
									onChange: ( next ) =>
										setAttributes( { accentColor: next } ),
								},
								{
									label: __( 'Badge-Text', 'cf65-blocks' ),
									value: attributes.badgeTextColor,
									onChange: ( next ) =>
										setAttributes( {
											badgeTextColor: next,
										} ),
								},
							] }
						/>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...innerProps }>
				{ badge && <span className={ BADGE_CLASS }>{ badge }</span> }
				{ children }
			</div>
		</>
	);
}
