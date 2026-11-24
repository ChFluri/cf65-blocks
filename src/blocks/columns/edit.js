import {
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import ResponsiveControl from '../../components/responsive-control';
import ResponsiveLength from '../../components/responsive-length';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import { withPanels } from '../../extensions/panels/definitions';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;
const ALLOWED_BLOCKS = [ 'cf65/column' ];
const TEMPLATE = [ [ 'cf65/column' ], [ 'cf65/column' ] ];
const MAX_COLUMNS = 6;

const ALIGN_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Oben', 'cf65-blocks' ), value: 'flex-start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Unten', 'cf65-blocks' ), value: 'flex-end' },
	{ label: __( 'Gleich hoch', 'cf65-blocks' ), value: 'stretch' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );

	const innerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	/**
	 * Spaltenzahl ändern: leere Spalten anhängen bzw. die letzten entfernen
	 * (wie core/columns).
	 *
	 * @param {number} count Gewünschte Anzahl.
	 */
	const setColumnCount = ( count ) => {
		const added = Array.from(
			{ length: Math.max( 0, count - innerBlocks.length ) },
			() => createBlock( 'cf65/column' )
		);
		replaceInnerBlocks(
			clientId,
			[ ...innerBlocks.slice( 0, count ), ...added ],
			false
		);
	};

	const blockProps = useBlockProps( {
		className: blockClassName( 'columns', uniqueId ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		orientation: 'horizontal',
		renderAppender: false,
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Spalten', 'cf65-blocks' ) }>
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Anzahl', 'cf65-blocks' ) }
								min={ 1 }
								max={ Math.max(
									MAX_COLUMNS,
									innerBlocks.length
								) }
								value={ innerBlocks.length }
								onChange={ ( next ) =>
									next && setColumnCount( next )
								}
								help={ __(
									'Beim Verringern werden die letzten Spalten samt Inhalt entfernt.',
									'cf65-blocks'
								) }
							/>
							<ResponsiveLength
								{ ...props }
								attribute="gap"
								label={ __( 'Abstand', 'cf65-blocks' ) }
							/>
							<ResponsiveControl
								label={ __(
									'Vertikale Ausrichtung',
									'cf65-blocks'
								) }
								value={ attributes.verticalAlign }
								onChange={ ( next ) =>
									setAttributes( { verticalAlign: next } )
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
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...innerBlocksProps } />
		</>
	);
}
