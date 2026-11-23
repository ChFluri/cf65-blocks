/**
 * Längeneingabe: Zahl + Einheit → String wie `32px`.
 *
 * Verwendet nur stabile Komponenten (kein __experimentalUnitControl).
 * Ungültige Eingaben werden zusätzlich serverseitig verworfen.
 */
import {
	Flex,
	FlexBlock,
	FlexItem,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const UNITS = [ 'px', 'em', 'rem', '%', 'vw', 'vh' ];
const PARSE = /^(-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+))(px|em|rem|%|vw|vh)$/;

/**
 * @param {string|undefined} value Länge, z. B. `2rem`.
 * @return {{ number: string, unit: string }} Zerlegt.
 */
export function parseLength( value ) {
	const match = typeof value === 'string' ? PARSE.exec( value ) : null;
	return match
		? { number: match[ 1 ], unit: match[ 2 ] }
		: { number: '', unit: 'px' };
}

/**
 * @param {Object}                           props
 * @param {string}                           [props.label]  Beschriftung (optional, z. B. innerhalb ResponsiveControl leer).
 * @param {string|undefined}                 props.value    Aktueller Wert.
 * @param {(next: string|undefined) => void} props.onChange Erhält String oder undefined.
 * @return {Element} Control.
 */
export default function LengthControl( { label, value, onChange } ) {
	const { number, unit } = parseLength( value );

	const update = ( nextNumber, nextUnit ) => {
		onChange(
			nextNumber === '' ? undefined : `${ nextNumber }${ nextUnit }`
		);
	};

	return (
		<Flex align="flex-end">
			<FlexBlock>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ label ?? __( 'Wert', 'cf65-blocks' ) }
					type="number"
					step="any"
					value={ number }
					onChange={ ( next ) => update( next, unit ) }
				/>
			</FlexBlock>
			<FlexItem>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Einheit', 'cf65-blocks' ) }
					hideLabelFromVision
					value={ unit }
					options={ UNITS.map( ( u ) => ( { label: u, value: u } ) ) }
					onChange={ ( next ) => update( number, next ) }
				/>
			</FlexItem>
		</Flex>
	);
}
