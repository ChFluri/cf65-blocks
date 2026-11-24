import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	PanelColorSettings,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, Placeholder, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveLength from '../../components/responsive-length';
import { AlignmentPanel } from '../../components/text-style-panels';
import { withBinding } from '../../dynamic/binding';
import DynamicControl from '../../dynamic/dynamic-control';
import { useDynamicPreview } from '../../dynamic/hooks';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import { IMAGE_SCHEMES, sanitizeUrl } from '../../security/sanitize';
import useBlockCss from '../../styles/use-block-css';
import { withPanels } from '../../extensions/panels/definitions';
import metadata from './block.json';
import { CAPTION_CLASS, hasDynamicUrl, positiveInt } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;
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

/**
 * Anzuzeigendes Bild: dynamischer Vorschauwert, sonst das statische Bild.
 *
 * @param {Object} attributes Attribute.
 * @param {Object} preview    Vorschau-Zustand.
 * @return {{src: string|null, alt: string, width: number|undefined, height: number|undefined}} Bild.
 */
function displayedImage( attributes, preview ) {
	const value = preview.status === 'ready' ? preview.value : null;
	const dynamicSrc = sanitizeUrl( value?.url, IMAGE_SCHEMES );
	if ( dynamicSrc ) {
		const sized = value.width > 0 && value.height > 0;
		return {
			src: dynamicSrc,
			alt: value.alt || ( attributes.alt ?? '' ),
			width: sized ? value.width : undefined,
			height: sized ? value.height : undefined,
		};
	}
	return {
		src: sanitizeUrl( attributes.url, IMAGE_SCHEMES ),
		alt: attributes.alt ?? '',
		width: positiveInt( attributes.width ),
		height: positiveInt( attributes.height ),
	};
}

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	context,
} ) {
	const { uniqueId, id, url, alt, caption } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'image', uniqueId ),
	} );
	const isDynamic = hasDynamicUrl( attributes );
	const preview = useDynamicPreview(
		attributes.dynamic?.url,
		'image',
		context
	);
	const image = displayedImage( attributes, preview );
	const props = { attributes, setAttributes };

	const onSelect = ( media ) => setAttributes( mediaAttributes( media ) );
	const onSelectURL = ( next ) =>
		setAttributes( {
			id: undefined,
			url: next,
			width: undefined,
			height: undefined,
		} );

	const dynamicControl = (
		<DynamicControl
			kind="image"
			binding={ attributes.dynamic?.url }
			postType={ context?.postType }
			onChange={ ( next ) =>
				setAttributes( {
					dynamic: withBinding( attributes.dynamic, 'url', next ),
				} )
			}
		/>
	);

	const inspector = (
		<InspectorControls>
			<InspectorTabs
				layout={
					<>
						<PanelBody title={ __( 'Bild', 'cf65-blocks' ) }>
							{ dynamicControl }
							<TextareaControl
								__nextHasNoMarginBottom
								label={ __( 'Alternativtext', 'cf65-blocks' ) }
								help={
									isDynamic
										? __(
												'Bei dynamischen Bildern gilt der Alternativtext aus der Mediathek; dieser Text nur, wenn dort keiner hinterlegt ist.',
												'cf65-blocks'
											)
										: __(
												'Beschreibt das Bild für Screenreader. Leer lassen, wenn das Bild rein dekorativ ist.',
												'cf65-blocks'
											)
								}
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
	);

	if ( ! image.src && ! isDynamic ) {
		return (
			<>
				{ inspector }
				<div { ...blockProps }>
					<MediaPlaceholder
						icon="format-image"
						labels={ {
							title: __( 'Bild', 'cf65-blocks' ),
							instructions: __(
								'Bild hochladen, aus der Mediathek wählen oder URL einfügen. Für ein Bild aus dem Beitrag: Seitenleiste → Dynamischer Wert.',
								'cf65-blocks'
							),
						} }
						accept="image/*"
						allowedTypes={ ALLOWED_TYPES }
						onSelect={ onSelect }
						onSelectURL={ onSelectURL }
					/>
				</div>
			</>
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
					name={
						isDynamic
							? __( 'Fallback-Bild', 'cf65-blocks' )
							: __( 'Ersetzen', 'cf65-blocks' )
					}
				/>
			</BlockControls>

			{ inspector }

			{ css && <style>{ css }</style> }
			<figure { ...blockProps }>
				{ image.src ? (
					<img
						src={ image.src }
						alt={ image.alt }
						width={ image.width }
						height={ image.height }
					/>
				) : (
					<Placeholder
						icon="database"
						label={ __( 'Dynamisches Bild', 'cf65-blocks' ) }
						instructions={
							preview.status === 'loading'
								? __( 'Vorschau wird geladen …', 'cf65-blocks' )
								: __(
										'Keine Vorschau verfügbar, z. B. ohne Beitragsbild oder in einem Template. Im Frontend erscheint das Bild des jeweiligen Beitrags.',
										'cf65-blocks'
									)
						}
					/>
				) }
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
