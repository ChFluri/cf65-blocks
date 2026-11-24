<?php
/**
 * Test-Helfer: Blocktypen direkt aus src/blocks/* /block.json.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Security;

use Cf65\Blocks\Styles\Panels;

/**
 * Lädt alle block.json einmal.
 */
final class BlockTypes {

	/**
	 * Cache Blockname → Metadaten.
	 *
	 * @var array<string, array<string, mixed>>|null
	 */
	private static ?array $types = null;

	/**
	 * Alle Blocktypen.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function all(): array {
		if ( null === self::$types ) {
			self::$types = array();
			foreach ( (array) \glob( \dirname( __DIR__, 4 ) . '/src/blocks/*/block.json' ) as $file ) {
				$json = \json_decode( (string) \file_get_contents( (string) $file ), true, 512, JSON_THROW_ON_ERROR );
				if ( \is_array( $json ) && \is_string( $json['name'] ?? null ) ) {
					// Wie bei der Registrierung: gemeinsame Panels ergänzen.
					self::$types[ $json['name'] ] = Panels::apply( $json );
				}
			}
			\ksort( self::$types );
		}
		return self::$types;
	}

	/**
	 * Resolver für AttributeGuard.
	 */
	public static function resolver(): \Closure {
		return static fn ( string $name ): ?array => self::all()[ $name ] ?? null;
	}
}
