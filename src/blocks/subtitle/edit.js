import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import {
	AlignmentPanel,
	TypographyColorPanels,
} from '../../components/text-style-panels';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TRANSFORM_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Normal', 'cf65-blocks' ), value: 'none' },
	{ label: __( 'GROSSBUCHSTABEN', 'cf65-blocks' ), value: 'uppercase' },
	{ label: __( 'kleinbuchstaben', 'cf65-blocks' ), value: 'lowercase' },
	{ label: __( 'Wortanfänge Gross', 'cf65-blocks' ), value: 'capitalize' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, content } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'subtitle', uniqueId ),
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={ <AlignmentPanel { ...props } /> }
					style={
						<>
							<TypographyColorPanels { ...props } />
							<PanelBody
								title={ __( 'Schreibweise', 'cf65-blocks' ) }
							>
								<SelectControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __(
										'Gross-/Kleinschreibung',
										'cf65-blocks'
									) }
									value={ attributes.textTransform ?? '' }
									options={ TRANSFORM_OPTIONS }
									onChange={ ( next ) =>
										setAttributes( {
											textTransform: next || undefined,
										} )
									}
								/>
								<LengthControl
									label={ __(
										'Buchstabenabstand',
										'cf65-blocks'
									) }
									value={ attributes.letterSpacing }
									onChange={ ( next ) =>
										setAttributes( { letterSpacing: next } )
									}
								/>
							</PanelBody>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<RichText
				{ ...blockProps }
				identifier="content"
				tagName="p"
				value={ content }
				onChange={ ( next ) => setAttributes( { content: next } ) }
				placeholder={ __( 'Untertitel eingeben …', 'cf65-blocks' ) }
			/>
		</>
	);
}
