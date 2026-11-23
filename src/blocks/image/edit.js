import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	PanelColorSettings,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveLength from '../../components/responsive-length';
import { AlignmentPanel } from '../../components/text-style-panels';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import { IMAGE_SCHEMES, sanitizeUrl } from '../../security/sanitize';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { CAPTION_CLASS, positiveInt } from './save';

const STYLE_MAP = metadata.supports.cf65.styles;
const ALLOWED_TYPES = [ 'image' ];

/**
 * Attribute aus einem Mediathek-Objekt.
 *
 * @param {Object} media Auswahl aus der Mediathek oder Upload.
 * @return {Object} Attribute.
 */
function mediaAttributes( media ) {
	return {
		id: positiveInt( media?.id ),
		url: media?.url,
		alt: typeof media?.alt === 'string' ? media.alt : '',
		width: positiveInt( media?.width ?? media?.media_details?.width ),
		height: positiveInt( media?.height ?? media?.media_details?.height ),
	};
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, id, url, alt, caption, width, height } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'image', uniqueId ),
	} );
	const src = sanitizeUrl( url, IMAGE_SCHEMES );
	const props = { attributes, setAttributes };

	const onSelect = ( media ) => setAttributes( mediaAttributes( media ) );
	const onSelectURL = ( next ) =>
		setAttributes( {
			id: undefined,
			url: next,
			width: undefined,
			height: undefined,
		} );

	if ( ! src ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="format-image"
					labels={ {
						title: __( 'Bild', 'cf65-blocks' ),
						instructions: __(
							'Bild hochladen, aus der Mediathek wählen oder URL einfügen.',
							'cf65-blocks'
						),
					} }
					accept="image/*"
					allowedTypes={ ALLOWED_TYPES }
					onSelect={ onSelect }
					onSelectURL={ onSelectURL }
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={ id }
					mediaURL={ url }
					accept="image/*"
					allowedTypes={ ALLOWED_TYPES }
					onSelect={ onSelect }
					onSelectURL={ onSelectURL }
					name={ __( 'Ersetzen', 'cf65-blocks' ) }
				/>
			</BlockControls>

			<InspectorControls>
				<InspectorTabs
					layout={
						<>
							<PanelBody title={ __( 'Bild', 'cf65-blocks' ) }>
								<TextareaControl
									__nextHasNoMarginBottom
									label={ __(
										'Alternativtext',
										'cf65-blocks'
									) }
									help={ __(
										'Beschreibt das Bild für Screenreader. Leer lassen, wenn das Bild rein dekorativ ist.',
										'cf65-blocks'
									) }
									value={ alt ?? '' }
									onChange={ ( next ) =>
										setAttributes( { alt: next } )
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
									attribute="imageWidth"
									label={ __( 'Breite', 'cf65-blocks' ) }
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
										label: __(
											'Bildunterschrift',
											'cf65-blocks'
										),
										value: attributes.captionColor,
										onChange: ( next ) =>
											setAttributes( {
												captionColor: next,
											} ),
									},
								] }
							/>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<figure { ...blockProps }>
				<img
					src={ src }
					alt={ alt ?? '' }
					width={ positiveInt( width ) }
					height={ positiveInt( height ) }
				/>
				<RichText
					identifier="caption"
					tagName="figcaption"
					className={ CAPTION_CLASS }
					value={ caption }
					onChange={ ( next ) => setAttributes( { caption: next } ) }
					placeholder={ __(
						'Bildunterschrift hinzufügen …',
						'cf65-blocks'
					) }
				/>
			</figure>
		</>
	);
}
