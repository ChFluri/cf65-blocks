/**
 * Gemeinsame Style-Panels (UMSETZPLAN Kap. 4.2) – Spiegel von
 * includes/Styles/Panels.php. Quelle: includes/Styles/panels.json.
 *
 * Im Editor kommen Attribute und Supports ohnehin vom Server (dort per
 * `block_type_metadata` ergänzt). `withPanels()` liefert dieselben Daten
 * ohne Server, z. B. für die Style-Map in `edit.js` und für Tests.
 */
import panels from '../../../includes/Styles/panels.json';

/** Panel-Name → Definition (ohne `$comment`). */
export const PANELS = Object.fromEntries(
	Object.entries( panels ).filter( ( [ name ] ) => ! name.startsWith( '$' ) )
);

/**
 * @param {Object} metadata block.json bzw. Blocktyp.
 * @return {string[]} Gewählte, bekannte Panels.
 */
export function blockPanels( metadata ) {
	const list = metadata?.supports?.cf65?.panels;
	return Array.isArray( list )
		? list.filter( ( name ) => PANELS[ name ] )
		: [];
}

/**
 * Ergänzt Metadaten um Attribute, Styles und Bindungen der gewählten Panels.
 *
 * @param {Object} metadata block.json.
 * @return {Object} Neue Metadaten (unverändert ohne Panels).
 */
export function withPanels( metadata ) {
	const names = blockPanels( metadata );
	if ( ! names.length ) {
		return metadata;
	}
	const cf65 = metadata.supports?.cf65 ?? {};
	const attributes = { ...( metadata.attributes ?? {} ) };
	const styles = [ ...( cf65.styles ?? [] ) ];
	const dynamic = { ...( cf65.dynamic ?? {} ) };

	for ( const name of names ) {
		const definition = PANELS[ name ];
		for ( const [ attr, schema ] of Object.entries(
			definition.attributes ?? {}
		) ) {
			if ( ! ( attr in attributes ) ) {
				attributes[ attr ] = schema;
			}
		}
		styles.push( ...( definition.styles ?? [] ) );
		for ( const [ attr, spec ] of Object.entries(
			definition.dynamic ?? {}
		) ) {
			if ( ! ( attr in dynamic ) ) {
				dynamic[ attr ] = spec;
			}
		}
	}

	return {
		...metadata,
		attributes,
		supports: {
			...metadata.supports,
			cf65: {
				...cf65,
				styles,
				...( Object.keys( dynamic ).length ? { dynamic } : {} ),
			},
		},
	};
}

/**
 * Welche Tabs Panels eines Blocks füllen.
 *
 * @param {Object} metadata Blocktyp.
 * @return {{layout: boolean, style: boolean}} Tabs.
 */
export function panelTabs( metadata ) {
	const tabs = { layout: false, style: false };
	for ( const name of blockPanels( metadata ) ) {
		tabs[ PANELS[ name ].tab === 'layout' ? 'layout' : 'style' ] = true;
	}
	return tabs;
}
