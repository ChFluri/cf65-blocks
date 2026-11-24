/**
 * Bedienelemente der gemeinsamen Style-Panels (Werte: includes/Styles/panels.json).
 */
import {
	MediaUpload,
	MediaUploadCheck,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	Button,
	Flex,
	FlexItem,
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import LengthControl from '../../components/length-control';
import ResponsiveLength from '../../components/responsive-length';
import { withBinding } from '../../dynamic/binding';
import DynamicControl from '../../dynamic/dynamic-control';
import {
	IMAGE_SCHEMES,
	sanitizeImage,
	sanitizeUrl,
} from '../../security/sanitize';
import { PANELS } from './definitions';

/**
 * Optionen für ein Enum-Attribut aus panels.json mit Beschriftungen.
 *
 * @param {string}   panel  Panel.
 * @param {string}   attr   Attribut.
 * @param {string[]} labels Beschriftungen in der Reihenfolge der Werte.
 * @return {Array<{label: string, value: string}>} Optionen inkl. „Standard“.
 */
function enumOptions( panel, attr, labels ) {
	const entry = PANELS[ panel ].styles.find( ( item ) => item.attr === attr );
	return [
		{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
		...entry.values.map( ( value, index ) => ( {
			label: labels[ index ] ?? value,
			value,
		} ) ),
	];
}

/**
 * @param {Object}                           props
 * @param {string}                           props.label    Beschriftung.
 * @param {string}                           props.value    Wert.
 * @param {Array}                            props.options  Optionen.
 * @param {(next: string|undefined) => void} props.onChange Setter (leer → undefined).
 * @return {Element} Auswahl.
 */
function Select( { label, value, options, onChange } ) {
	return (
		<SelectControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ label }
			value={ value ?? '' }
			options={ options }
			onChange={ ( next ) => onChange( next === '' ? undefined : next ) }
		/>
	);
}

/**
 * Aussen- und Innenabstand (Tab „Layout“).
 *
 * @param {Object}                  props
 * @param {string[]}                props.panels        Aktive Panels.
 * @param {Object}                  props.attributes    Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @return {Element|null} Panel.
 */
export function SpacingPanel( { panels, attributes, setAttributes } ) {
	const props = { attributes, setAttributes };
	if ( ! panels.includes( 'margin' ) && ! panels.includes( 'padding' ) ) {
		return null;
	}
	return (
		<PanelBody
			title={ __( 'Abstände', 'cf65-blocks' ) }
			initialOpen={ false }
		>
			{ panels.includes( 'margin' ) && (
				<>
					<ResponsiveLength
						{ ...props }
						attribute="styleMarginTop"
						label={ __( 'Aussenabstand oben', 'cf65-blocks' ) }
					/>
					<ResponsiveLength
						{ ...props }
						attribute="styleMarginBottom"
						label={ __( 'Aussenabstand unten', 'cf65-blocks' ) }
					/>
				</>
			) }
			{ panels.includes( 'padding' ) && (
				<>
					<ResponsiveLength
						{ ...props }
						attribute="stylePaddingBlock"
						label={ __( 'Innenabstand vertikal', 'cf65-blocks' ) }
					/>
					<ResponsiveLength
						{ ...props }
						attribute="stylePaddingInline"
						label={ __( 'Innenabstand horizontal', 'cf65-blocks' ) }
					/>
				</>
			) }
		</PanelBody>
	);
}

/**
 * Rahmen und Eckenradius.
 *
 * @param {Object}                  props
 * @param {Object}                  props.attributes    Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @return {Element} Panels.
 */
export function BorderPanel( { attributes, setAttributes } ) {
	return (
		<>
			<PanelBody
				title={ __( 'Rahmen', 'cf65-blocks' ) }
				initialOpen={ false }
			>
				<LengthControl
					label={ __( 'Breite', 'cf65-blocks' ) }
					value={ attributes.styleBorderWidth }
					onChange={ ( next ) =>
						setAttributes( {
							styleBorderWidth: next,
							// Ohne Stil wäre eine Breite unsichtbar.
							...( next && ! attributes.styleBorderStyle
								? { styleBorderStyle: 'solid' }
								: {} ),
						} )
					}
				/>
				<Select
					label={ __( 'Stil', 'cf65-blocks' ) }
					value={ attributes.styleBorderStyle }
					options={ enumOptions( 'border', 'styleBorderStyle', [
						__( 'Keiner', 'cf65-blocks' ),
						__( 'Durchgezogen', 'cf65-blocks' ),
						__( 'Gestrichelt', 'cf65-blocks' ),
						__( 'Gepunktet', 'cf65-blocks' ),
						__( 'Doppelt', 'cf65-blocks' ),
					] ) }
					onChange={ ( next ) =>
						setAttributes( { styleBorderStyle: next } )
					}
				/>
				<LengthControl
					label={ __( 'Eckenradius', 'cf65-blocks' ) }
					value={ attributes.styleBorderRadius }
					onChange={ ( next ) =>
						setAttributes( { styleBorderRadius: next } )
					}
				/>
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Rahmenfarbe', 'cf65-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						label: __( 'Rahmen', 'cf65-blocks' ),
						value: attributes.styleBorderColor,
						onChange: ( next ) =>
							setAttributes( { styleBorderColor: next } ),
					},
					{
						label: __( 'Rahmen (Hover)', 'cf65-blocks' ),
						value: attributes.styleBorderColorHover,
						onChange: ( next ) =>
							setAttributes( { styleBorderColorHover: next } ),
					},
				] }
			/>
		</>
	);
}

