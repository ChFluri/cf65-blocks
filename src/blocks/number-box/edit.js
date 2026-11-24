import {
	InspectorControls,
	PanelColorSettings,
	RichText,
	useBlockProps,
	useInnerBlocksProps,
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
import { NUMBER_CLASS } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [ [ 'cf65/heading', { level: 3 } ], [ 'cf65/text' ] ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, number } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'number-box', uniqueId ),
	} );
	const { children, ...innerProps } = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Zahlen-Box', 'cf65-blocks' ) }>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Hochzählen', 'cf65-blocks' ) }
								help={ __(
									'Zählt beim Sichtbarwerden von 0 auf die Zahl hoch (nur auf der Website, nicht bei „Bewegung reduzieren“).',
									'cf65-blocks'
								) }
								checked={ attributes.countUp }
								onChange={ ( next ) =>
									setAttributes( { countUp: next } )
								}
							/>
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __(
									'Abstand zwischen Elementen',
									'cf65-blocks'
								) }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="textAlign"
								label={ __( 'Textausrichtung', 'cf65-blocks' ) }
								options={ TEXT_ALIGN_OPTIONS }
							/>
						</PanelBody>
					}
					style={
						<>
							<PanelBody title={ __( 'Zahl', 'cf65-blocks' ) }>
								<ResponsiveLength
									{ ...props }
									attribute="numberSize"
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
										label: __( 'Zahl', 'cf65-blocks' ),
										value: attributes.numberColor,
										onChange: ( next ) =>
											setAttributes( {
												numberColor: next,
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
			<div { ...innerProps }>
				<RichText
					identifier="number"
					tagName="p"
					className={ NUMBER_CLASS }
					value={ number }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'cf65/dynamic',
					] }
					onChange={ ( next ) => setAttributes( { number: next } ) }
					placeholder={ __( 'z. B. 250+', 'cf65-blocks' ) }
				/>
				{ children }
			</div>
		</>
	);
}
