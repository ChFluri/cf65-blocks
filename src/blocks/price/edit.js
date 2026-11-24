import {
	InspectorControls,
	PanelColorSettings,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import { TEXT_ALIGN_OPTIONS } from '../../components/options';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { PART_CLASSES, priceParts } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const FORMATS = [ 'core/bold', 'core/italic', 'cf65/dynamic' ];

const PARTS = {
	old: {
		attribute: 'oldAmount',
		tagName: 'del',
		placeholder: __( 'alt', 'cf65-blocks' ),
	},
	currency: {
		attribute: 'currency',
		tagName: 'span',
		placeholder: __( 'CHF', 'cf65-blocks' ),
	},
	amount: {
		attribute: 'amount',
		tagName: 'span',
		placeholder: __( '49', 'cf65-blocks' ),
	},
	period: {
		attribute: 'period',
		tagName: 'span',
		placeholder: __( '/ Monat', 'cf65-blocks' ),
	},
};

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	isSelected,
} ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'price', uniqueId ),
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Preis', 'cf65-blocks' ) }>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Währung nach dem Betrag',
									'cf65-blocks'
								) }
								checked={ attributes.currencyAfter }
								onChange={ ( next ) =>
									setAttributes( { currencyAfter: next } )
								}
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="textAlign"
								label={ __( 'Ausrichtung', 'cf65-blocks' ) }
								options={ TEXT_ALIGN_OPTIONS }
							/>
						</PanelBody>
					}
					style={
						<>
							<PanelBody title={ __( 'Grösse', 'cf65-blocks' ) }>
								<ResponsiveLength
									{ ...props }
									attribute="amountSize"
									label={ __(
										'Grösse des Betrags (übrige Teile wachsen mit)',
										'cf65-blocks'
									) }
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									[
										'amountColor',
										__( 'Betrag', 'cf65-blocks' ),
									],
									[
										'currencyColor',
										__( 'Währung', 'cf65-blocks' ),
									],
									[
										'periodColor',
										__( 'Zeitraum', 'cf65-blocks' ),
									],
									[
										'oldColor',
										__( 'Alter Preis', 'cf65-blocks' ),
									],
								].map( ( [ attr, label ] ) => ( {
									label,
									value: attributes[ attr ],
									onChange: ( next ) =>
										setAttributes( { [ attr ]: next } ),
								} ) ) }
							/>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...blockProps }>
				{ priceParts( attributes ).map( ( part ) => {
					const { attribute, tagName, placeholder } = PARTS[ part ];
					const value = attributes[ attribute ];
					// Leere Nebenteile nur am ausgewählten Block zeigen.
					if ( ! value && part !== 'amount' && ! isSelected ) {
						return null;
					}
					return (
						<RichText
							key={ part }
							identifier={ attribute }
							tagName={ tagName }
							className={ PART_CLASSES[ part ] }
							value={ value }
							allowedFormats={ FORMATS }
							withoutInteractiveFormatting
							placeholder={ placeholder }
							onChange={ ( next ) =>
								setAttributes( { [ attribute ]: next } )
							}
						/>
					);
				} ) }
			</div>
		</>
	);
}
