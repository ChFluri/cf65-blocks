<?php
/**
 * Laufzeit-Anreicherung für cf65/separator: setzt das SVG der gewählten Form
 * in den gespeicherten (leeren) Wrapper ein.
 *
 * Das SVG wird nicht gespeichert, weil kses `<svg>` bei Benutzern ohne
 * `unfiltered_html` entfernt. Pfade stammen ausschliesslich aus shapes.json.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Blocks;

/**
 * `render_block`-Filter für den Trenner.
 */
final class SeparatorRenderer {

	public const BLOCK = 'cf65/separator';

	/**
	 * Formen (Name → Pfad).
	 *
	 * @var array<string, string>|null
	 */
	private static ?array $shapes = null;

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_filter( 'render_block', array( $this, 'render' ), 10, 2 );
	}

	/**
	 * Formen aus shapes.json.
	 *
	 * @return array<string, string>
	 */
	public static function shapes(): array {
		if ( null === self::$shapes ) {
			$json         = \file_get_contents( __DIR__ . '/shapes.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Lokale Plugin-Datei.
			$data         = \is_string( $json ) ? \json_decode( $json, true ) : null;
			self::$shapes = array();
			foreach ( \is_array( $data ) ? $data : array() as $name => $path ) {
				if ( \is_string( $name ) && ! \str_starts_with( $name, '$' ) && \is_string( $path ) && 1 === \preg_match( '/^[MLHVCSQTAZmlhvcsqtaz0-9 .,\-]+$/D', $path ) ) {
					self::$shapes[ $name ] = $path;
				}
			}
		}
		return self::$shapes;
	}

	/**
	 * SVG-Markup einer Form (unbekannt → erste Form).
	 *
	 * @param mixed $design Gewählte Form.
	 */
	public static function svg( mixed $design ): string {
		$shapes = self::shapes();
		if ( array() === $shapes ) {
			return '';
		}
		$path = \is_string( $design ) && isset( $shapes[ $design ] ) ? $shapes[ $design ] : (string) \reset( $shapes );
		return '<svg viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false"><path d="' . \esc_attr( $path ) . '"></path></svg>';
	}

	/**
	 * `render_block`-Filter.
	 *
	 * @param string       $content Gerendertes HTML.
	 * @param array<mixed> $block   Geparster Block.
	 */
	public function render( string $content, array $block ): string {
		if ( self::BLOCK !== ( $block['blockName'] ?? null ) ) {
			return $content;
		}
		$position = \strrpos( $content, '</div>' );
		if ( false === $position || \str_contains( $content, '<svg' ) ) {
			return $content;
		}
		$attributes = \is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
		return \substr_replace( $content, self::svg( $attributes['design'] ?? null ), $position, 0 );
	}
}
