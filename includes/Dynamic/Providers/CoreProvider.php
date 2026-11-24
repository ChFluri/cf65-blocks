<?php
/**
 * Provider „WordPress“: Standardfelder eines Beitrags.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Providers;

use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * Titel, Auszug, Datum, Link und Beitragsbild.
 */
final class CoreProvider implements ProviderInterface {

	public const ID = 'core';

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
		return \__( 'WordPress', 'cf65-blocks' );
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
		if ( ObjectRef::TYPE_POST !== $ref->type ) {
			return array();
		}
		return array(
			new Field( 'title', \__( 'Titel', 'cf65-blocks' ), Field::TYPE_TEXT ),
			new Field( 'excerpt', \__( 'Auszug', 'cf65-blocks' ), Field::TYPE_TEXT ),
			new Field( 'date', \__( 'Datum', 'cf65-blocks' ), Field::TYPE_TEXT ),
			new Field( 'permalink', \__( 'Link zum Beitrag', 'cf65-blocks' ), Field::TYPE_URL ),
			new Field( 'featured_image', \__( 'Beitragsbild', 'cf65-blocks' ), Field::TYPE_IMAGE ),
		);
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param ObjectRef                            $ref Objekt.
	 * @param Field                                $field  Feld.
	 * @param array<string, string|int|float|bool> $args   Optionen.
	 */
	public function value( ObjectRef $ref, Field $field, array $args ): mixed {
		$id = $ref->id;
		return match ( $field->name ) {
			'title'          => \get_the_title( $id ),
			'excerpt'        => \get_the_excerpt( $id ),
			'date'           => \get_the_date( '', $id ),
			'permalink'      => \get_permalink( $id ),
			'featured_image' => \get_post_thumbnail_id( $id ),
			default          => null,
		};
	}
}
