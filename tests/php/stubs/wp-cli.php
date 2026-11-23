<?php
/**
 * Minimale WP-CLI-Stubs für PHPStan (php-stubs/wp-cli-stubs ist mit
 * wordpress-stubs 7 nicht kompatibel). Nur über `scanFiles` eingelesen,
 * nie ausgeführt.
 *
 * @package Cf65\Blocks\Tests
 */

// phpcs:ignoreFile

namespace {
	class WP_CLI {
		/**
		 * @param string                $name     Befehl.
		 * @param callable|class-string $callable Handler.
		 * @param array<string, mixed>  $args     Optionen.
		 */
		public static function add_command( string $name, $callable, array $args = array() ): bool {
			return true;
		}

		/**
		 * @param string $message Meldung.
		 * @return never
		 */
		public static function error( $message, bool $exit = true ) {
			exit( 1 );
		}

		public static function log( string $message ): void {}

		public static function success( string $message ): void {}
	}
}

namespace WP_CLI\Utils {
	/**
	 * @param string                        $format Format.
	 * @param iterable<array<string,mixed>> $items  Zeilen.
	 * @param array<string>|string          $fields Spalten.
	 */
	function format_items( string $format, iterable $items, array|string $fields ): void {}
}
