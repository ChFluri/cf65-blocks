<?php
/**
 * Plugin-Bootstrap.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks;

use Cf65\Blocks\Blocks\Registry;
use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Styles\StyleRenderer;

/**
 * Startet die Plugin-Dienste.
 */
final class Plugin {

	/**
	 * Verhindert doppeltes Booten.
	 *
	 * @var bool
	 */
	private static bool $booted = false;

	/**
	 * Einstiegspunkt (Hook `plugins_loaded`).
	 */
	public static function boot(): void {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		( new Registry( PLUGIN_DIR ) )->register_hooks();
		( new StyleRenderer( new CssGenerator() ) )->register_hooks();

		/**
		 * Wird ausgelöst, nachdem cf65 Blocks gebootet hat.
		 *
		 * Erweiterungen (eigene Provider, Bedingungen) registrieren sich hier.
		 */
		\do_action( 'cf65_blocks/loaded' );
	}

	/**
	 * URL zu einer Datei im Plugin-Verzeichnis.
	 *
	 * @param string $path Relativer Pfad.
	 */
	public static function url( string $path = '' ): string {
		return \plugins_url( \ltrim( $path, '/' ), PLUGIN_FILE );
	}
}
