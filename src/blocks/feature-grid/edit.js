import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [ [ 'cf65/card' ], [ 'cf65/card' ], [ 'cf65/card' ] ];

const COLUMN_OPTIONS = [
	{
		label: __(
			'Standard (Desktop 3, Tablet wie Desktop, Mobil 1)',
			'cf65-blocks'
		),
		value: '',
	},
	...[ '1', '2', '3', '4', '5', '6' ].map( ( value ) => ( {
		/* translators: %s: Anzahl Spalten. */
		label: sprintf( __( '%s Spalten', 'cf65-blocks' ), value ),
		value,
	} ) ),
];

const ALIGN_OPTIONS = [
	{ label: __( 'Standard (gleich hoch)', 'cf65-blocks' ), value: '' },
	{ label: __( 'Oben', 'cf65-blocks' ), value: 'start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Unten', 'cf65-blocks' ), value: 'end' },
	{ label: __( 'Gleich hoch', 'cf65-blocks' ), value: 'stretch' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'feature-grid', uniqueId ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Raster', 'cf65-blocks' ) }>
							<ResponsiveSelect
								{ ...props }
								attribute="columns"
								label={ __( 'Spalten', 'cf65-blocks' ) }
								options={ COLUMN_OPTIONS }
							/>
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __(
									'Abstand horizontal',
									'cf65-blocks'
								) }
							/>
							<ResponsiveLength
								{ ...props }
								attribute="rowGap"
								label={ __(
									'Abstand vertikal',
									'cf65-blocks'
								) }
							/>
							<ResponsiveSelect
								{ ...props }
								attribute="verticalAlign"
								label={ __(
									'Vertikale Ausrichtung',
									'cf65-blocks'
								) }
								options={ ALIGN_OPTIONS }
							/>
						</PanelBody>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...innerBlocksProps } />
		</>
	);
}
