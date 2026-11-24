import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import ResponsiveLength from '../../components/responsive-length';
import { withPanels } from '../../extensions/panels/definitions';
import { useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { SeparatorShape, separatorClassName, shapeName } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const DESIGN_OPTIONS = [
	{ label: __( 'Welle', 'cf65-blocks' ), value: 'wave' },
	{ label: __( 'Kurve', 'cf65-blocks' ), value: 'curve' },
	{ label: __( 'Schräge', 'cf65-blocks' ), value: 'slant' },
	{ label: __( 'Dreieck', 'cf65-blocks' ), value: 'triangle' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: separatorClassName( attributes ),
		'aria-hidden': 'true',
	} );

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Form', 'cf65-blocks' ) }>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Form', 'cf65-blocks' ) }
								value={ shapeName( attributes.design ) }
								options={ DESIGN_OPTIONS }
								onChange={ ( next ) =>
									setAttributes( { design: next } )
								}
							/>
							<ResponsiveLength
								attributes={ attributes }
								setAttributes={ setAttributes }
								attribute="height"
								label={ __( 'Höhe', 'cf65-blocks' ) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Horizontal spiegeln',
									'cf65-blocks'
								) }
								checked={ attributes.flipX === true }
								onChange={ ( next ) =>
									setAttributes( { flipX: next } )
								}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Vertikal spiegeln',
									'cf65-blocks'
								) }
								checked={ attributes.flipY === true }
								onChange={ ( next ) =>
									setAttributes( { flipY: next } )
								}
							/>
						</PanelBody>
					}
					style={
						<PanelColorSettings
							title={ __( 'Farben', 'cf65-blocks' ) }
							colorSettings={ [
								{
									label: __( 'Form', 'cf65-blocks' ),
									value: attributes.color,
									onChange: ( next ) =>
										setAttributes( { color: next } ),
								},
							] }
						/>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...blockProps }>
				<SeparatorShape design={ attributes.design } />
			</div>
		</>
	);
}
