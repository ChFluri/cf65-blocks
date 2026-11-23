<?php
/**
 * PSR-4-Autoloader für den Plugin-Namespace.
 *
 * Eigener Loader statt Composer-Autoload, damit das Plugin auch ohne
 * `vendor/` lauffähig bleibt und keine fremden Klassen aus dem
 * Plugin-Verzeichnis geladen werden können.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks;

/**
 * Lädt Klassen des Namespaces `Cf65\Blocks\` aus `includes/`.
 */
final class Autoloader {

	/**
	 * Registriert den Autoloader.
	 *
	 * @param string $prefix   Namespace-Präfix ohne abschliessenden Backslash.
	 * @param string $base_dir Basisverzeichnis der Klassen.
	 */
	public static function register( string $prefix, string $base_dir ): void {
		$prefix   = \trim( $prefix, '\\' ) . '\\';
		$base_dir = \rtrim( $base_dir, '/\\' ) . '/';

		\spl_autoload_register(
			static function ( string $class_name ) use ( $prefix, $base_dir ): void {
				if ( ! \str_starts_with( $class_name, $prefix ) ) {
					return;
				}

				$relative = \substr( $class_name, \strlen( $prefix ) );

				// Nur gültige Klassennamen-Segmente zulassen (kein "..", keine Sonderzeichen).
				if ( 1 !== \preg_match( '/^[A-Za-z_][A-Za-z0-9_]*(\\\\[A-Za-z_][A-Za-z0-9_]*)*$/', $relative ) ) {
					return;
				}

				$file = $base_dir . \str_replace( '\\', '/', $relative ) . '.php';

				if ( \is_readable( $file ) ) {
					require_once $file;
				}
			}
		);
	}
}
