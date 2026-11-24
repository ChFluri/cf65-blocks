<?php
/**
 * Löst Bindungen zu Werten auf (UMSETZPLAN Kap. 3.1).
 *
 * Bindung → Quelle (Objekt) → Objektprüfung → Provider → Feld (nur Felder,
 * die der Provider selbst anbietet) → Formatter.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Auflösung mit Request-Cache.
 */
final class Resolver {

	/** Obergrenze des Request-Caches. */
	private const MAX_CACHE = 1000;

	/**
	 * Request-Cache (Schlüssel → Wert).
	 *
	 * @var array<string, string|array<string, mixed>|null>
	 */
	private array $cache = array();

	/**
	 * Konstruktor.
	 *
	 * @param DynamicRegistry $registry Quellen und Provider.
	 * @param ObjectPolicy    $policy   Objektprüfung.
	 */
	public function __construct(
		private readonly DynamicRegistry $registry = new DynamicRegistry(),
		private readonly ObjectPolicy $policy = new ObjectPolicy()
	) {}

	/**
	 * Wert einer Bindung im Block-Kontext.
	 *
	 * @param Binding              $binding Bindung.
	 * @param array<string, mixed> $context Block-Kontext.
	 * @param string               $kind    Ausgabetyp ({@see Formatter}).
	 * @return string|array<string, mixed>|null Null = kein Wert (Fallback greift).
	 */
	public function resolve( Binding $binding, array $context, string $kind ): string|array|null {
		$source = $this->registry->source( $binding->source );
		$ref    = $source?->resolve( $binding, $context );
		if ( null === $ref ) {
			return null;
		}

		$key = $kind . '|' . $ref->key() . '|' . $binding->key();
		if ( \array_key_exists( $key, $this->cache ) ) {
			return $this->cache[ $key ];
		}

		$value = $this->lookup( $binding, $ref, $kind );
		if ( \count( $this->cache ) >= self::MAX_CACHE ) {
			$this->cache = array();
		}
		$this->cache[ $key ] = $value;
		return $value;
	}

	/**
	 * Felder je Provider, die zu einem Ausgabetyp passen (für den Feld-Picker).
	 *
	 * @param ObjectRef $ref Objekt (ID 0 erlaubt).
	 * @param string    $kind   Ausgabetyp.
	 * @return list<array{id: string, label: string, fields: list<array{name: string, label: string, type: string}>}>
	 */
	public function fields( ObjectRef $ref, string $kind ): array {
		$groups = array();
		foreach ( \array_keys( $this->registry->providers() ) as $id ) {
			$provider = $this->registry->provider( $id );
			if ( null === $provider ) {
				continue;
			}
			$fields = array();
			foreach ( $provider->fields( $ref ) as $field ) {
				if ( Formatter::accepts( $kind, $field->type ) ) {
					$fields[] = $field->to_array();
				}
			}
			if ( array() !== $fields ) {
				$groups[] = array(
					'id'     => $provider->id(),
					'label'  => $provider->label(),
					'fields' => $fields,
				);
			}
		}
		return $groups;
	}

	/**
	 * Quellen für den Feld-Picker.
	 *
	 * @return list<array{id: string, label: string}>
	 */
	public function sources(): array {
		$list = array();
		foreach ( $this->registry->sources() as $source ) {
			$list[] = array(
				'id'    => $source->id(),
				'label' => $source->label(),
			);
		}
		return $list;
	}

	/**
	 * Auflösung ohne Cache.
	 *
	 * @param Binding   $binding Bindung.
	 * @param ObjectRef $ref  Objekt.
	 * @param string    $kind    Ausgabetyp.
	 * @return string|array<string, mixed>|null
	 */
	private function lookup( Binding $binding, ObjectRef $ref, string $kind ): string|array|null {
		if ( ! $this->policy->can_read( $ref ) ) {
			return null;
		}
		$provider = $this->registry->provider( $binding->provider );
		if ( null === $provider ) {
			return null;
		}

		$field = null;
		foreach ( $provider->fields( $ref ) as $candidate ) {
			if ( $candidate->name === $binding->field ) {
				$field = $candidate;
				break;
			}
		}
		if ( null === $field || ! Formatter::accepts( $kind, $field->type ) ) {
			return null;
		}

		/**
		 * Ob ein Feld ausgegeben werden darf (UMSETZPLAN Kap. 3.7).
		 *
		 * @param bool      $allowed Standard: true.
		 * @param Field     $field   Feld.
		 * @param ObjectRef $ref  Objekt.
		 * @param Binding   $binding Bindung.
		 */
		if ( true !== \apply_filters( 'cf65_blocks/dynamic/allow_field', true, $field, $ref, $binding ) ) {
			return null;
		}

		return Formatter::format( $kind, $provider->value( $ref, $field, $binding->args ) );
	}
}
