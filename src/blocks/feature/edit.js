import {
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import ResponsiveLength from '../../components/responsive-length';
import ResponsiveSelect from '../../components/responsive-select';
import { withPanels } from '../../extensions/panels/definitions';
import { useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { featureClassName } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;
const ALLOWED_BLOCKS = [ 'cf65/column' ];

// Genau zwei Spalten (gesperrt); deren Inhalt bleibt frei. Mit templateLock
// "all" gleicht der Editor die Innenblöcke rekursiv mit der Vorlage ab und
// entfernt Überzähliges – die Vorlage mit Inhalt gilt daher nur für einen
// leeren Block, danach nur die zwei Spalten.
const LOCKED_TEMPLATE = [ [ 'cf65/column' ], [ 'cf65/column' ] ];
const INITIAL_TEMPLATE = [
	[ 'cf65/column', {}, [ [ 'cf65/image' ] ] ],
	[
		'cf65/column',
		{},
		[
			[ 'cf65/heading', { level: 2 } ],
			[ 'cf65/text' ],
			[ 'cf65/button' ],
		],
	],
];

const ALIGN_OPTIONS = [
	{ label: __( 'Standard (Mitte)', 'cf65-blocks' ), value: '' },
	{ label: __( 'Oben', 'cf65-blocks' ), value: 'flex-start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Unten', 'cf65-blocks' ), value: 'flex-end' },
	{ label: __( 'Gleich hoch', 'cf65-blocks' ), value: 'stretch' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const isEmpty = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockCount( clientId ) === 0,
		[ clientId ]
	);
	const blockProps = useBlockProps( {
		className: featureClassName( attributes ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: isEmpty ? INITIAL_TEMPLATE : LOCKED_TEMPLATE,
		templateLock: 'all',
		orientation: 'horizontal',
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Feature', 'cf65-blocks' ) }>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Bild rechts', 'cf65-blocks' ) }
								help={ __(
									'Tauscht die Spalten auf Desktop und Tablet. Auf Mobilgeräten steht das Bild immer oben.',
									'cf65-blocks'
								) }
								checked={ attributes.reversed }
								onChange={ ( next ) =>
									setAttributes( { reversed: next } )
								}
							/>
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __( 'Abstand', 'cf65-blocks' ) }
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
