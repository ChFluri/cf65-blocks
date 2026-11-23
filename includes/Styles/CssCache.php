<?php
/**
 * CSS-Cache als Post-Meta (UMSETZPLAN Kap. 4.3): Das CSS aller cf65-Blöcke
 * eines Beitrags wird beim Speichern berechnet und unter
 * `_cf65_blocks_css` abgelegt.
 *
 * Schlüssel ist ein Hash aus Blockname und Attributen – ein Treffer ist
 * damit unabhängig vom Ort des Renderings immer korrekt. Blöcke ausserhalb
 * des Beitragsinhalts (Templates, Patterns, andere Beiträge im Query Loop)
 * werden einfach neu berechnet. Der Cache ist mit Plugin- und
 * Generator-Version gestempelt und nach Updates automatisch ungültig.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Styles;

use Cf65\Blocks\Blocks\Registry;
use const Cf65\Blocks\VERSION;

/**
 * Liest und schreibt vorberechnetes Block-CSS.
 */
final class CssCache {

	public const META_KEY = '_cf65_blocks_css';

	/** Obergrenzen gegen aufgeblähte oder manipulierte Meta-Werte. */
	private const MAX_ENTRIES = 2000;

	private const MAX_CSS_BYTES = 65536;

	private const MAX_DEPTH = 64;

	/**
	 * Geladene Einträge (Schlüssel → CSS) aller bisher gelesenen Beiträge.
	 *
	 * @var array<string, string>
	 */
	private array $entries = array();

	/**
	 * Bereits gelesene Beiträge.
	 *
	 * @var array<int, true>
	 */
	private array $loaded = array();

	/**
	 * Berechnet CSS für (Blockname, Attribute).
	 *
	 * @var (\Closure(string, array<string, mixed>): string)|null
	 */
	private ?\Closure $compute = null;

	/**
	 * Konstruktor.
	 *
	 * @param \Closure|null $post_id_resolver Liefert die ID des aktuell gerenderten
	 *                                        Beitrags (Standard: get_the_ID).
	 */
	public function __construct( private readonly ?\Closure $post_id_resolver = null ) {}

	/**
	 * Versionsstempel: ändert sich mit jedem Plugin-Release bzw. jeder
	 * Änderung der Generator-Ausgabe.
	 */
	public static function stamp(): string {
		return VERSION . '|' . CssGenerator::VERSION;
	}

	/**
	 * Cache-Schlüssel einer Blockinstanz.
	 *
	 * @param string       $name       Blockname.
	 * @param array<mixed> $attributes Attribute aus dem Block-Kommentar.
	 */
	public static function key( string $name, array $attributes ): string {
		// json_encode statt wp_json_encode: deterministisch und ohne WordPress-Abhängigkeit (nur Hash, keine Ausgabe).
		return \md5( $name . "\0" . (string) \json_encode( $attributes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
	}

	/**
	 * Hooks registrieren.
	 *
	 * @param \Closure $compute Berechnet CSS: fn( string $name, array $attributes ): string.
	 */
	public function register_hooks( \Closure $compute ): void {
		$this->compute = $compute;
		\add_action( 'wp_after_insert_post', array( $this, 'on_save' ), 10, 2 );
	}

	/**
	 * `wp_after_insert_post`: Cache neu aufbauen (nach AttributeGuard).
	 *
	 * @param int      $post_id Beitrags-ID.
	 * @param \WP_Post $post    Beitrag.
	 */
	public function on_save( int $post_id, \WP_Post $post ): void {
		if ( \wp_is_post_revision( $post_id ) || \wp_is_post_autosave( $post_id ) ) {
			return;
		}
		$this->build( $post_id, (string) $post->post_content );
	}

	/**
	 * Berechnet das CSS aller cf65-Blöcke eines Inhalts und speichert es.
	 * Ohne cf65-Blöcke wird die Meta entfernt.
	 *
	 * @param int    $post_id Beitrags-ID.
	 * @param string $content Inhalt.
	 */
	public function build( int $post_id, string $content ): void {
		if ( null === $this->compute ) {
			return;
		}

		$css = array();
		if ( \str_contains( $content, '<!-- wp:' . Registry::BLOCK_PREFIX ) ) {
			$this->collect( \parse_blocks( $content ), $css, 0 );
		}

		unset( $this->loaded[ $post_id ] );
		if ( array() === $css ) {
			\delete_post_meta( $post_id, self::META_KEY );
			return;
		}
		\update_post_meta(
			$post_id,
			self::META_KEY,
			\wp_slash(
				array(
					'v'   => self::stamp(),
					'css' => $css,
				)
			)
		);
	}

	/**
	 * Vorberechnetes CSS (auch leerer String = „kein CSS“) oder null.
	 *
	 * @param string $key Schlüssel aus {@see self::key()}.
	 */
	public function get( string $key ): ?string {
		$this->load_current();
		return $this->entries[ $key ] ?? null;
	}

	/**
	 * Lädt die Meta des aktuell gerenderten Beitrags (einmal pro Beitrag).
	 */
	private function load_current(): void {
		$post_id = null !== $this->post_id_resolver ? ( $this->post_id_resolver )() : \get_the_ID();
		if ( ! \is_int( $post_id ) || $post_id <= 0 || isset( $this->loaded[ $post_id ] ) ) {
			return;
		}
		$this->loaded[ $post_id ] = true;
		$this->merge( \get_post_meta( $post_id, self::META_KEY, true ) );
	}

	/**
	 * Übernimmt gültige Einträge (Version, Typen, Grössen, kein `<`).
	 *
	 * @param mixed $data Meta-Wert.
	 */
	private function merge( mixed $data ): void {
		if ( ! \is_array( $data ) || ( $data['v'] ?? null ) !== self::stamp() || ! \is_array( $data['css'] ?? null ) ) {
			return;
		}
		foreach ( $data['css'] as $key => $css ) {
			if ( \count( $this->entries ) >= self::MAX_ENTRIES ) {
				return;
			}
			if (
				\is_string( $key ) && 1 === \preg_match( '/^[0-9a-f]{32}$/D', $key )
				&& \is_string( $css ) && \strlen( $css ) <= self::MAX_CSS_BYTES && ! \str_contains( $css, '<' )
			) {
				$this->entries[ $key ] = $css;
			}
		}
	}

	/**
	 * Sammelt CSS rekursiv.
	 *
	 * @param array<mixed>          $blocks Blöcke aus parse_blocks().
	 * @param array<string, string> $css    Ergebnis (Schlüssel → CSS).
	 * @param int                   $depth  Tiefe.
	 */
	private function collect( array $blocks, array &$css, int $depth ): void {
		$compute = $this->compute;
		if ( $depth > self::MAX_DEPTH || null === $compute ) {
			return;
		}
		foreach ( $blocks as $block ) {
			if ( ! \is_array( $block ) ) {
				continue;
			}
			$name = $block['blockName'] ?? null;
			if ( \is_string( $name ) && \str_starts_with( $name, Registry::BLOCK_PREFIX ) && \count( $css ) < self::MAX_ENTRIES ) {
				$attrs = \is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
				/** @var array<string, mixed> $attrs */
				$css[ self::key( $name, $attrs ) ] = $compute( $name, $attrs );
			}
			if ( \is_array( $block['innerBlocks'] ?? null ) ) {
				$this->collect( $block['innerBlocks'], $css, $depth + 1 );
			}
		}
	}
}
