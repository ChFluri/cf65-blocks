<?php
/**
 * Laufzeit-Anreicherung: CSS für gerenderte cf65-Blöcke ausgeben.
 *
 * Das gespeicherte Markup (save) bleibt unverändert; Styles entstehen erst
 * beim Rendern (UMSETZPLAN Kap. 2.2, Schicht 1).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Styles;

use Cf65\Blocks\Blocks\Registry;
use Cf65\Blocks\Debug\Profiling;
use const Cf65\Blocks\VERSION;

/**
 * Sammelt das Block-CSS einer Seite in einem Inline-Stylesheet.
 */
final class StyleRenderer {

	public const HANDLE = 'cf65-blocks-dynamic';

	/**
	 * Bereits ausgegebenes CSS (Hash → true), verhindert Duplikate.
	 *
	 * @var array<string, true>
	 */
	private array $printed = array();

	/**
	 * Konstruktor.
	 *
	 * @param CssGenerator  $generator    CSS-Generator.
	 * @param \Closure|null $map_resolver Liefert die Style-Map zu einem Blocknamen
	 *                                    (Standard: Block-Registry; injizierbar für Tests).
	 */
	public function __construct(
		private readonly CssGenerator $generator,
		private readonly ?\Closure $map_resolver = null
	) {}

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_filter( 'render_block', array( $this, 'render' ), 10, 2 );
	}

	/**
	 * `render_block`-Filter.
	 *
	 * @param string       $content Gerendertes Block-HTML.
	 * @param array<mixed> $block   Geparster Block.
	 * @return string Unverändertes HTML.
	 */
	public function render( string $content, array $block ): string {
		$name = $block['blockName'] ?? null;
		if ( ! \is_string( $name ) || ! \str_starts_with( $name, Registry::BLOCK_PREFIX ) ) {
			return $content;
		}

		$map = null !== $this->map_resolver ? ( $this->map_resolver )( $name ) : self::style_map( $name );
		if ( ! \is_array( $map ) || array() === $map ) {
			return $content;
		}

		$profiler   = Profiling::get();
		$start      = $profiler->enabled() ? \hrtime( true ) : 0;
		$attributes = \is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
		$css        = $this->generator->generate( $attributes['uniqueId'] ?? null, $map, $attributes );

		if ( $profiler->enabled() ) {
			$profiler->record( 'css', ( \hrtime( true ) - $start ) / 1e6, \strlen( $css ) );
		}

		if ( '' !== $css ) {
			$this->add( $css );
		}

		return $content;
	}

	/**
	 * Style-Map aus `supports.cf65.styles` des registrierten Blocktyps.
	 *
	 * @param string $name Blockname.
	 * @return array<mixed>|null
	 */
	private static function style_map( string $name ): ?array {
		$type = \WP_Block_Type_Registry::get_instance()->get_registered( $name );
		if ( null === $type || ! \is_array( $type->supports ) ) {
			return null;
		}
		$cf65 = $type->supports['cf65'] ?? null;
		$map  = \is_array( $cf65 ) ? ( $cf65['styles'] ?? null ) : null;
		return \is_array( $map ) ? $map : null;
	}

	/**
	 * Hängt CSS an das Inline-Stylesheet an (im Head oder – bei klassischen
	 * Themes nach wp_head – über print_late_styles im Footer).
	 *
	 * @param string $css Bereinigtes CSS.
	 */
	private function add( string $css ): void {
		$hash = \md5( $css );
		if ( isset( $this->printed[ $hash ] ) ) {
			return;
		}
		$this->printed[ $hash ] = true;

		if ( ! \wp_style_is( self::HANDLE, 'registered' ) ) {
			\wp_register_style( self::HANDLE, false, array(), VERSION );
		}
		\wp_enqueue_style( self::HANDLE );
		\wp_add_inline_style( self::HANDLE, $css );
	}
}
