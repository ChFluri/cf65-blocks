<?php
/**
 * Tests für die REST-Routen (Registrierung und Rechte).
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Dynamic;

use Brain\Monkey\Functions;
use Cf65\Blocks\Dynamic\RestController;
use Cf65\Blocks\Tests\Unit\TestCase;

final class RestControllerTest extends TestCase {

	/**
	 * Registrierte Routen (Pfad → Optionen).
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private static function routes(): array {
		$routes = array();
		Functions\when( 'register_rest_route' )->alias(
			static function ( string $namespace, string $route, array $args ) use ( &$routes ): bool {
				$routes[ $namespace . $route ] = $args;
				return true;
			}
		);
		( new RestController() )->register_routes();
		return $routes;
	}

	public function test_routes_are_registered_with_permission_check(): void {
		$routes = self::routes();

		self::assertSame( array( 'cf65-blocks/v1/dynamic/fields', 'cf65-blocks/v1/dynamic/preview' ), \array_keys( $routes ) );
		foreach ( $routes as $route ) {
			self::assertIsCallable( $route['permission_callback'] );
		}
	}

	/**
	 * WordPress validiert auch Standardwerte: ein Default, der sein eigenes
	 * Muster verletzt, macht die Route unbenutzbar (HTTP 400).
	 */
	public function test_defaults_match_their_patterns(): void {
		foreach ( self::routes() as $path => $route ) {
			foreach ( $route['args'] as $name => $arg ) {
				if ( isset( $arg['pattern'], $arg['default'] ) ) {
					self::assertMatchesRegularExpression( '#' . $arg['pattern'] . '#', (string) $arg['default'], $path . ' ' . $name );
				}
				if ( isset( $arg['minimum'], $arg['default'] ) ) {
					self::assertGreaterThanOrEqual( $arg['minimum'], $arg['default'], $path . ' ' . $name );
				}
			}
		}
	}

	public function test_permission_requires_edit_posts(): void {
		Functions\expect( 'current_user_can' )->once()->with( 'edit_posts' )->andReturn( false );

		self::assertFalse( ( new RestController() )->can_use() );
	}
}
