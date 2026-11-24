<?php
/**
 * Quelle „Aktueller Beitrag“: `postId` aus dem Block-Kontext (Query Loop,
 * Beitragsinhalt), sonst der globale Beitrag.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Sources;

use Cf65\Blocks\Dynamic\Binding;
use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * Liefert den Beitrag, in dessen Kontext der Block gerendert wird.
 */
final class CurrentPostSource implements SourceInterface {

	public const ID = 'current-post';

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
		return \__( 'Aktueller Beitrag', 'cf65-blocks' );
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param Binding              $binding Bindung.
	 * @param array<string, mixed> $context Block-Kontext.
	 */
	public function resolve( Binding $binding, array $context ): ?ObjectRef {
		$id = $context['postId'] ?? null;
		if ( ! \is_int( $id ) || $id <= 0 ) {
			$id = \get_the_ID();
		}
		if ( ! \is_int( $id ) || $id <= 0 ) {
			return null;
		}
		$type = $context['postType'] ?? null;
		return new ObjectRef( ObjectRef::TYPE_POST, $id, \is_string( $type ) ? $type : '' );
	}
}
