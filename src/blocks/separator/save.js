/**
 * Markup-Vertrag v1 (UMSETZPLAN Kap. 2.2, Schicht 1): leerer Wrapper,
 * Spiegeln über Klassen, keine Inline-Styles.
 *
 * Das SVG wird **nicht gespeichert** (kses entfernt `<svg>` bei Benutzern
 * ohne `unfiltered_html`), sondern beim Rendern eingesetzt:
 * includes/Blocks/SeparatorRenderer.php bzw. im Editor `SeparatorShape`.
 * Formen: includes/Blocks/shapes.json.
 *
 * Änderungen erfordern eine neue Fixture unter
 * tests/fixtures/blocks/separator/ und eine `deprecated`-Definition.
 */
import { useBlockProps } from '@wordpress/block-editor';

import shapes from '../../../includes/Blocks/shapes.json';
import { blockClassName } from '../../extensions/unique-id';

/** Formname → SVG-Pfad. */
export const SHAPES = Object.fromEntries(
	Object.entries( shapes ).filter( ( [ name ] ) => ! name.startsWith( '$' ) )
);

const DEFAULT_SHAPE = Object.keys( SHAPES )[ 0 ];

/**
 * @param {unknown} design Gewählte Form.
 * @return {string} Gültiger Formname.
 */
export function shapeName( design ) {
	return typeof design === 'string' &&
		Object.prototype.hasOwnProperty.call( SHAPES, design )
		? design
		: DEFAULT_SHAPE;
}

/**
 * @param {Object} attributes Attribute.
 * @return {string} Klassen des Wrappers.
 */
export function separatorClassName( attributes ) {
	return [
		blockClassName( 'separator', attributes.uniqueId ),
		attributes.flipX === true ? 'cf65-separator--flip-x' : null,
		attributes.flipY === true ? 'cf65-separator--flip-y' : null,
	]
		.filter( Boolean )
		.join( ' ' );
}

/**
 * SVG für Editor-Vorschau (identisch zur Server-Ausgabe).
 *
 * @param {Object} props
 * @param {string} props.design Formname.
 * @return {Element} SVG.
 */
export function SeparatorShape( { design } ) {
	return (
		<svg
			viewBox="0 0 1000 100"
			preserveAspectRatio="none"
			focusable="false"
		>
			<path d={ SHAPES[ shapeName( design ) ] } />
		</svg>
	);
}

export default function save( { attributes } ) {
	return (
		<div
			{ ...useBlockProps.save( {
				className: separatorClassName( attributes ),
				'aria-hidden': 'true',
			} ) }
		/>
	);
}
