/**
 * Icon-Auswahl mit Suche (Gruppen „Allgemein“ und „Marken“).
 */
import {
	BaseControl,
	Button,
	Dropdown,
	SearchControl,
	TabPanel,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { hasIcon, iconLabel, iconNames, IconSvg } from './library';

/**
 * @param {Object}                           props
 * @param {string}                           props.label        Beschriftung.
 * @param {string|undefined}                 props.value        Aktuelles Icon.
 * @param {(next: string|undefined) => void} props.onChange     Setter.
 * @param {boolean}                          [props.allowReset] „Zurücksetzen“ anbieten.
 * @param {string}                           [props.help]       Hilfetext.
 * @return {Element} Control.
 */
export default function IconPicker( {
	label,
	value,
	onChange,
	allowReset = false,
	help,
} ) {
	const [ term, setTerm ] = useState( '' );
	const id = useInstanceId( IconPicker, 'cf65-icon-picker' );

	const grid = ( group, close ) => {
		const names = iconNames( group, term );
		return names.length ? (
			<div className="cf65-icon-picker__grid">
				{ names.map( ( name ) => (
					<Button
						key={ name }
						className="cf65-icon-picker__item"
						label={ iconLabel( name ) }
						showTooltip
						isPressed={ name === value }
						onClick={ () => {
							onChange( name );
							close();
						} }
					>
						<IconSvg name={ name } />
					</Button>
				) ) }
			</div>
		) : (
			<p className="cf65-icon-picker__empty">
				{ __( 'Keine Icons gefunden.', 'cf65-blocks' ) }
			</p>
		);
	};

	return (
		<BaseControl
			__nextHasNoMarginBottom
			id={ id }
			label={ label }
			help={ help }
		>
			<Dropdown
				className="cf65-icon-picker"
				contentClassName="cf65-icon-picker__popover"
				popoverProps={ { placement: 'left-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<div className="cf65-icon-picker__toggle">
						<Button
							id={ id }
							variant="secondary"
							onClick={ onToggle }
							aria-expanded={ isOpen }
						>
							{ hasIcon( value ) ? (
								<>
									<IconSvg name={ value } />
									<span>{ iconLabel( value ) }</span>
								</>
							) : (
								__( 'Icon wählen', 'cf65-blocks' )
							) }
						</Button>
						{ allowReset && hasIcon( value ) && (
							<Button
								variant="tertiary"
								size="small"
								onClick={ () => onChange( undefined ) }
							>
								{ __( 'Zurücksetzen', 'cf65-blocks' ) }
							</Button>
						) }
					</div>
				) }
				renderContent={ ( { onClose } ) => (
					<div className="cf65-icon-picker__content">
						<SearchControl
							__nextHasNoMarginBottom
							value={ term }
							onChange={ setTerm }
							placeholder={ __(
								'Icons suchen …',
								'cf65-blocks'
							) }
						/>
						<TabPanel
							tabs={ [
								{
									name: 'general',
									title: __( 'Allgemein', 'cf65-blocks' ),
								},
								{
									name: 'brands',
									title: __( 'Marken', 'cf65-blocks' ),
								},
							] }
						>
							{ ( tab ) => grid( tab.name, onClose ) }
						</TabPanel>
					</div>
				) }
			/>
		</BaseControl>
	);
}
