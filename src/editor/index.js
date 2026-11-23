/**
 * Gemeinsamer Editor-Einstiegspunkt.
 *
 * Hier werden ab Phase 1 die Extensions (gemeinsame Attribute/Panels),
 * Datenstores und RichText-Formate registriert.
 */
import { NAMESPACE } from './constants';

if ( process.env.NODE_ENV !== 'production' ) {
	// eslint-disable-next-line no-console
	console.debug( `[${ NAMESPACE }] Editor-Skript geladen` );
}
