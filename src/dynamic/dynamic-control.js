/**
 * Feld-Picker (Durchstich, UMSETZPLAN Kap. 3.6): Auswahl eines Feldes des
 * aktuellen Beitrags, gruppiert nach Provider. Der statische Wert des
 * Blocks bleibt als Fallback erhalten.
 */
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { bindingFromValue, bindingValue } from './binding';
import { useDynamicFields } from './hooks';

/**
 * @param {Object}                           props
 * @param {string}                           props.kind       `image` oder `link`.
 * @param {Object|undefined}                 props.binding    Aktuelle Bindung.
 * @param {(next: Object|undefined) => void} props.onChange   Neue Bindung oder undefined.
 * @param {string}                           [props.postType] Post-Typ aus dem Block-Kontext.
 * @return {Element} Control.
 */
export default function DynamicControl( {
	kind,
	binding,
	onChange,
	postType,
} ) {
	const fields = useDynamicFields( kind, postType ?? '' );
	const value = bindingValue( binding );
	const providers =
		fields.status === 'ready' && Array.isArray( fields.value?.providers )
			? fields.value.providers
			: [];

	const known = providers.some( ( provider ) =>
		provider.fields?.some(
			( field ) => `${ provider.id }:${ field.name }` === value
		)
	);

	let help = __(
		'Optional: Wert aus dem aktuellen Beitrag, auch im Query Loop.',
		'cf65-blocks'
	);
	if ( fields.status === 'error' ) {
		help = __( 'Felder konnten nicht geladen werden.', 'cf65-blocks' );
	} else if ( value ) {
		help = __(
			'Wert aus dem aktuellen Beitrag. Ist er leer, gilt der statische Wert.',
			'cf65-blocks'
		);
	}

	return (
		<SelectControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			className="cf65-dynamic-control"
			label={ __( 'Dynamischer Wert', 'cf65-blocks' ) }
			value={ value }
			disabled={ fields.status === 'loading' }
			onChange={ ( next ) => onChange( bindingFromValue( next ) ) }
			help={ help }
		>
			<option value="">
				{ fields.status === 'loading'
					? __( 'Wird geladen …', 'cf65-blocks' )
					: __( 'Kein (statischer Wert)', 'cf65-blocks' ) }
			</option>
			{ providers.map( ( provider ) => (
				<optgroup key={ provider.id } label={ provider.label }>
					{ provider.fields.map( ( field ) => (
						<option
							key={ field.name }
							value={ `${ provider.id }:${ field.name }` }
						>
							{ field.label }
						</option>
					) ) }
				</optgroup>
			) ) }
			{ value && ! known && fields.status !== 'loading' && (
				<option value={ value }>
					{ __( 'Nicht verfügbares Feld', 'cf65-blocks' ) }
				</option>
			) }
		</SelectControl>
	);
}
