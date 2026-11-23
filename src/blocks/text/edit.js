import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import {
	AlignmentPanel,
	TypographyColorPanels,
} from '../../components/text-style-panels';
import { blockClassName, useUniqueId } from '../../extensions/unique-id';
import { generateCss } from '../../styles/generator';
import metadata from './block.json';

const STYLE_MAP = metadata.supports.cf65.styles;

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	mergeBlocks,
	onRemove,
} ) {
	const { uniqueId, content } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useMemo(
		() => generateCss( uniqueId, STYLE_MAP, attributes ),
		[ uniqueId, attributes ]
	);

	const blockProps = useBlockProps( {
		className: blockClassName( 'text', uniqueId ),
	} );

	return (
		<>
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
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<RichText
				{ ...blockProps }
				identifier="content"
				tagName="p"
				value={ content }
				onChange={ ( next ) => setAttributes( { content: next } ) }
				onMerge={ mergeBlocks }
				onRemove={ onRemove }
				placeholder={ __( 'Text eingeben …', 'cf65-blocks' ) }
			/>
		</>
	);
}
