import {
	InspectorControls,
	PanelColorSettings,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import LengthControl from '../../components/length-control';
import ResponsiveControl from '../../components/responsive-control';
import { AlignmentPanel } from '../../components/text-style-panels';
import { withPanels } from '../../extensions/panels/definitions';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { CITE_CLASS, TEXT_CLASS } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, content, citation } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: blockClassName( 'blockquote', uniqueId ),
	} );
	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={ <AlignmentPanel { ...props } justify={ false } /> }
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
									value={ attributes.fontSize }
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
							<PanelBody
								title={ __( 'Akzentlinie', 'cf65-blocks' ) }
							>
								<LengthControl
									label={ __( 'Breite', 'cf65-blocks' ) }
									value={ attributes.accentWidth }
									onChange={ ( next ) =>
										setAttributes( { accentWidth: next } )
									}
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Zitat', 'cf65-blocks' ),
										value: attributes.textColor,
										onChange: ( next ) =>
											setAttributes( {
												textColor: next,
											} ),
									},
									{
										label: __( 'Quelle', 'cf65-blocks' ),
										value: attributes.citationColor,
										onChange: ( next ) =>
											setAttributes( {
												citationColor: next,
											} ),
									},
									{
										label: __(
											'Akzentlinie',
											'cf65-blocks'
										),
										value: attributes.accentColor,
										onChange: ( next ) =>
											setAttributes( {
												accentColor: next,
											} ),
									},
								] }
							/>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<blockquote { ...blockProps }>
				<RichText
					identifier="content"
					tagName="p"
					className={ TEXT_CLASS }
					value={ content }
					onChange={ ( next ) => setAttributes( { content: next } ) }
					placeholder={ __( 'Zitat eingeben …', 'cf65-blocks' ) }
				/>
				<RichText
					identifier="citation"
					tagName="cite"
					className={ CITE_CLASS }
					value={ citation }
					onChange={ ( next ) => setAttributes( { citation: next } ) }
					placeholder={ __( 'Quelle hinzufügen …', 'cf65-blocks' ) }
				/>
			</blockquote>
		</>
	);
}
