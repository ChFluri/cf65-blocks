import {
	BlockControls,
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToolbarDropdownMenu,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import {
	AlignmentPanel,
	TypographyColorPanels,
} from '../../components/text-style-panels';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import { withPanels } from '../../extensions/panels/definitions';
import metadata from './block.json';
import { safeLevel } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;
const LEVELS = [ 1, 2, 3, 4, 5, 6 ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, content, level } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );

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
						<AlignmentPanel
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					}
					style={
						<TypographyColorPanels
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
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
