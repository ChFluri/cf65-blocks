<?php
/**
 * Bindung eines Block-Attributs an einen dynamischen Wert (UMSETZPLAN Kap. 3.2).
 *
 * Gespeichert im Block-Attribut `dynamic`, z. B.
 * `{"url":{"source":"current-post","provider":"core","field":"featured_image"}}`.
 *
 * Die Prüfung hier ist rein strukturell: Ob Quelle, Provider und Feld
 * existieren, entscheidet erst der {@see Resolver}. So gehen Bindungen nicht
 * verloren, wenn z. B. ACF vorübergehend deaktiviert ist.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Unveränderliche, strukturell gültige Bindung.
 */
final class Binding {

	private const ID_PATTERN    = '/^[a-z][a-z0-9-]{0,31}$/D';
	private const FIELD_PATTERN = '/^[A-Za-z0-9_][A-Za-z0-9_.\-]{0,63}$/D';
	private const ARG_PATTERN   = '/^[a-z][A-Za-z0-9_]{0,31}$/D';
	private const MAX_ARGS      = 16;
	private const MAX_ARG_BYTES = 200;

	/**
	 * Konstruktor (nur über {@see self::from_array()}).
	 *
	 * @param string                               $source   Quelle, z. B. `current-post`.
	 * @param string                               $provider Provider, z. B. `core`.
	 * @param string                               $field    Feldname.
	 * @param array<string, string|int|float|bool> $args     Optionen.
	 */
	private function __construct(
		public readonly string $source,
		public readonly string $provider,
		public readonly string $field,
		public readonly array $args
	) {}

	/**
	 * Bindung aus Rohdaten (Block-Attribut, REST).
	 *
	 * @param mixed $raw Rohwert.
	 * @return self|null Null bei ungültiger Struktur.
	 */
	public static function from_array( mixed $raw ): ?self {
		if ( ! \is_array( $raw ) ) {
			return null;
		}
		$source   = $raw['source'] ?? null;
		$provider = $raw['provider'] ?? null;
		$field    = $raw['field'] ?? null;
		if ( ! self::matches( self::ID_PATTERN, $source ) || ! self::matches( self::ID_PATTERN, $provider ) || ! self::matches( self::FIELD_PATTERN, $field ) ) {
			return null;
		}
		/** @var string $source */
		/** @var string $provider */
		/** @var string $field */

		$args = self::sanitize_args( $raw['args'] ?? array() );
		if ( null === $args ) {
			return null;
		}

		return new self( $source, $provider, $field, $args );
	}

	/**
	 * Normalisierte Darstellung (bekannte Schlüssel, `args` nur wenn gesetzt).
	 *
	 * @return array<string, mixed>
	 */
	public function to_array(): array {
		$data = array(
			'source'   => $this->source,
			'provider' => $this->provider,
			'field'    => $this->field,
		);
		if ( array() !== $this->args ) {
			$data['args'] = $this->args;
		}
		return $data;
	}

	/**
	 * Stabiler Schlüssel für Caches.
	 */
	public function key(): string {
		return (string) \wp_json_encode( $this->to_array() );
	}

	/**
	 * Optionen: nur skalare Werte mit einfachen Schlüsseln.
	 *
	 * @param mixed $args Rohwert.
	 * @return array<string, string|int|float|bool>|null Null bei ungültiger Struktur.
	 */
	private static function sanitize_args( mixed $args ): ?array {
		if ( ! \is_array( $args ) ) {
			return null;
		}
		if ( array() !== $args && \array_is_list( $args ) ) {
			return null;
		}
		if ( \count( $args ) > self::MAX_ARGS ) {
			return null;
		}
		$clean = array();
		foreach ( $args as $key => $value ) {
			if ( ! self::matches( self::ARG_PATTERN, $key ) ) {
				return null;
			}
			if ( \is_string( $value ) ) {
				if ( \strlen( $value ) > self::MAX_ARG_BYTES || 1 === \preg_match( '/[\x00-\x1f\x7f]/', $value ) ) {
					return null;
				}
			} elseif ( ! \is_int( $value ) && ! \is_bool( $value ) && ! ( \is_float( $value ) && \is_finite( $value ) ) ) {
				return null;
			}
			/** @var string $key */
			$clean[ $key ] = $value;
		}
		\ksort( $clean );
		return $clean;
	}

	/**
	 * @param string $pattern Regex.
	 * @param mixed  $value   Wert.
	 */
	private static function matches( string $pattern, mixed $value ): bool {
		return \is_string( $value ) && 1 === \preg_match( $pattern, $value );
	}
}
