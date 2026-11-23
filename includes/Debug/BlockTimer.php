<?php
/**
 * Misst das Rendering von cf65-Blöcken über `pre_render_block` (früheste
 * Priorität) und `render_block` (späteste Priorität).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

use Cf65\Blocks\Blocks\Registry;

/**
 * Block-Hooks für den Profiler. Wird nur im Debug-Modus bzw. vom
 * Benchmark registriert.
 */
final class BlockTimer {

	/**
	 * Hooks registrieren.
	 */
	public function register(): void {
		\add_filter( 'pre_render_block', array( $this, 'before' ), \PHP_INT_MIN, 2 );
		\add_filter( 'render_block', array( $this, 'after' ), \PHP_INT_MAX, 2 );
	}

	/**
	 * Hooks entfernen.
	 */
	public function unregister(): void {
		\remove_filter( 'pre_render_block', array( $this, 'before' ), \PHP_INT_MIN );
		\remove_filter( 'render_block', array( $this, 'after' ), \PHP_INT_MAX );
	}

	/**
	 * `pre_render_block`: Start der Messung.
	 *
	 * @param string|null  $pre_render Vorbelegtes Ergebnis (unverändert zurückgegeben).
	 * @param array<mixed> $block      Geparster Block.
	 * @return string|null
	 */
	public function before( ?string $pre_render, array $block ): ?string {
		$name = self::own_name( $block );
		if ( null !== $name && null === $pre_render ) {
			Profiling::get()->begin_block( $name );
		}
		return $pre_render;
	}

	/**
	 * `render_block`: Ende der Messung.
	 *
	 * @param string       $content Gerendertes HTML (unverändert zurückgegeben).
	 * @param array<mixed> $block   Geparster Block.
	 */
	public function after( string $content, array $block ): string {
		$name = self::own_name( $block );
		if ( null !== $name ) {
			Profiling::get()->end_block( $name );
		}
		return $content;
	}

	/**
	 * Blockname, falls es ein cf65-Block ist.
	 *
	 * @param array<mixed> $block Geparster Block.
	 */
	private static function own_name( array $block ): ?string {
		$name = $block['blockName'] ?? null;
		return \is_string( $name ) && \str_starts_with( $name, Registry::BLOCK_PREFIX ) ? $name : null;
	}
}
