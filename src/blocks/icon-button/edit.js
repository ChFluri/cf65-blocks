import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveLength from '../../components/responsive-length';
import { AlignmentPanel } from '../../components/text-style-panels';
import { withBinding } from '../../dynamic/binding';
import DynamicControl from '../../dynamic/dynamic-control';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import IconPicker from '../../icons/icon-picker';
import { IconSlot } from '../../icons/library';
import { sanitizeUrl } from '../../security/sanitize';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { LINK_CLASS } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	context,
} ) {
	const { uniqueId, icon, label, url, opensInNewTab } = attributes;
	const isDynamic = Boolean( attributes.dynamic?.url );

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'icon-button', uniqueId ),
	} );
	const urlInvalid = Boolean( url ) && sanitizeUrl( url ) === null;
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
										'Beschreibt das Ziel, z. B. „Zum Kontaktformular“. Pflicht für Barrierefreiheit.',
										'cf65-blocks'
									) }
									value={ label ?? '' }
									onChange={ ( next ) =>
										setAttributes( { label: next } )
									}
								/>
								{ ! label?.trim() && (
									<Notice
										status="warning"
										isDismissible={ false }
									>
										{ __(
											'Ohne Beschriftung ist der Link für Screenreader nicht verständlich.',
											'cf65-blocks'
										) }
									</Notice>
								) }
							</PanelBody>
							<PanelBody title={ __( 'Link', 'cf65-blocks' ) }>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									type="url"
									label={
										isDynamic
											? __(
													'Fallback-URL',
													'cf65-blocks'
												)
											: __( 'URL', 'cf65-blocks' )
									}
									value={ url ?? '' }
									onChange={ ( next ) =>
										setAttributes( {
											url: next === '' ? undefined : next,
										} )
									}
									help={
										urlInvalid
											? __(
													'Ungültige oder nicht erlaubte URL – der Link wird nicht ausgegeben.',
													'cf65-blocks'
												)
											: undefined
									}
								/>
								<DynamicControl
									kind="link"
									binding={ attributes.dynamic?.url }
									postType={ context?.postType }
									onChange={ ( next ) =>
										setAttributes( {
											dynamic: withBinding(
												attributes.dynamic,
												'url',
												next
											),
										} )
									}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'In neuem Tab öffnen',
										'cf65-blocks'
									) }
									checked={ Boolean( opensInNewTab ) }
									onChange={ ( next ) =>
										setAttributes( { opensInNewTab: next } )
									}
								/>
							</PanelBody>
							<AlignmentPanel { ...props } justify={ false } />
						</>
					}
					style={
						<>
							<PanelBody
								title={ __( 'Grösse & Form', 'cf65-blocks' ) }
							>
								<ResponsiveLength
									{ ...props }
									attribute="size"
									label={ __( 'Icon-Grösse', 'cf65-blocks' ) }
								/>
								<LengthControl
									label={ __(
										'Innenabstand',
										'cf65-blocks'
									) }
									value={ attributes.padding }
									onChange={ ( next ) =>
										setAttributes( { padding: next } )
									}
								/>
								<LengthControl
									label={ __( 'Eckenradius', 'cf65-blocks' ) }
									value={ attributes.borderRadius }
									onChange={ ( next ) =>
										setAttributes( { borderRadius: next } )
									}
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
										label: __(
											'Hintergrund',
											'cf65-blocks'
										),
										value: attributes.backgroundColor,
										onChange: ( next ) =>
											setAttributes( {
												backgroundColor: next,
											} ),
									},
									{
										label: __(
											'Hintergrund (Hover)',
											'cf65-blocks'
										),
										value: attributes.backgroundColorHover,
										onChange: ( next ) =>
											setAttributes( {
												backgroundColorHover: next,
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
				<span
					className={ LINK_CLASS }
					aria-label={ label || undefined }
				>
					<IconSlot name={ icon } edit />
				</span>
			</div>
		</>
	);
}
