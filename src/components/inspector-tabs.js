/**
 * Inspector mit drei Tabs: Layout · Style · Advanced (UMSETZPLAN Kap. 4.1).
 *
 * Gemeinsame Style-Panels (src/extensions/panels) erscheinen über Slots am
 * Ende der Tabs „Layout“ bzw. „Style“; die Tabs werden dann auch ohne
 * eigenen Inhalt des Blocks angezeigt.
 */
import { useBlockEditContext } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { createSlotFill, TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { panelTabs } from '../extensions/panels/definitions';

const TABS = [
	{ name: 'layout', title: __( 'Layout', 'cf65-blocks' ) },
	{ name: 'style', title: __( 'Style', 'cf65-blocks' ) },
	{ name: 'advanced', title: __( 'Erweitert', 'cf65-blocks' ) },
];

export const LayoutPanels = createSlotFill( 'Cf65InspectorLayoutPanels' );
export const StylePanels = createSlotFill( 'Cf65InspectorStylePanels' );

/**
 * @param {Object}  props
 * @param {Element} [props.layout]   Inhalt Tab „Layout“.
 * @param {Element} [props.style]    Inhalt Tab „Style“.
 * @param {Element} [props.advanced] Inhalt Tab „Erweitert“.
 * @return {Element} Tabs.
 */
export default function InspectorTabs( { layout, style, advanced } ) {
	const { name } = useBlockEditContext();
	const withPanels = panelTabs( name ? getBlockType( name ) : undefined );

	const content = {
		layout: ( layout || withPanels.layout ) && (
			<>
				{ layout }
				<LayoutPanels.Slot />
			</>
		),
		style: ( style || withPanels.style ) && (
			<>
				{ style }
				<StylePanels.Slot />
			</>
		),
		advanced,
	};
	const tabs = TABS.filter( ( tab ) => content[ tab.name ] );

	return (
		<TabPanel className="cf65-inspector-tabs" tabs={ tabs }>
			{ ( tab ) => (
				<div className="cf65-inspector-tabs__panel">
					{ content[ tab.name ] }
				</div>
			) }
		</TabPanel>
	);
}
