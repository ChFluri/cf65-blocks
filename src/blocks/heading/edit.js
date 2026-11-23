import {
	BlockControls,
	InspectorControls,
	PanelColorSettings,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToolbarDropdownMenu,
} from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveControl from '../../components/responsive-control';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import { generateCss } from '../../styles/generator';
import metadata from './block.json';
import { safeLevel } from './save';

const STYLE_MAP = metadata.supports.cf65.styles;
const LEVELS = [ 1, 2, 3, 4, 5, 6 ];

const ALIGN_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: 'left' },
	{ label: __( 'Zentriert', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'right' },
	{ label: __( 'Blocksatz', 'cf65-blocks' ), value: 'justify' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		uniqueId,
		content,
		level,
		textAlign,
		fontSize,
		textColor,
		textColorHover,
	} = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useMemo(
		() => generateCss( uniqueId, STYLE_MAP, attributes ),
		[ uniqueId, attributes ]
	);

	const blockProps = useBlockProps( {
		className: blockClassName( 'heading', uniqueId ),
	} );
	const currentLevel = safeLevel( level );

	const levelControls = LEVELS.map( ( l ) => ( {
		title: sprintf(
			/* translators: %d: heading level */
			__( 'Überschrift %d', 'cf65-blocks' ),
			l
		),
		isActive: l === currentLevel,
		onClick: () => setAttributes( { level: l } ),
	} ) );

	return (
		<>
			<BlockControls group="block">
				<ToolbarDropdownMenu
					icon={ <strong>{ `H${ currentLevel }` }</strong> }
					label={ __( 'Überschriftenebene', 'cf65-blocks' ) }
					controls={ levelControls }
				/>
			</BlockControls>

			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Ausrichtung', 'cf65-blocks' ) }>
							<ResponsiveControl
								label={ __( 'Textausrichtung', 'cf65-blocks' ) }
								value={ textAlign }
								onChange={ ( next ) =>
									setAttributes( { textAlign: next } )
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
										options={ ALIGN_OPTIONS }
										onChange={ onChange }
									/>
								) }
							</ResponsiveControl>
						</PanelBody>
					}
					style={
						<>
							<PanelBody
								title={ __( 'Typografie', 'cf65-blocks' ) }
							>
								<ResponsiveControl
									label={ __(
										'Schriftgrösse',
										'cf65-blocks'
									) }
									value={ fontSize }
									onChange={ ( next ) =>
										setAttributes( { fontSize: next } )
									}
								>
									{ ( value, onChange ) => (
										<LengthControl
											label={ __(
												'Grösse',
												'cf65-blocks'
											) }
											value={ value }
											onChange={ onChange }
										/>
									) }
								</ResponsiveControl>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Text', 'cf65-blocks' ),
										value: textColor,
										onChange: ( next ) =>
											setAttributes( {
												textColor: next,
											} ),
									},
									{
										label: __(
											'Text (Hover)',
											'cf65-blocks'
										),
										value: textColorHover,
										onChange: ( next ) =>
											setAttributes( {
												textColorHover: next,
											} ),
									},
								] }
							/>
						</>
					}
					advanced={
						<PanelBody title={ __( 'HTML', 'cf65-blocks' ) }>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'HTML-Tag', 'cf65-blocks' ) }
								value={ String( currentLevel ) }
								options={ LEVELS.map( ( l ) => ( {
									label: `h${ l }`,
									value: String( l ),
								} ) ) }
								onChange={ ( next ) =>
									setAttributes( { level: Number( next ) } )
								}
							/>
						</PanelBody>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<RichText
				{ ...blockProps }
				identifier="content"
				tagName={ `h${ currentLevel }` }
				value={ content }
				onChange={ ( next ) => setAttributes( { content: next } ) }
				placeholder={ __( 'Überschrift eingeben …', 'cf65-blocks' ) }
			/>
		</>
	);
}
