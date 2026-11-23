/**
 * Gemeinsamer Editor-Einstiegspunkt.
 *
 * Registriert Editor-weite Funktionen (Auto-Recovery; später Extensions,
 * Datenstores, RichText-Formate). Die Konfiguration kommt aus PHP
 * (`window.cf65BlocksConfig`, siehe Registry::enqueue_editor_assets()).
 */
import { NAMESPACE } from './constants';
import { startAutoRecovery } from './recovery';

const config = window.cf65BlocksConfig ?? {};

if ( config.autoRecovery !== false ) {
	startAutoRecovery();
}

if ( process.env.NODE_ENV !== 'production' ) {
	// eslint-disable-next-line no-console
	console.debug( `[${ NAMESPACE }] Editor-Skript geladen`, config );
}
