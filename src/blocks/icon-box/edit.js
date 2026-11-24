import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import { TEXT_ALIGN_OPTIONS } from '../../components/options';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { iconBoxClassName } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [
	[ 'cf65/icon', { icon: 'star', size: { desktop: '48px' } } ],
	[ 'cf65/heading', { level: 3 } ],
	[ 'cf65/text' ],
];

const LAYOUT_OPTIONS = [
	{ label: __( 'Icon oben', 'cf65-blocks' ), value: 'stacked' },
	{ label: __( 'Icon links', 'cf65-blocks' ), value: 'side' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: iconBoxClassName( attributes ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Icon-Box', 'cf65-blocks' ) }>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Anordnung', 'cf65-blocks' ) }
								help={ __(
									'„Icon links“ gilt für den ersten Icon-Block in der Box; auf Mobilgeräten steht es weiterhin links.',
									'cf65-blocks'
								) }
								value={ attributes.layout }
								options={ LAYOUT_OPTIONS }
								onChange={ ( next ) =>
									setAttributes( { layout: next } )
								}
							/>
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
									label: __( 'Text', 'cf65-blocks' ),
									value: attributes.textColor,
									onChange: ( next ) =>
										setAttributes( { textColor: next } ),
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
