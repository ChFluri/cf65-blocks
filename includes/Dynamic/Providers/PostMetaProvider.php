<?php
/**
 * Provider „Post-Meta“: registrierte Meta-Felder (UMSETZPLAN Kap. 3.4).
 *
 * Nur Meta, die mit `register_post_meta()` und `show_in_rest` registriert
 * ist; geschützte Meta (`_…`, `is_protected_meta`) ist ausgeschlossen
 * (Kap. 7.3).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Providers;

use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * Skalare, öffentliche Post-Meta als Text.
 */
final class PostMetaProvider implements ProviderInterface {

	public const ID = 'meta';

	private const SCALAR_TYPES = array( 'string', 'integer', 'number' );

	/**
	 * Felder je Post-Typ (Request-Cache).
	 *
	 * @var array<string, list<Field>>
	 */
	private array $fields = array();

	/**
	 * {@inheritDoc}
	 */
	public function id(): string {
		return self::ID;
	}

	/**
	 * {@inheritDoc}
	 */
	public function label(): string {
		return \__( 'Post-Meta', 'cf65-blocks' );
	}

	/**
	 * {@inheritDoc}
	 */
	public function is_available(): bool {
		return true;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param ObjectRef $ref Objekt.
	 * @return list<Field>
	 */
	public function fields( ObjectRef $ref ): array {
		$post_type = PostTypes::of( $ref );
		if ( ObjectRef::TYPE_POST !== $ref->type ) {
			return array();
		}
		if ( isset( $this->fields[ $post_type ] ) ) {
			return $this->fields[ $post_type ];
		}

		$keys = \get_registered_meta_keys( 'post' );
		if ( '' !== $post_type ) {
			$keys = \array_merge( $keys, \get_registered_meta_keys( 'post', $post_type ) );
		}

		$fields = array();
		foreach ( $keys as $key => $args ) {
			if ( ! \is_string( $key ) || ! \is_array( $args ) || ! self::is_public( $key, $args ) ) {
				continue;
			}
			$label    = \is_string( $args['description'] ?? null ) && '' !== $args['description'] ? $args['description'] : $key;
			$fields[] = new Field( $key, $label, Field::TYPE_TEXT );
		}
		\usort( $fields, static fn ( Field $a, Field $b ): int => \strnatcasecmp( $a->label, $b->label ) );

		$this->fields[ $post_type ] = $fields;
		return $fields;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param ObjectRef                            $ref   Objekt.
	 * @param Field                                $field Feld.
	 * @param array<string, string|int|float|bool> $args  Optionen.
	 */
	public function value( ObjectRef $ref, Field $field, array $args ): mixed {
		$value = \get_post_meta( $ref->id, $field->name, true );
		return \is_scalar( $value ) ? $value : null;
	}

	/**
	 * Öffentlich: skalar, einzeln, in REST sichtbar, nicht geschützt.
	 *
	 * @param string       $key  Meta-Schlüssel.
	 * @param array<mixed> $args Registrierung.
	 */
	private static function is_public( string $key, array $args ): bool {
		if ( 1 !== \preg_match( '/^[A-Za-z0-9][A-Za-z0-9_.\-]{0,63}$/D', $key ) || \is_protected_meta( $key, 'post' ) ) {
			return false;
		}
		return ! empty( $args['show_in_rest'] )
			&& ! empty( $args['single'] )
			&& \in_array( $args['type'] ?? 'string', self::SCALAR_TYPES, true );
	}
}
