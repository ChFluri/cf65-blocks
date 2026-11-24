import {
	InspectorControls,
	PanelColorSettings,
	RichText,
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
import IconPicker from '../../icons/icon-picker';
import { IconSlot } from '../../icons/library';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { TEXT_CLASS } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const JUSTIFY_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: 'flex-start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'flex-end' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, icon, content } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'icon-label', uniqueId ),
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Icon', 'cf65-blocks' ) }>
							<IconPicker
								label={ __( 'Icon', 'cf65-blocks' ) }
								value={ icon }
								onChange={ ( next ) =>
									setAttributes( { icon: next } )
								}
							/>
							<ResponsiveControl
								label={ __( 'Ausrichtung', 'cf65-blocks' ) }
								value={ attributes.justify }
								onChange={ ( next ) =>
									setAttributes( { justify: next } )
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
										options={ JUSTIFY_OPTIONS }
										onChange={ onChange }
									/>
								) }
							</ResponsiveControl>
							<LengthControl
								label={ __(
									'Abstand Icon – Text',
									'cf65-blocks'
								) }
								value={ attributes.gap }
								onChange={ ( next ) =>
									setAttributes( { gap: next } )
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
			<div { ...blockProps }>
				<IconSlot name={ icon } edit />
				<RichText
					identifier="content"
					tagName="span"
					className={ TEXT_CLASS }
					value={ content }
					onChange={ ( next ) => setAttributes( { content: next } ) }
					placeholder={ __( 'Text eingeben …', 'cf65-blocks' ) }
				/>
			</div>
		</>
	);
}
