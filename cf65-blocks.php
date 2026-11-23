<?php
/**
 * Plugin Name:       cf65 Blocks
 * Plugin URI:        https://github.com/ChFluri/cf65-blocks
 * Description:       Erweiterte Gutenberg-Blöcke mit Dynamic Content (ACF, Pods), Conditional Display und erweiterten Einstellungen pro Block.
 * Version:           0.1.0-dev
 * Requires at least: 6.7
 * Requires PHP:      8.5
 * Author:            cf65
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cf65-blocks
 * Domain Path:       /languages
 * Update URI:        https://github.com/ChFluri/cf65-blocks
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks;

// Kein direkter Aufruf.
if ( ! \defined( 'ABSPATH' ) ) {
	exit;
}

const VERSION     = '0.1.0-dev';
const MIN_WP      = '6.7';
const MIN_PHP     = '8.5';
const PLUGIN_FILE = __FILE__;
const PLUGIN_DIR  = __DIR__;

/*
 * Versionsprüfung vor jedem weiteren Code. Die Prüfung selbst nutzt nur
 * Syntax, die auch ältere PHP-Versionen parsen können, damit die Meldung
 * erscheint statt eines Fatal Errors.
 */
if ( \version_compare( \PHP_VERSION, MIN_PHP, '<' ) || \version_compare( (string) \get_bloginfo( 'version' ), MIN_WP, '<' ) ) {
	\add_action(
		'admin_notices',
		static function (): void {
			if ( ! \current_user_can( 'activate_plugins' ) ) {
				return;
			}
			\printf(
				'<div class="notice notice-error"><p>%s</p></div>',
				\esc_html(
					\sprintf(
						/* translators: 1: required WordPress version, 2: required PHP version */
						\__( 'cf65 Blocks benötigt WordPress %1$s und PHP %2$s oder neuer. Das Plugin ist inaktiv.', 'cf65-blocks' ),
						MIN_WP,
						MIN_PHP
					)
				)
			);
		}
	);
	return;
}

// Drittanbieter-Bibliotheken (nur Laufzeit-Abhängigkeiten, im Release-ZIP enthalten).
if ( \is_readable( PLUGIN_DIR . '/vendor/autoload.php' ) ) {
	require_once PLUGIN_DIR . '/vendor/autoload.php';
}

require_once PLUGIN_DIR . '/includes/Autoloader.php';
Autoloader::register( __NAMESPACE__, PLUGIN_DIR . '/includes' );

\add_action( 'plugins_loaded', array( Plugin::class, 'boot' ) );
