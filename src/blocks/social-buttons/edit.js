import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	Flex,
	FlexItem,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveControl from '../../components/responsive-control';
import ResponsiveLength from '../../components/responsive-length';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import { iconLabel, iconNames, IconSlot } from '../../icons/library';
import { sanitizeUrl } from '../../security/sanitize';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { LINK_CLASS, networkIcon } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const NETWORK_OPTIONS = iconNames( 'brands' ).map( ( name ) => ( {
	label: iconLabel( name ),
	value: name.replace( /^brand-/, '' ),
} ) );

const JUSTIFY_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: 'flex-start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'flex-end' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, brandColors } = attributes;
	const links = Array.isArray( attributes.links ) ? attributes.links : [];

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: [
			blockClassName( 'social-buttons', uniqueId ),
			brandColors === true ? 'cf65-social-buttons--brand' : null,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );
	const props = { attributes, setAttributes };

	const update = ( index, changes ) =>
		setAttributes( {
			links: links.map( ( link, i ) =>
				i === index ? { ...link, ...changes } : link
			),
		} );
	const move = ( index, offset ) => {
		const next = [ ...links ];
		const [ item ] = next.splice( index, 1 );
		next.splice( index + offset, 0, item );
		setAttributes( { links: next } );
	};

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<>
							<PanelBody title={ __( 'Profile', 'cf65-blocks' ) }>
								{ links.map( ( link, index ) => {
									const invalid =
										Boolean( link.url ) &&
										sanitizeUrl( link.url ) === null;
									return (
										<div
											key={ index }
											className="cf65-social-buttons__row"
										>
											<SelectControl
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												label={ sprintf(
													/* translators: %d: position */
													__(
														'Netzwerk %d',
														'cf65-blocks'
													),
													index + 1
												) }
												value={ link.network }
												options={ NETWORK_OPTIONS }
												onChange={ ( network ) =>
													update( index, { network } )
												}
											/>
											<TextControl
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												type="url"
												label={ __(
													'Profil-URL',
													'cf65-blocks'
												) }
												value={ link.url ?? '' }
												onChange={ ( url ) =>
													update( index, { url } )
												}
												help={
													invalid
														? __(
																'Ungültige URL – der Eintrag wird nicht ausgegeben.',
																'cf65-blocks'
															)
														: undefined
												}
											/>
											<Flex
												justify="flex-start"
												gap={ 1 }
											>
												<FlexItem>
													<Button
														size="small"
														variant="tertiary"
														disabled={ index === 0 }
														onClick={ () =>
															move( index, -1 )
														}
													>
														{ __(
															'Nach oben',
															'cf65-blocks'
														) }
													</Button>
												</FlexItem>
												<FlexItem>
													<Button
														size="small"
														variant="tertiary"
														disabled={
															index ===
															links.length - 1
														}
														onClick={ () =>
															move( index, 1 )
														}
													>
														{ __(
															'Nach unten',
															'cf65-blocks'
														) }
													</Button>
												</FlexItem>
												<FlexItem>
													<Button
														size="small"
														variant="tertiary"
														isDestructive
														onClick={ () =>
															setAttributes( {
																links: links.filter(
																	( _, i ) =>
																		i !==
																		index
																),
															} )
														}
													>
														{ __(
															'Entfernen',
															'cf65-blocks'
														) }
													</Button>
												</FlexItem>
											</Flex>
										</div>
									);
								} ) }
								<Button
									variant="secondary"
									onClick={ () =>
										setAttributes( {
											links: [
												...links,
												{
													network: 'facebook',
													url: '',
												},
											],
										} )
									}
								>
									{ __( 'Profil hinzufügen', 'cf65-blocks' ) }
								</Button>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'In neuem Tab öffnen',
										'cf65-blocks'
									) }
									checked={
										attributes.opensInNewTab !== false
									}
									onChange={ ( next ) =>
										setAttributes( { opensInNewTab: next } )
									}
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Anordnung', 'cf65-blocks' ) }
							>
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
									label={ __( 'Abstand', 'cf65-blocks' ) }
									value={ attributes.gap }
									onChange={ ( next ) =>
										setAttributes( { gap: next } )
									}
								/>
							</PanelBody>
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
							<PanelBody title={ __( 'Farben', 'cf65-blocks' ) }>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Markenfarben',
										'cf65-blocks'
									) }
									help={ __(
										'Hintergrund in der Farbe des jeweiligen Netzwerks, Icon weiss.',
										'cf65-blocks'
									) }
									checked={ brandColors === true }
									onChange={ ( next ) =>
										setAttributes( { brandColors: next } )
									}
								/>
							</PanelBody>
							{ brandColors !== true && (
								<PanelColorSettings
									title={ __(
										'Eigene Farben',
										'cf65-blocks'
									) }
									colorSettings={ [
										{
											label: __( 'Icon', 'cf65-blocks' ),
											value: attributes.color,
											onChange: ( next ) =>
												setAttributes( {
													color: next,
												} ),
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
							) }
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<ul { ...blockProps }>
				{ links.map( ( link, index ) => {
					const icon = networkIcon( link.network );
					return icon ? (
						<li key={ index } className="cf65-social-buttons__item">
							<span
								className={ `${ LINK_CLASS } ${ LINK_CLASS }--${ link.network }` }
								aria-label={ iconLabel( icon ) }
							>
								<IconSlot name={ icon } edit />
							</span>
						</li>
					) : null;
				} ) }
			</ul>
		</>
	);
}
