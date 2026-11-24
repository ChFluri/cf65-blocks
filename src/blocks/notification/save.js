/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): `<div role="note">`
 * mit Typ-Klasse, Icon-Platzhalter (SVG beim Rendern), Inhalt
 * (Innenblöcke) und optionalem Schliessen-Button (view.js). Änderungen
 * erfordern eine neue Fixture unter tests/fixtures/blocks/notification/ und
 * eine `deprecated`-Definition.
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { blockClassName } from '../../extensions/unique-id';
import { IconSlot } from '../../icons/library';

export const TYPES = [ 'info', 'success', 'warning', 'error' ];
export const CONTENT_CLASS = 'cf65-notification__content';
export const CLOSE_CLASS = 'cf65-notification__close';

/**
 * Klassen des Wrappers (unbekannter Typ → info).
 *
 * @param {Object} attributes Block-Attribute.
 * @return {string} Klassen.
 */
export function notificationClassName( attributes ) {
	const type = TYPES.includes( attributes.type ) ? attributes.type : 'info';
	return `${ blockClassName(
		'notification',
		attributes.uniqueId
	) } is-type-${ type }`;
}

export default function save( { attributes } ) {
	const { icon, showIcon, dismissible, closeLabel } = attributes;
	return (
		<div
			{ ...useBlockProps.save( {
				className: notificationClassName( attributes ),
				role: 'note',
			} ) }
		>
			{ showIcon && <IconSlot name={ icon } /> }
			<div
				{ ...useInnerBlocksProps.save( { className: CONTENT_CLASS } ) }
			/>
			{ dismissible && (
				<button
					type="button"
					className={ CLOSE_CLASS }
					aria-label={ closeLabel }
				>
					<IconSlot name="x" />
				</button>
			) }
		</div>
	);
}
