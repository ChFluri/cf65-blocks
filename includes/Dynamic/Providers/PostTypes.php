<?php
/**
 * Helfer: Post-Typ eines Objekts.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Providers;

use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * Ermittelt den Post-Typ aus `subtype` oder der Post-ID.
 */
final class PostTypes {

	/**
	 * Post-Typ oder '' (unbekannt).
	 *
	 * @param ObjectRef $ref Objekt.
	 */
	public static function of( ObjectRef $ref ): string {
		if ( ObjectRef::TYPE_POST !== $ref->type ) {
			return '';
		}
		if ( '' !== $ref->subtype ) {
			return $ref->subtype;
		}
		if ( $ref->id <= 0 ) {
			return '';
		}
		$type = \get_post_type( $ref->id );
		return \is_string( $type ) ? $type : '';
	}
}
