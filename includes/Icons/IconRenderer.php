<?php
/**
 * Laufzeit-Anreicherung: setzt Icon-SVGs in Platzhalter ein.
 *
 * Gespeichert wird nur `<span class="cf65-icon-slot" data-cf65-icon="star"
 * aria-hidden="true"></span>`, weil kses `<svg>` bei Benutzern ohne
 * `unfiltered_html` entfernen würde. Platzhalter ohne Icon-Namen füllt ein
 * Elternblock mit `supports.cf65.iconFallback` (Attributname), z. B. die
 * Icon-Liste für Einträge ohne eigenes Icon.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Icons;

use Cf65\Blocks\Blocks\Registry;

/**
 * `render_block`-Filter für cf65-Blöcke mit Icon-Platzhaltern.
 */
final class IconRenderer {

	public const SLOT_CLASS = 'cf65-icon-slot';

	/**
	 * Konstruktor.
	 *
	 * @param \Closure|null $supports_resolver Liefert `supports.cf65` zu einem
	 *                                         Blocknamen (Standard: Block-Registry).
	 */
	public function __construct( private readonly ?\Closure $supports_resolver = null ) {}

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_filter( 'render_block', array( $this, 'render' ), 10, 3 );
	}

	/**
	 * `render_block`-Filter.
	 *
	 * @param string         $content  Gerendertes HTML.
	 * @param array<mixed>   $block    Geparster Block.
	 * @param \WP_Block|null $instance Blockinstanz (Attribute inkl. Standardwerte).
	 */
	public function render( string $content, array $block, ?\WP_Block $instance = null ): string {
		$name = $block['blockName'] ?? null;
		if ( ! \is_string( $name ) || ! \str_starts_with( $name, Registry::BLOCK_PREFIX ) || ! \str_contains( $content, self::SLOT_CLASS ) ) {
			return $content;
		}

		return self::fill( $content, ( new IconSlotScanner( $content ) )->scan(), $this->fallback( $name, $block, $instance ) );
	}

	/**
	 * Icon des Elternblocks für Platzhalter ohne Namen.
	 *
	 * Standardwerte stehen nicht im Block-Kommentar (`attrs`), daher zuerst
	 * die Attribute der Instanz.
	 *
	 * @param string         $name     Blockname.
	 * @param array<mixed>   $block    Geparster Block.
	 * @param \WP_Block|null $instance Blockinstanz.
	 */
	public function fallback( string $name, array $block, ?\WP_Block $instance ): mixed {
		$attr = $this->supports( $name )['iconFallback'] ?? null;
		if ( ! \is_string( $attr ) ) {
			return null;
		}
		$attributes = null !== $instance && \is_array( $instance->attributes ) ? $instance->attributes : array();
		if ( \array_key_exists( $attr, $attributes ) ) {
			return $attributes[ $attr ];
		}
		$parsed = \is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
		return $parsed[ $attr ] ?? null;
	}

	/**
	 * Setzt SVGs in leere Platzhalter ein (rein, testbar ohne WordPress-HTML-API).
	 *
	 * @param string                                        $html     HTML.
	 * @param list<array{position: int, icon: string|null}> $slots    Platzhalter.
	 * @param mixed                                         $fallback Icon für Platzhalter ohne Namen.
	 */
	public static function fill( string $html, array $slots, mixed $fallback ): string {
		\usort( $slots, static fn ( array $a, array $b ): int => $b['position'] <=> $a['position'] );
		foreach ( $slots as $slot ) {
			$position = $slot['position'];
			// Nur leere Platzhalter (schon gefüllte überspringen, z. B. durch Kindblöcke).
			if ( $position < 0 || $position > \strlen( $html ) || ! \str_starts_with( \substr( $html, $position ), '</span>' ) ) {
				continue;
			}
			$svg = IconLibrary::svg( $slot['icon'] ?? $fallback );
			if ( '' !== $svg ) {
				$html = \substr_replace( $html, $svg, $position, 0 );
			}
		}
		return $html;
	}

	/**
	 * `supports.cf65` eines Blocktyps.
	 *
	 * @param string $name Blockname.
	 * @return array<mixed>
	 */
	private function supports( string $name ): array {
		if ( null !== $this->supports_resolver ) {
			$supports = ( $this->supports_resolver )( $name );
			return \is_array( $supports ) ? $supports : array();
		}
		$type = \WP_Block_Type_Registry::get_instance()->get_registered( $name );
		$cf65 = null !== $type && \is_array( $type->supports ) ? ( $type->supports['cf65'] ?? null ) : null;
		return \is_array( $cf65 ) ? $cf65 : array();
	}
}
