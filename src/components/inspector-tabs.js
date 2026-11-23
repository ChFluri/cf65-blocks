/**
 * Inspector mit drei Tabs: Layout · Style · Advanced (UMSETZPLAN Kap. 4.1).
 */
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const TABS = [
	{ name: 'layout', title: __( 'Layout', 'cf65-blocks' ) },
	{ name: 'style', title: __( 'Style', 'cf65-blocks' ) },
	{ name: 'advanced', title: __( 'Erweitert', 'cf65-blocks' ) },
];

/**
 * @param {Object}  props
 * @param {Element} [props.layout]   Inhalt Tab „Layout“.
 * @param {Element} [props.style]    Inhalt Tab „Style“.
 * @param {Element} [props.advanced] Inhalt Tab „Erweitert“.
 * @return {Element} Tabs.
 */
export default function InspectorTabs( { layout, style, advanced } ) {
	const content = { layout, style, advanced };
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
