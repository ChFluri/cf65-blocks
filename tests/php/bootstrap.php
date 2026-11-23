<?php
/**
 * Bootstrap für Unit-Tests (ohne WordPress, mit Brain Monkey).
 *
 * Integrationstests gegen eine echte WordPress-Instanz laufen als
 * Playwright-E2E über wp-env (tests/e2e).
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

require_once dirname( __DIR__, 2 ) . '/includes/Autoloader.php';
\Cf65\Blocks\Autoloader::register( 'Cf65\\Blocks', dirname( __DIR__, 2 ) . '/includes' );
