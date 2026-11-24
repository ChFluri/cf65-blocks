/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<ul>` mit einem
 * Link pro Netzwerk (`aria-label` = Netzwerkname) und Icon-Platzhalter
 * (SVG beim Rendern). Einträge mit unbekanntem Netzwerk oder ungültiger URL
 * werden nicht ausgegeben. Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/social-buttons/ und eine `deprecated`-Definition.
 */
import { useBlockProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { hasIcon, iconLabel, IconSlot } from '../../icons/library';
import { sanitizeUrl } from '../../security/sanitize';

export const LINK_CLASS = 'cf65-social-buttons__link';

/**
 * @param {unknown} network Netzwerk (Slug ohne `brand-`).
 * @return {string|null} Icon-Name oder null.
 */
export function networkIcon( network ) {
	const name = typeof network === 'string' ? `brand-${ network }` : '';
	return hasIcon( name ) ? name : null;
}

/**
 * Gültige Einträge (bekanntes Netzwerk, erlaubte URL).
 *
 * @param {unknown} links Attribut `links`.
 * @return {Array<{network: string, icon: string, url: string}>} Einträge.
 */
export function validLinks( links ) {
	return ( Array.isArray( links ) ? links : [] ).flatMap( ( link ) => {
		const icon = networkIcon( link?.network );
		const url = sanitizeUrl( link?.url );
		return icon && url ? [ { network: link.network, icon, url } ] : [];
	} );
}

export default function save( { attributes } ) {
	const { uniqueId, links, opensInNewTab, brandColors } = attributes;
	const className = [
		blockClassName( 'social-buttons', uniqueId ),
		brandColors === true ? 'cf65-social-buttons--brand' : null,
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<ul { ...useBlockProps.save( { className } ) }>
			{ validLinks( links ).map( ( { network, icon, url }, index ) => (
				<li key={ index } className="cf65-social-buttons__item">
					{ /* eslint-disable-next-line react/jsx-no-target-blank -- rel="noopener" genügt; der Referrer bleibt bewusst erhalten (wie bei cf65/button). */ }
					<a
						className={ `${ LINK_CLASS } ${ LINK_CLASS }--${ network }` }
						href={ url }
						target={ opensInNewTab ? '_blank' : undefined }
						rel={ opensInNewTab ? 'noopener' : undefined }
						aria-label={ iconLabel( icon ) }
					>
						<IconSlot name={ icon } />
					</a>
				</li>
			) ) }
		</ul>
	);
}
