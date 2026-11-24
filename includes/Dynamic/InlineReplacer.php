<?php
/**
 * Ersetzt den Inhalt dynamischer Platzhalter durch aufgelöste Texte.
 *
 * Der Platzhaltertext aus dem Editor wird nie ausgegeben: ohne Wert bleibt
 * der `<span>` leer, damit z. B. im Query Loop kein veralteter Titel steht.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Ersetzung auf Basis der Bereiche aus {@see InlineScanner}.
 */
final class InlineReplacer {

	public const CLASS_NAME = 'cf65-dynamic';

	/**
	 * Ob das HTML Platzhalter enthalten kann (billige Vorprüfung).
	 *
	 * @param string $html HTML.
	 */
	public static function has_tokens( string $html ): bool {
		return \str_contains( $html, self::CLASS_NAME );
	}

	/**
	 * Ersetzt alle Platzhalter.
	 *
	 * @param string                                                                 $html    HTML.
	 * @param list<array{start: int, end: int, binding: array<string, string|null>}> $tokens  Bereiche aus dem Scanner.
	 * @param \Closure                                                               $resolve Liefert den Text oder null.
	 * @phpstan-param \Closure(Binding): ?string $resolve
	 */
	public static function replace( string $html, array $tokens, \Closure $resolve ): string {
		\usort( $tokens, static fn ( array $a, array $b ): int => $b['start'] <=> $a['start'] );

		$previous_start = \PHP_INT_MAX;
		foreach ( $tokens as $token ) {
			$start = $token['start'];
			$end   = $token['end'];
			if ( $start < 0 || $end < $start || $end > $previous_start || $end > \strlen( $html ) ) {
				continue;
			}
			$binding = Binding::from_array( $token['binding'] );
			$value   = null !== $binding ? $resolve( $binding ) : null;
			$text    = null === $value ? '' : \esc_html( $value );

			$html           = \substr_replace( $html, $text, $start, $end - $start );
			$previous_start = $start;
		}
		return $html;
	}
}
