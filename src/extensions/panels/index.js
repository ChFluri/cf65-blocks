/**
 * Editor-Erweiterung: gemeinsame Style-Panels für Blöcke mit
 * `supports.cf65.panels` (Filter `editor.BlockEdit`).
 *
 * - Panels erscheinen per Slot/Fill in den Tabs „Layout“ und „Style“ des
 *   Blocks (src/components/inspector-tabs).
 * - Ein dynamisches Hintergrundbild zeigt der Editor als Vorschau mit dem
 *   Wert des Beitrags bzw. Query-Loop-Eintrags (Block-Kontext).
 */
import { getBlockType } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

import { LayoutPanels, StylePanels } from '../../components/inspector-tabs';
import { useDynamicPreview } from '../../dynamic/hooks';
import { sanitizeCssImage, sanitizeUniqueId } from '../../security/sanitize';
import {
	BackgroundPanel,
	BorderPanel,
	ShadowPanel,
	SpacingPanel,
} from './controls';
import { blockPanels } from './definitions';

/**
 * Vorschau eines dynamischen Hintergrundbilds (doppelte Klasse: gewinnt
 * gegen das statische Bild aus dem Block-CSS, wie das Inline-Style im Frontend).
 *
 * @param {Object} props
 * @param {Object} props.attributes Attribute.
 * @param {Object} props.context    Block-Kontext.
 * @return {Element|null} Style-Element.
 */
function DynamicBackgroundPreview( { attributes, context } ) {
	const preview = useDynamicPreview(
		attributes.dynamic?.styleBackgroundImage,
		'image',
		context
	);
	const id = sanitizeUniqueId( attributes.uniqueId );
	const css =
		preview.status === 'ready'
			? sanitizeCssImage( { url: preview.value?.url } )
			: null;
	return id && css ? (
		<style>{ `.cf65-${ id }.cf65-${ id }{background-image:${ css }}` }</style>
	) : null;
}

const withPanels = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const panels = blockPanels( getBlockType( props.name ) );
		if ( ! panels.length ) {
			return <BlockEdit { ...props } />;
		}
		const panelProps = {
			panels,
			attributes: props.attributes,
			setAttributes: props.setAttributes,
			context: props.context,
		};
		return (
			<>
				<BlockEdit { ...props } />
				{ panels.includes( 'backgroundImage' ) &&
					props.attributes.dynamic?.styleBackgroundImage && (
						<DynamicBackgroundPreview
							attributes={ props.attributes }
							context={ props.context }
						/>
					) }
				{ props.isSelected && (
					<>
						<LayoutPanels.Fill>
							<SpacingPanel { ...panelProps } />
						</LayoutPanels.Fill>
						<StylePanels.Fill>
							{ panels.includes( 'border' ) && (
								<BorderPanel { ...panelProps } />
							) }
							{ panels.includes( 'shadow' ) && (
								<ShadowPanel { ...panelProps } />
							) }
							<BackgroundPanel { ...panelProps } />
						</StylePanels.Fill>
					</>
				) }
			</>
		);
	},
	'withCf65Panels'
);

/**
 * Registriert den Filter (einmal, im Editor-Skript).
 */
export function registerPanels() {
	addFilter( 'editor.BlockEdit', 'cf65-blocks/panels', withPanels );
}
