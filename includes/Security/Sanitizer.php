<?php
/**
 * Typisierte Validierung von Stilwerten.
 *
 * Spiegelbild von src/security/sanitize.js – beide müssen für jede Eingabe
 * dasselbe Ergebnis liefern (tests/fixtures/css/cases.json).
 * Regeln: nur ASCII-Zeichenklassen, kein trim(), `D`-Modifier (kein
 * abschliessender Zeilenumbruch vor `$`), ungültig → null.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Security;

/**
 * Validiert Farben, Längen, Enums und Block-IDs.
 */
final class Sanitizer {

	private const MAX_LENGTH = 80;

	private const HEX_COLOR      = '/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/D';
	private const FUNCTION_COLOR = '/^(?:rgba?|hsla?)\([0-9., %\/]+\)$/D';
	private const COLOR_KEYWORDS = array( 'transparent', 'currentcolor' );
	private const CSS_VARIABLE   = '/^var\(--[a-z0-9-]{1,72}\)$/D';
	private const LENGTH         = '/^-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:px|em|rem|%|vw|vh)$/D';
	private const UNIQUE_ID      = '/^[a-z0-9]{4,16}$/D';

	/** Erlaubte Schemata für Links. */
	public const LINK_SCHEMES = array( 'http', 'https', 'mailto', 'tel' );

	/** Erlaubte Schemata für Bildquellen. */
	public const IMAGE_SCHEMES = array( 'http', 'https' );

	private const URL_MAX_LENGTH = 2048;

	/** Steuerzeichen, Leerzeichen, Anführungszeichen, spitze Klammern, Backslash, Backtick. */
	private const URL_FORBIDDEN = '/[\x00-\x20\x7f"\'<>\\\\`]/';

	private const URL_SCHEME = '/^([a-zA-Z][a-zA-Z0-9+.\-]*):/';

	/**
	 * Farbwert (Hex, rgb/hsl, Schlüsselwort, CSS-Variable).
	 *
	 * @param mixed $value Rohwert.
	 */
	public static function color( mixed $value ): ?string {
		if ( ! self::is_candidate( $value ) ) {
			return null;
		}
		/** @var string $value */
		if ( self::matches( self::HEX_COLOR, $value ) || self::matches( self::FUNCTION_COLOR, $value ) || self::matches( self::CSS_VARIABLE, $value ) ) {
			return $value;
		}
		$keyword = \strtolower( $value );
		return \in_array( $keyword, self::COLOR_KEYWORDS, true ) ? $keyword : null;
	}

	/**
	 * Länge mit Einheit, `0` oder CSS-Variable.
	 *
	 * @param mixed $value Rohwert.
	 */
	public static function length( mixed $value ): ?string {
		if ( ! self::is_candidate( $value ) ) {
			return null;
		}
		/** @var string $value */
		if ( '0' === $value || self::matches( self::LENGTH, $value ) || self::matches( self::CSS_VARIABLE, $value ) ) {
			return $value;
		}
		return null;
	}

	/**
	 * Wert aus einer festen Liste (exakter Vergleich).
	 *
	 * @param mixed        $value   Rohwert.
	 * @param array<mixed> $allowed Erlaubte Werte.
	 */
	public static function enum( mixed $value, array $allowed ): ?string {
		return \is_string( $value ) && \in_array( $value, $allowed, true ) ? $value : null;
	}

	/**
	 * Bild-Objekt `{ url, id? }` (z. B. Hintergrundbild): URL mit Bild-Schema
	 * oder relativ, ID positive Ganzzahl. Normalisiert, sonst null.
	 *
	 * @param mixed $value Rohwert.
	 * @return array{url: string, id?: int}|null
	 */
	public static function image( mixed $value ): ?array {
		if ( ! \is_array( $value ) || \array_is_list( $value ) ) {
			return null;
		}
		$url = self::url( $value['url'] ?? null, self::IMAGE_SCHEMES );
		if ( null === $url ) {
			return null;
		}
		$image = array( 'url' => $url );
		$id    = $value['id'] ?? null;
		if ( \is_int( $id ) && $id > 0 ) {
			$image['id'] = $id;
		}
		return $image;
	}

	/**
	 * CSS-Wert `url(…)` (ohne Anführungszeichen) für ein Bild-Objekt.
	 * Die URL-Prüfung schliesst Anführungszeichen, Backslash, Leerzeichen,
	 * Steuerzeichen und spitze Klammern aus; zusätzlich runde Klammern. Damit
	 * ist die unquotierte Form gültiges, ausbruchsicheres CSS – auch im
	 * `style`-Attribut.
	 *
	 * @param mixed $value Rohwert.
	 */
	public static function css_image( mixed $value ): ?string {
		$image = self::image( $value );
		if ( null === $image || \str_contains( $image['url'], '(' ) || \str_contains( $image['url'], ')' ) ) {
			return null;
		}
		return 'url(' . $image['url'] . ')';
	}

	/**
	 * Block-ID für die Klasse `cf65-<id>`.
	 *
	 * @param mixed $value Rohwert.
	 */
	public static function unique_id( mixed $value ): ?string {
		return \is_string( $value ) && self::matches( self::UNIQUE_ID, $value ) ? $value : null;
	}

	/**
	 * URL für `href`/`src`: absolute URL mit erlaubtem Schema oder relative URL.
	 * Spiegel von `sanitizeUrl()` in src/security/sanitize.js
	 * (gemeinsame Fälle: tests/fixtures/security/urls.json).
	 *
	 * @param mixed    $value   Rohwert.
	 * @param string[] $schemes Erlaubte Schemata (Kleinbuchstaben).
	 */
	public static function url( mixed $value, array $schemes = self::LINK_SCHEMES ): ?string {
		if ( ! \is_string( $value ) || '' === $value || \strlen( $value ) > self::URL_MAX_LENGTH || self::matches( self::URL_FORBIDDEN, $value ) ) {
			return null;
		}
		if ( 1 === \preg_match( self::URL_SCHEME, $value, $match ) ) {
			return \in_array( \strtolower( $match[1] ), $schemes, true ) ? $value : null;
		}
		// Ohne Schema: relativ. Ein ":" vor dem ersten "/", "?" oder "#" wäre ein (ungültiges) Schema.
		$parts = \preg_split( '~[/?#]~', $value, 2 );
		$head  = \is_array( $parts ) ? (string) $parts[0] : $value;
		return \str_contains( $head, ':' ) ? null : $value;
	}

	/**
	 * Nicht-leerer String bis MAX_LENGTH Bytes.
	 *
	 * JS misst UTF-16-Einheiten, PHP Bytes. Erlaubte Werte sind reines ASCII,
	 * dort ist beides gleich; längere Nicht-ASCII-Eingaben scheitern ohnehin
	 * an den Mustern.
	 *
	 * @param mixed $value Rohwert.
	 */
	private static function is_candidate( mixed $value ): bool {
		return \is_string( $value ) && '' !== $value && \strlen( $value ) <= self::MAX_LENGTH;
	}

	/**
	 * Regex-Treffer ohne Fehler-/Warnungspfad.
	 *
	 * @param string $pattern Muster.
	 * @param string $value   Wert.
	 */
	private static function matches( string $pattern, string $value ): bool {
		return 1 === \preg_match( $pattern, $value );
	}
}
