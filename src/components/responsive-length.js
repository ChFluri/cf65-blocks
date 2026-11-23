/**
 * Responsive Längeneingabe für ein Objekt-Attribut `{ desktop, tablet, mobile }`.
 */
import LengthControl from './length-control';
import ResponsiveControl from './responsive-control';

/**
 * @param {Object}                  props
 * @param {string}                  props.label         Beschriftung.
 * @param {string}                  props.attribute     Attributname.
 * @param {Object}                  props.attributes    Block-Attribute.
 * @param {(attrs: Object) => void} props.setAttributes Setter.
 * @return {Element} Control.
 */
export default function ResponsiveLength( {
	label,
	attribute,
	attributes,
	setAttributes,
} ) {
	return (
		<ResponsiveControl
			label={ label }
			value={ attributes[ attribute ] }
			onChange={ ( next ) => setAttributes( { [ attribute ]: next } ) }
		>
			{ ( value, onChange ) => (
				<LengthControl
					label={ label }
					value={ value }
					onChange={ onChange }
				/>
			) }
		</ResponsiveControl>
	);
}