const SHADOW_LABELS = [
	__( 'Keiner', 'cf65-blocks' ),
	__( 'Klein', 'cf65-blocks' ),
	__( 'Mittel', 'cf65-blocks' ),
	__( 'Gross', 'cf65-blocks' ),
];

/**
 * Schatten (Voreinstellungen).
 *
 * @param {Object}                  props
 * @param {Object}                  props.attributes    Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @return {Element} Panel.
 */
export function ShadowPanel( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Schatten', 'cf65-blocks' ) }
			initialOpen={ false }
		>
			<Select
				label={ __( 'Schatten', 'cf65-blocks' ) }
				value={ attributes.styleShadow }
				options={ enumOptions(
					'shadow',
					'styleShadow',
					SHADOW_LABELS
				) }
				onChange={ ( next ) => setAttributes( { styleShadow: next } ) }
			/>
			<Select
				label={ __( 'Schatten (Hover)', 'cf65-blocks' ) }
				value={ attributes.styleShadowHover }
				options={ enumOptions(
					'shadow',
					'styleShadowHover',
					SHADOW_LABELS
				) }
				onChange={ ( next ) =>
					setAttributes( { styleShadowHover: next } )
				}
			/>
		</PanelBody>
	);
}

/**
 * Hintergrundfarbe und/oder Hintergrundbild (statisch oder dynamisch).
 *
 * @param {Object}                  props
 * @param {string[]}                props.panels        Aktive Panels.
 * @param {Object}                  props.attributes    Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @param {Object}                  [props.context]     Block-Kontext.
 * @return {Element} Panels.
 */
