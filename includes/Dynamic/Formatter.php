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

	public const KIND_TEXT  = 'text';
	public const KIND_LINK  = 'link';
	public const KIND_IMAGE = 'image';

	/** Ausgabetyp → zulässige Feldtypen. */
	public const ACCEPTS = array(
		self::KIND_TEXT  => array( Field::TYPE_TEXT, Field::TYPE_URL ),
		self::KIND_LINK  => array( Field::TYPE_URL ),
		self::KIND_IMAGE => array( Field::TYPE_IMAGE ),
	);

	/** Maximale Länge eines Textwerts (Zeichen). */
	private const MAX_TEXT_CHARS = 10000;

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
			self::KIND_TEXT  => self::text( $value ),
			self::KIND_LINK  => self::link( $value ),
			self::KIND_IMAGE => self::image( $value ),
			default          => null,
		};
	}

	/**
	 * Reiner Text (ohne HTML, Entities aufgelöst). Escaping erst bei der Ausgabe.
	 *
	 * @param mixed $value Rohwert.
	 */
	public static function text( mixed $value ): ?string {
		if ( \is_int( $value ) || ( \is_float( $value ) && \is_finite( $value ) ) ) {
			return (string) $value;
		}
		if ( ! \is_string( $value ) ) {
			return null;
		}
		$text = \html_entity_decode( \wp_strip_all_tags( $value ), \ENT_QUOTES | \ENT_HTML5, 'UTF-8' );
		$text = \trim( (string) \preg_replace( '/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', '', $text ) );
		if ( '' === $text ) {
			return null;
		}
		if ( \strlen( $text ) > self::MAX_TEXT_CHARS && 1 === \preg_match( '/^.{0,' . self::MAX_TEXT_CHARS . '}/su', $text, $match ) ) {
			$text = $match[0];
		}
		return $text;
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
