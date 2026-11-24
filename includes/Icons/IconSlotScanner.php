<?php
/**
 * Findet leere Icon-Platzhalter `<span class="cf65-icon-slot"
 * data-cf65-icon="…"></span>` und liefert die Einfügeposition.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Icons;

/**
 * Tokenizer mit Zugriff auf die Positionen der Bookmarks.
 */
final class IconSlotScanner extends \WP_HTML_Tag_Processor {

	/** Obergrenze an Platzhaltern pro Block. */
	private const MAX_SLOTS = 500;

	/**
	 * Leere Platzhalter in Dokumentreihenfolge.
	 *
	 * @return list<array{position: int, icon: string|null}>
	 */
	public function scan(): array {
		$found     = array();
		$query     = array(
			'tag_name'   => 'SPAN',
			'class_name' => IconRenderer::SLOT_CLASS,
		);
		$remaining = self::MAX_SLOTS;
		while ( $this->next_tag( $query ) ) {
			if ( --$remaining < 0 || ! $this->set_bookmark( 'cf65-slot' ) || ! isset( $this->bookmarks['cf65-slot'] ) ) {
				break;
			}
			$span = $this->bookmarks['cf65-slot'];
			$icon = $this->get_attribute( 'data-cf65-icon' );

			$found[] = array(
				'position' => (int) $span->start + (int) $span->length,
				'icon'     => \is_string( $icon ) && '' !== $icon ? $icon : null,
			);
		}
		return $found;
	}
}
