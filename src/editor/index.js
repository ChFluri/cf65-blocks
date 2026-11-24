/**
 * Gemeinsamer Editor-Einstiegspunkt.
 *
 * Registriert Editor-weite Funktionen (Auto-Recovery; später Extensions,
 * Datenstores, RichText-Formate). Die Konfiguration kommt aus PHP
 * (`window.cf65BlocksConfig`, siehe Registry::enqueue_editor_assets()).
 */
import { registerDynamicFormat } from '../dynamic/format';
import { registerPanels } from '../extensions/panels';
import { NAMESPACE } from './constants';
import { startAutoRecovery } from './recovery';
import './editor.scss';

const config = window.cf65BlocksConfig ?? {};

registerDynamicFormat();
registerPanels();

if ( config.autoRecovery !== false ) {
	startAutoRecovery();
}

if ( process.env.NODE_ENV !== 'production' ) {
	// eslint-disable-next-line no-console
	console.debug( `[${ NAMESPACE }] Editor-Skript geladen`, config );
}