export function BackgroundPanel( {
	panels,
	attributes,
	setAttributes,
	context,
} ) {
	const image = sanitizeImage( attributes.styleBackgroundImage );
	const preview = sanitizeUrl( image?.url, IMAGE_SCHEMES );

	return (
		<>
			{ panels.includes( 'backgroundColor' ) && (
				<PanelColorSettings
					title={ __( 'Hintergrundfarbe', 'cf65-blocks' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							label: __( 'Hintergrund', 'cf65-blocks' ),
							value: attributes.styleBackgroundColor,
							onChange: ( next ) =>
								setAttributes( { styleBackgroundColor: next } ),
						},
						{
							label: __( 'Hintergrund (Hover)', 'cf65-blocks' ),
							value: attributes.styleBackgroundColorHover,
							onChange: ( next ) =>
								setAttributes( {
									styleBackgroundColorHover: next,
								} ),
						},
					] }
				/>
			) }
			{ panels.includes( 'backgroundImage' ) && (
				<PanelBody
					title={ __( 'Hintergrundbild', 'cf65-blocks' ) }
					initialOpen={ false }
				>
					{ preview && (
						<img
							className="cf65-panel-background__preview"
							src={ preview }
							alt=""
						/>
					) }
					<MediaUploadCheck>
						<Flex justify="flex-start" gap={ 2 }>
							<FlexItem>
								<MediaUpload
									allowedTypes={ [ 'image' ] }
									value={ image?.id }
									onSelect={ ( media ) =>
										setAttributes( {
											styleBackgroundImage:
												sanitizeImage( {
													url: media?.url,
													id: media?.id,
												} ) ?? undefined,
										} )
									}
									render={ ( { open } ) => (
										<Button
											variant="secondary"
											size="small"
											onClick={ open }
										>
											{ image
												? __(
														'Bild ersetzen',
														'cf65-blocks'
													)
												: __(
														'Bild wählen',
														'cf65-blocks'
													) }
										</Button>
									) }
								/>
							</FlexItem>
							{ image && (
								<FlexItem>
									<Button
										variant="tertiary"
										size="small"
										isDestructive
										onClick={ () =>
											setAttributes( {
												styleBackgroundImage: undefined,
											} )
										}
									>
										{ __( 'Entfernen', 'cf65-blocks' ) }
									</Button>
								</FlexItem>
							) }
						</Flex>
					</MediaUploadCheck>
					<DynamicControl
						kind="image"
						binding={ attributes.dynamic?.styleBackgroundImage }
						postType={ context?.postType }
						help={ __(
							'Optional: Bild aus dem aktuellen Beitrag. Das gewählte Bild oben dient als Fallback.',
							'cf65-blocks'
						) }
						onChange={ ( next ) =>
							setAttributes( {
								dynamic: withBinding(
									attributes.dynamic,
									'styleBackgroundImage',
									next
								),
							} )
						}
					/>
					<Select
						label={ __( 'Grösse', 'cf65-blocks' ) }
						value={ attributes.styleBackgroundSize }
						options={ enumOptions(
							'backgroundImage',
							'styleBackgroundSize',
							[
								__( 'Füllen', 'cf65-blocks' ),
								__( 'Einpassen', 'cf65-blocks' ),
								__( 'Originalgrösse', 'cf65-blocks' ),
							]
						) }
						onChange={ ( next ) =>
							setAttributes( { styleBackgroundSize: next } )
						}
					/>
					<Select
						label={ __( 'Position', 'cf65-blocks' ) }
						value={ attributes.styleBackgroundPosition }
						options={ enumOptions(
							'backgroundImage',
							'styleBackgroundPosition',
							[
								__( 'Mitte', 'cf65-blocks' ),
								__( 'Oben', 'cf65-blocks' ),
								__( 'Unten', 'cf65-blocks' ),
								__( 'Links', 'cf65-blocks' ),
								__( 'Rechts', 'cf65-blocks' ),
							]
						) }
						onChange={ ( next ) =>
							setAttributes( { styleBackgroundPosition: next } )
						}
					/>
					<Select
						label={ __( 'Wiederholen', 'cf65-blocks' ) }
						value={ attributes.styleBackgroundRepeat }
						options={ enumOptions(
							'backgroundImage',
							'styleBackgroundRepeat',
							[
								__( 'Nicht wiederholen', 'cf65-blocks' ),
								__( 'Wiederholen', 'cf65-blocks' ),
								__( 'Horizontal', 'cf65-blocks' ),
								__( 'Vertikal', 'cf65-blocks' ),
							]
						) }
						onChange={ ( next ) =>
							setAttributes( { styleBackgroundRepeat: next } )
						}
					/>
				</PanelBody>
			) }
		</>
	);
}
