import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveLength from '../../components/responsive-length';
import { AlignmentPanel } from '../../components/text-style-panels';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import IconPicker from '../../icons/icon-picker';
import { IconSlot } from '../../icons/library';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, icon, label } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'icon', uniqueId ),
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<>
							<PanelBody title={ __( 'Icon', 'cf65-blocks' ) }>
								<IconPicker
									label={ __( 'Icon', 'cf65-blocks' ) }
									value={ icon }
									onChange={ ( next ) =>
										setAttributes( { icon: next } )
									}
								/>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __(
										'Beschriftung für Screenreader',
										'cf65-blocks'
									) }
									help={ __(
										'Leer lassen, wenn das Icon nur Dekoration ist.',
										'cf65-blocks'
									) }
									value={ label ?? '' }
									onChange={ ( next ) =>
										setAttributes( { label: next } )
									}
								/>
							</PanelBody>
							<AlignmentPanel { ...props } justify={ false } />
						</>
					}
					style={
						<>
							<PanelBody title={ __( 'Grösse', 'cf65-blocks' ) }>
								<ResponsiveLength
									{ ...props }
									attribute="size"
									label={ __( 'Grösse', 'cf65-blocks' ) }
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Icon', 'cf65-blocks' ),
										value: attributes.color,
										onChange: ( next ) =>
											setAttributes( { color: next } ),
									},
									{
										label: __(
											'Icon (Hover)',
											'cf65-blocks'
										),
										value: attributes.colorHover,
										onChange: ( next ) =>
											setAttributes( {
												colorHover: next,
											} ),
									},
									{
										label: __( 'Form', 'cf65-blocks' ),
										value: attributes.shapeColor,
										onChange: ( next ) =>
											setAttributes( {
												shapeColor: next,
											} ),
									},
								] }
							/>
							<PanelBody
								title={ __( 'Hintergrundform', 'cf65-blocks' ) }
							>
								<LengthControl
									label={ __(
										'Innenabstand',
										'cf65-blocks'
									) }
									value={ attributes.shapePadding }
									onChange={ ( next ) =>
										setAttributes( { shapePadding: next } )
									}
								/>
								<LengthControl
									label={ __( 'Eckenradius', 'cf65-blocks' ) }
									value={ attributes.shapeRadius }
									onChange={ ( next ) =>
										setAttributes( { shapeRadius: next } )
									}
								/>
							</PanelBody>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...blockProps }>
				<IconSlot name={ icon } label={ label } edit />
			</div>
		</>
	);
}
