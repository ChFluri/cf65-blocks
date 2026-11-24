<?php
/**
 * Setzt Attribute im Block-HTML per WP_HTML_Tag_Processor (kein Regex auf HTML).
 *
 * Wird über E2E-Tests geprüft; die Entscheidung, was gesetzt wird, liegt in
 * {@see DynamicRenderer::plan()} und ist unit-getestet.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Wendet Änderungen auf das erste passende Tag an.
 */
final class HtmlPatcher {

	/** Attribute, deren Werte URLs sind. */
	private const URL_ATTRIBUTES = array( 'href', 'src' );

	/**
	 * Wendet alle Änderungen an.
	 *
	 * @param string                                                                                                                                                       $html    Block-HTML.
	 * @param list<array{tag: string, class: string|null, set: array<string, string|null>, add_class: list<string>, remove_class: string|null, drop_without: string|null}> $patches Änderungen.
	 * @return string Neues HTML ('' = Block nicht ausgeben).
	 */
	public static function apply( string $html, array $patches ): string {
		foreach ( $patches as $patch ) {
			$processor = new \WP_HTML_Tag_Processor( $html );
			$query     = array( 'tag_name' => $patch['tag'] );
			if ( null !== $patch['class'] ) {
				$query['class_name'] = $patch['class'];
			}
			if ( ! $processor->next_tag( $query ) ) {
				continue;
			}

			foreach ( $patch['set'] as $name => $value ) {
				if ( null === $value ) {
					$processor->remove_attribute( $name );
				} elseif ( \in_array( $name, self::URL_ATTRIBUTES, true ) ) {
					$processor->set_attribute( $name, \esc_url( $value ) );
				} else {
					$processor->set_attribute( $name, $value );
				}
			}

			if ( null !== $patch['remove_class'] ) {
				foreach ( \iterator_to_array( $processor->class_list(), false ) as $class ) {
					if ( 1 === \preg_match( $patch['remove_class'], $class ) ) {
						$processor->remove_class( $class );
					}
				}
			}
			foreach ( $patch['add_class'] as $class ) {
				$processor->add_class( $class );
			}

			$drop = $patch['drop_without'];
			if ( null !== $drop ) {
				$current = $processor->get_attribute( $drop );
				if ( ! \is_string( $current ) || '' === $current ) {
					return '';
				}
			}

			$html = $processor->get_updated_html();
		}
		return $html;
	}
}
