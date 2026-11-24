/**
 * Gemeinsame Auswahllisten für Container-Blöcke ('' = Standard).
 */
import { __ } from '@wordpress/i18n';

export const TEXT_ALIGN_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: 'left' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'right' },
];

/** Hauptachse (justify-content), z. B. vertikal in Spalten-Flexboxen. */
export const VERTICAL_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Oben', 'cf65-blocks' ), value: 'flex-start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Unten', 'cf65-blocks' ), value: 'flex-end' },
];

/** Querachse (align-items), z. B. horizontal in Spalten-Flexboxen. */
export const HORIZONTAL_OPTIONS = [
	{ label: __( 'Standard', 'cf65-blocks' ), value: '' },
	{ label: __( 'Links', 'cf65-blocks' ), value: 'flex-start' },
	{ label: __( 'Mitte', 'cf65-blocks' ), value: 'center' },
	{ label: __( 'Rechts', 'cf65-blocks' ), value: 'flex-end' },
];
