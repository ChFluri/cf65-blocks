/**
 * Responsive-Wrapper: ein Wert pro Gerät (desktop/tablet/mobile).
 *
 * Gekoppelt an die Geräte-Vorschau des Editors – Umschalten hier schaltet
 * die Vorschau um und umgekehrt. Da die Vorschau den Editor-Iframe
 * verkleinert, greifen dieselben Media Queries wie im Frontend.
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

export const DEVICE_KEYS = {
	Desktop: 'desktop',
	Tablet: 'tablet',
	Mobile: 'mobile',
};

const DEVICE_LABELS = {
	Desktop: __( 'Desktop', 'cf65-blocks' ),
	Tablet: __( 'Tablet', 'cf65-blocks' ),
	Mobile: __( 'Mobil', 'cf65-blocks' ),
};

/**
 * @param {Object}                                                                   props
 * @param {string}                                                                   props.label    Beschriftung.
 * @param {Object|undefined}                                                         props.value    Werte pro Gerät, z. B. `{ desktop: '32px' }`.
 * @param {(next: Object|undefined) => void}                                         props.onChange Erhält das neue Objekt.
 * @param {(value: string|undefined, set: (v: string|undefined) => void) => Element} props.children Render-Funktion für den Wert des aktiven Geräts.
 * @return {Element} Control.
 */
export default function ResponsiveControl( {
	label,
	value,
	onChange,
	children,
} ) {
	const deviceType = useSelect(
		( select ) => select( editorStore )?.getDeviceType?.() ?? 'Desktop',
		[]
	);
	const { setDeviceType } = useDispatch( editorStore );
	const device = DEVICE_KEYS[ deviceType ] ?? 'desktop';
	const values = value && typeof value === 'object' ? value : {};

	const setDeviceValue = ( next ) => {
		const updated = { ...values };
		if ( next === undefined || next === '' ) {
			delete updated[ device ];
		} else {
			updated[ device ] = next;
		}
		onChange( Object.keys( updated ).length ? updated : undefined );
	};

	return (
		<fieldset className="cf65-responsive-control components-base-control">
			<legend className="components-base-control__label">
				{ label }
			</legend>
			<div
				role="group"
				className="cf65-responsive-control__devices"
				aria-label={ __( 'Gerät', 'cf65-blocks' ) }
			>
				{ Object.entries( DEVICE_KEYS ).map( ( [ type, key ] ) => (
					<Button
						key={ type }
						size="small"
						variant={ type === deviceType ? 'primary' : 'tertiary' }
						isPressed={ type === deviceType }
						onClick={ () => setDeviceType?.( type ) }
					>
						{ DEVICE_LABELS[ type ] }
						{ values[ key ] !== undefined && key !== 'desktop'
							? ' •'
							: '' }
					</Button>
				) ) }
			</div>
			{ children( values[ device ], setDeviceValue ) }
		</fieldset>
	);
}
