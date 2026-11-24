<?php
/**
 * Darf aus diesem Objekt gelesen werden? (UMSETZPLAN Kap. 3.7 und 7.3)
 *
 * Eine Regel für Frontend und Editor-Vorschau: Ein Wert wird nur
 * ausgegeben, wenn das Objekt öffentlich sichtbar ist (veröffentlicht, kein
 * Passwortschutz) oder der aktuelle Benutzer es bearbeiten darf. So kann
 * niemand Felder privater Entwürfe in eine öffentliche Seite binden, und die
 * Vorschau zeigt nie mehr, als das Frontend diesem Benutzer zeigen würde.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Objektprüfung.
 */
final class ObjectPolicy {

	/**
	 * Ob Werte des Objekts ausgegeben werden dürfen.
	 *
	 * @param ObjectRef $ref Objekt.
	 */
	public function can_read( ObjectRef $ref ): bool {
		if ( ObjectRef::TYPE_POST !== $ref->type || $ref->id <= 0 ) {
			return false;
		}
		$post = \get_post( $ref->id );
		if ( ! $post instanceof \WP_Post ) {
			return false;
		}
		if ( \current_user_can( 'edit_post', $post->ID ) ) {
			return true;
		}
		if ( \post_password_required( $post ) ) {
			return false;
		}
		return \is_post_publicly_viewable( $post );
	}
}
