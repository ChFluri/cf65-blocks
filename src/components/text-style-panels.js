/**
 * Gemeinsame Inspector-Panels für Textblöcke (Heading, Text, …):
 * responsive Ausrichtung, responsive Schriftgrösse, Text- und Hover-Farbe.
 *
 * Erwartet die Attribute `textAlign`, `fontSize`, `textColor`,
 * `textColorHover` (siehe `supports.cf65.styles` im jeweiligen block.json).
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import LengthControl from './length-control';
import ResponsiveControl from './responsive-control';

const ALIGN_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: 'left' },
	{ label: __( 'Zentriert', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'right' },
	{ label: __( 'Blocksatz', 'cf65-blocks' ), value: 'justify' },
];

/**
 * @param {Object}                  props
 * @param {Object}                  props.attributes    Block-Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @param {boolean}                 [props.justify]     Blocksatz anbieten (Standard: ja).
 * @return {Element} Panel.
 */
export function AlignmentPanel( {
	attributes,
	setAttributes,
	justify = true,
} ) {
	const options = justify
		? ALIGN_OPTIONS
		: ALIGN_OPTIONS.filter( ( option ) => option.value !== 'justify' );
	return (
		<PanelBody title={ __( 'Ausrichtung', 'cf65-blocks' ) }>
			<ResponsiveControl
				label={ __( 'Textausrichtung', 'cf65-blocks' ) }
				value={ attributes.textAlign }
				onChange={ ( next ) => setAttributes( { textAlign: next } ) }
			>
				{ ( value, onChange ) => (
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Ausrichtung', 'cf65-blocks' ) }
						hideLabelFromVision
						value={ value ?? '' }
						options={ options }
						onChange={ onChange }
					/>
				) }
			</ResponsiveControl>
		</PanelBody>
	);
}

/**
 * @param {Object}                  props
 * @param {Object}                  props.attributes    Block-Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @param {Array}                   [props.extraColors] Weitere Einträge für PanelColorSettings.
 * @return {Element} Panels.
 */
export function TypographyColorPanels( {
	attributes,
	setAttributes,
	extraColors = [],
} ) {
	return (
		<>
			<PanelBody title={ __( 'Typografie', 'cf65-blocks' ) }>
				<ResponsiveControl
					label={ __( 'Schriftgrösse', 'cf65-blocks' ) }
					value={ attributes.fontSize }
					onChange={ ( next ) => setAttributes( { fontSize: next } ) }
				>
					{ ( value, onChange ) => (
						<LengthControl
							label={ __( 'Grösse', 'cf65-blocks' ) }
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
						value: attributes.textColor,
						onChange: ( next ) =>
							setAttributes( { textColor: next } ),
					},
					{
						label: __( 'Text (Hover)', 'cf65-blocks' ),
						value: attributes.textColorHover,
						onChange: ( next ) =>
							setAttributes( { textColorHover: next } ),
					},
					...extraColors,
				] }
			/>
		</>
	);
}
