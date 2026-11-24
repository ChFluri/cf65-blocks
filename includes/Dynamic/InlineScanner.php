<?php
/**
 * Findet dynamische Platzhalter im RichText-HTML (UMSETZPLAN Kap. 3.2):
 *
 *     <span class="cf65-dynamic" data-cf65-source="current-post"
 *           data-cf65-provider="core" data-cf65-field="title">Titel</span>
 *
 * Nutzt den HTML-Tokenizer von WordPress (kein Regex auf HTML). Liefert die
 * Bereiche des Inhalts zwischen öffnendem und passendem schliessendem
 * `<span>` – verschachtelte Formatierung (z. B. `<strong>`) eingeschlossen.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Tokenizer mit Zugriff auf die Positionen der Bookmarks.
 */
final class InlineScanner extends \WP_HTML_Tag_Processor {

	/** Obergrenze an Platzhaltern pro Block. */
	private const MAX_TOKENS = 200;

	/**
	 * Alle Platzhalter in Dokumentreihenfolge.
	 *
	 * @return list<array{start: int, end: int, binding: array{source: string|null, provider: string|null, field: string|null}}>
	 */
	public function scan(): array {
		$found     = array();
		$query     = array(
			'tag_name'   => 'SPAN',
			'class_name' => InlineReplacer::CLASS_NAME,
		);
		$remaining = self::MAX_TOKENS;
		while ( $this->next_tag( $query ) ) {
			if ( --$remaining < 0 ) {
				break;
			}
			$binding = array(
				'source'   => self::string_attribute( $this->get_attribute( 'data-cf65-source' ) ),
				'provider' => self::string_attribute( $this->get_attribute( 'data-cf65-provider' ) ),
				'field'    => self::string_attribute( $this->get_attribute( 'data-cf65-field' ) ),
			);

			$open = $this->position( 'cf65-open' );
			if ( null === $open ) {
				break;
			}

			$depth = 1;
			while ( $depth > 0 && $this->next_token() ) {
				if ( '#tag' === $this->get_token_type() && 'SPAN' === $this->get_tag() ) {
					$depth += $this->is_tag_closer() ? -1 : 1;
				}
			}
			$close = 0 === $depth ? $this->position( 'cf65-close' ) : null;
			if ( null === $close ) {
				break;
			}

			$found[] = array(
				'start'   => $open['start'] + $open['length'],
				'end'     => $close['start'],
				'binding' => $binding,
			);
		}
		return $found;
	}

	/**
	 * Position des aktuellen Tokens.
	 *
	 * @param string $name Bookmark-Name.
	 * @return array{start: int, length: int}|null
	 */
	private function position( string $name ): ?array {
		if ( ! $this->set_bookmark( $name ) || ! isset( $this->bookmarks[ $name ] ) ) {
			return null;
		}
		$span = $this->bookmarks[ $name ];
		return array(
			'start'  => (int) $span->start,
			'length' => (int) $span->length,
		);
	}

	/**
	 * @param mixed $value Attributwert (string, true oder null).
	 */
	private static function string_attribute( mixed $value ): ?string {
		return \is_string( $value ) ? $value : null;
	}
}
