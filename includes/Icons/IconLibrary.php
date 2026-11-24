<?php
/**
 * Mitgelieferte Icons (Lucide, Simple Icons) aus icons.json.
 *
 * Icons liegen strukturiert vor (`[tag, { attr: wert }]`). Das SVG wird hier
 * aus einer Whitelist von Elementen und Attributen zusammengesetzt und
 * escaped – auch wenn icons.json verändert würde, entsteht kein Skript.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Icons;

/**
 * Liefert Icon-SVGs nach Name.
 */
final class IconLibrary {

	public const NAME_PATTERN = '/^[a-z0-9][a-z0-9-]{0,63}$/D';

	public const DEFAULT_VIEW_BOX = '0 0 24 24';

	private const ALLOWED = array(
		'path'     => array( 'd' ),
		'circle'   => array( 'cx', 'cy', 'r' ),
		'ellipse'  => array( 'cx', 'cy', 'rx', 'ry' ),
		'rect'     => array( 'x', 'y', 'width', 'height', 'rx', 'ry' ),
		'line'     => array( 'x1', 'y1', 'x2', 'y2' ),
		'polyline' => array( 'points' ),
		'polygon'  => array( 'points' ),
	);

	private const VALUE = '/^[0-9a-zA-Z .,\-]{1,8000}$/D';

	/**
	 * Icons nach Name.
	 *
	 * @var array<string, array<string, mixed>>|null
	 */
	private static ?array $icons = null;

	/**
	 * Alle Icons.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function all(): array {
		if ( null === self::$icons ) {
			$json        = \file_get_contents( __DIR__ . '/icons.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Lokale Plugin-Datei.
			$data        = \is_string( $json ) ? \json_decode( $json, true ) : null;
			$icons       = \is_array( $data ) && \is_array( $data['icons'] ?? null ) ? $data['icons'] : array();
			self::$icons = array();
			foreach ( $icons as $name => $icon ) {
				if ( \is_string( $name ) && 1 === \preg_match( self::NAME_PATTERN, $name ) && \is_array( $icon ) ) {
					/** @var array<string, mixed> $icon */
					self::$icons[ $name ] = $icon;
				}
			}
		}
		return self::$icons;
	}

	/**
	 * Ob es ein Icon gibt.
	 *
	 * @param mixed $name Name.
	 */
	public static function has( mixed $name ): bool {
		return \is_string( $name ) && isset( self::all()[ $name ] );
	}

	/**
	 * SVG eines Icons (dekorativ: aria-hidden). Unbekannt → ''.
	 *
	 * @param mixed $name Name.
	 */
	public static function svg( mixed $name ): string {
		if ( ! self::has( $name ) ) {
			return '';
		}
		/** @var string $name */
		$icon = self::all()[ $name ];

		$body = '';
		foreach ( \is_array( $icon['e'] ?? null ) ? $icon['e'] : array() as $element ) {
			$body .= self::element( $element );
		}
		if ( '' === $body ) {
			return '';
		}

		$paint = 'f' === ( $icon['t'] ?? null )
			? 'fill="currentColor"'
			: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

		return '<svg class="cf65-icon" viewBox="' . self::view_box( $icon['v'] ?? null ) . '" ' . $paint . ' aria-hidden="true" focusable="false">' . $body . '</svg>';
	}

	/**
	 * Die viewBox eines Icons: Standard 24×24, sonst `0 0 <breite> <höhe>`
	 * (z. B. Font-Awesome-Marken).
	 *
	 * @param mixed $value Wert aus icons.json.
	 */
	public static function view_box( mixed $value ): string {
		return \is_string( $value ) && 1 === \preg_match( '/^0 0 [1-9]\d{0,3} [1-9]\d{0,3}$/D', $value ) ? $value : self::DEFAULT_VIEW_BOX;
	}

	/**
	 * Ein SVG-Element aus `[tag, attrs]` (nur Whitelist).
	 *
	 * @param mixed $element Element.
	 */
	private static function element( mixed $element ): string {
		if ( ! \is_array( $element ) || ! \is_string( $element[0] ?? null ) || ! isset( self::ALLOWED[ $element[0] ] ) ) {
			return '';
		}
		$tag   = $element[0];
		$attrs = \is_array( $element[1] ?? null ) ? $element[1] : array();
		$html  = '<' . $tag;
		foreach ( self::ALLOWED[ $tag ] as $attr ) {
			$value = $attrs[ $attr ] ?? null;
			if ( \is_string( $value ) && 1 === \preg_match( self::VALUE, $value ) ) {
				$html .= ' ' . $attr . '="' . \esc_attr( $value ) . '"';
			}
		}
		return $html . '></' . $tag . '>';
	}
}
