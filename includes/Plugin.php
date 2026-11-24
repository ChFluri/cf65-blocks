<?php
/**
 * Plugin-Bootstrap.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks;

use Cf65\Blocks\Blocks\Registry;
use Cf65\Blocks\Blocks\SeparatorRenderer;
use Cf65\Blocks\Cli\BenchCommand;
use Cf65\Blocks\Debug\DebugMode;
use Cf65\Blocks\Dynamic\DynamicRenderer;
use Cf65\Blocks\Icons\IconRenderer;
use Cf65\Blocks\Dynamic\Resolver;
use Cf65\Blocks\Dynamic\RestController;
use Cf65\Blocks\Security\AttributeGuard;
use Cf65\Blocks\Styles\CssCache;
use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Styles\Panels;
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

		$resolver = new Resolver();

		( new DebugMode() )->register_hooks();
		( new Panels() )->register_hooks();
		( new Registry( PLUGIN_DIR ) )->register_hooks();
		( new SeparatorRenderer() )->register_hooks();
		( new IconRenderer() )->register_hooks();
		( new StyleRenderer( new CssGenerator(), null, new CssCache() ) )->register_hooks();
		( new DynamicRenderer( $resolver ) )->register_hooks();
		( new RestController( $resolver ) )->register_hooks();
		( new AttributeGuard() )->register_hooks();

		if ( \defined( 'WP_CLI' ) && \WP_CLI ) {
			\WP_CLI::add_command( 'cf65', BenchCommand::class );
		}

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
