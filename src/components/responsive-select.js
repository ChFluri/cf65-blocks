/**
 * Auswahlliste mit einem Wert pro Gerät (ResponsiveControl + SelectControl).
 */
import { SelectControl } from '@wordpress/components';

import ResponsiveControl from './responsive-control';

/**
 * @param {Object}                                props
 * @param {Object}                                props.attributes    Block-Attribute.
 * @param {(next: Object) => void}                props.setAttributes Setter.
 * @param {string}                                props.attribute     Attributname (Objekt pro Gerät).
 * @param {string}                                props.label         Beschriftung.
 * @param {Array<{label: string, value: string}>} props.options       Optionen; '' = Standard.
 * @return {Element} Control.
 */
export default function ResponsiveSelect( {
	attributes,
	setAttributes,
	attribute,
	label,
	options,
} ) {
	return (
		<ResponsiveControl
			label={ label }
			value={ attributes[ attribute ] }
			onChange={ ( next ) => setAttributes( { [ attribute ]: next } ) }
		>
			{ ( value, onChange ) => (
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ label }
					hideLabelFromVision
					value={ value ?? '' }
					options={ options }
					onChange={ onChange }
				/>
			) }
		</ResponsiveControl>
	);
}
