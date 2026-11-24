<?php
/**
 * Wandelt Rohwerte in den Ausgabetyp eines Block-Attributs (UMSETZPLAN Kap. 3.5).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

use Cf65\Blocks\Security\Sanitizer;

/**
 * Ausgabetypen (`kind`) und welche Feldtypen sie annehmen.
 */
final class Formatter {

	public const KIND_LINK  = 'link';
	public const KIND_IMAGE = 'image';

	/** Ausgabetyp → zulässige Feldtypen. */
	public const ACCEPTS = array(
		self::KIND_LINK  => array( Field::TYPE_URL ),
		self::KIND_IMAGE => array( Field::TYPE_IMAGE ),
	);

	/**
	 * Ob ein Feldtyp für einen Ausgabetyp passt.
	 *
	 * @param string $kind       Ausgabetyp.
	 * @param string $field_type Feldtyp.
	 */
	public static function accepts( string $kind, string $field_type ): bool {
		return \in_array( $field_type, self::ACCEPTS[ $kind ] ?? array(), true );
	}

	/**
	 * Formatiert einen Rohwert.
	 *
	 * @param string $kind  Ausgabetyp.
	 * @param mixed  $value Rohwert vom Provider.
	 * @return string|array{url: string, id: int, alt: string, width: int, height: int}|null
	 */
	public static function format( string $kind, mixed $value ): string|array|null {
		return match ( $kind ) {
			self::KIND_LINK  => self::link( $value ),
			self::KIND_IMAGE => self::image( $value ),
			default          => null,
		};
	}

	/**
	 * Link-URL.
	 *
	 * @param mixed $value Rohwert.
	 */
	public static function link( mixed $value ): ?string {
		return Sanitizer::url( $value, Sanitizer::LINK_SCHEMES );
	}

	/**
	 * Bild aus Attachment-ID oder URL.
	 *
	 * @param mixed $value Rohwert.
	 * @return array{url: string, id: int, alt: string, width: int, height: int}|null
	 */
	public static function image( mixed $value ): ?array {
		if ( \is_string( $value ) && 1 === \preg_match( '/^[1-9][0-9]{0,18}$/D', $value ) ) {
			$value = (int) $value;
		}

		if ( \is_int( $value ) ) {
			if ( $value <= 0 || ! \wp_attachment_is_image( $value ) ) {
				return null;
			}
			$src = \wp_get_attachment_image_src( $value, 'full' );
			if ( ! \is_array( $src ) ) {
				return null;
			}
			$url = Sanitizer::url( $src[0], Sanitizer::IMAGE_SCHEMES );
			if ( null === $url ) {
				return null;
			}
			$alt = \get_post_meta( $value, '_wp_attachment_image_alt', true );
			return array(
				'url'    => $url,
				'id'     => $value,
				'alt'    => \is_string( $alt ) ? \trim( \wp_strip_all_tags( $alt ) ) : '',
				'width'  => \max( 0, (int) $src[1] ),
				'height' => \max( 0, (int) $src[2] ),
			);
		}

		$url = Sanitizer::url( $value, Sanitizer::IMAGE_SCHEMES );
		if ( null === $url ) {
			return null;
		}
		return array(
			'url'    => $url,
			'id'     => 0,
			'alt'    => '',
			'width'  => 0,
			'height' => 0,
		);
	}
}
