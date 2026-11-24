<?php
/**
 * Gemeinsame Style-Panels (UMSETZPLAN Kap. 4.2).
 *
 * Ein Block wählt Panels in `supports.cf65.panels`, z. B.
 * `["margin","border","backgroundImage"]`. Beim Registrieren ergänzt der
 * Filter `block_type_metadata` daraus (aus panels.json):
 *
 * - Attribute (bestehende gleichen Namens bleiben unverändert)
 * - Einträge in `supports.cf65.styles`
 * - Bindungen in `supports.cf65.dynamic`
 *
 * Damit gelten CSS-Generator, AttributeGuard, CSS-Cache und Dynamic Content
 * ohne weiteren Code auch für Panel-Attribute. Spiegel: src/extensions/panels.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Styles;

use Cf65\Blocks\Blocks\Registry;

/**
 * Ergänzt Block-Metadaten um die gewählten Panels.
 */
final class Panels {

	/**
	 * Geladene Definitionen.
	 *
	 * @var array<string, array<string, mixed>>|null
	 */
	private static ?array $definitions = null;

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_filter( 'block_type_metadata', array( self::class, 'apply' ) );
	}

	/**
	 * Panel-Definitionen aus panels.json.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function definitions(): array {
		if ( null === self::$definitions ) {
			$json              = \file_get_contents( __DIR__ . '/panels.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Lokale Plugin-Datei.
			$data              = \is_string( $json ) ? \json_decode( $json, true ) : null;
			self::$definitions = array();
			foreach ( \is_array( $data ) ? $data : array() as $name => $definition ) {
				if ( \is_string( $name ) && ! \str_starts_with( $name, '$' ) && \is_array( $definition ) ) {
					/** @var array<string, mixed> $definition */
					self::$definitions[ $name ] = $definition;
				}
			}
		}
		return self::$definitions;
	}

	/**
	 * `block_type_metadata`: Panels in die Metadaten eines cf65-Blocks einfügen.
	 *
	 * @param array<mixed> $metadata Metadaten aus block.json.
	 * @return array<mixed>
	 */
	public static function apply( array $metadata ): array {
		$name = $metadata['name'] ?? null;
		if ( ! \is_string( $name ) || ! \str_starts_with( $name, Registry::BLOCK_PREFIX ) ) {
			return $metadata;
		}
		$supports = \is_array( $metadata['supports'] ?? null ) ? $metadata['supports'] : array();
		$cf65     = \is_array( $supports['cf65'] ?? null ) ? $supports['cf65'] : array();
		$panels   = \is_array( $cf65['panels'] ?? null ) ? $cf65['panels'] : array();
		if ( array() === $panels ) {
			return $metadata;
		}

		$attributes  = \is_array( $metadata['attributes'] ?? null ) ? $metadata['attributes'] : array();
		$styles      = \is_array( $cf65['styles'] ?? null ) ? $cf65['styles'] : array();
		$dynamic     = \is_array( $cf65['dynamic'] ?? null ) ? $cf65['dynamic'] : array();
		$definitions = self::definitions();

		foreach ( $panels as $panel ) {
			$definition = \is_string( $panel ) ? ( $definitions[ $panel ] ?? null ) : null;
			if ( null === $definition ) {
				continue;
			}
			foreach ( \is_array( $definition['attributes'] ?? null ) ? $definition['attributes'] : array() as $attr => $schema ) {
				if ( ! \array_key_exists( $attr, $attributes ) ) {
					$attributes[ $attr ] = $schema;
				}
			}
			foreach ( \is_array( $definition['styles'] ?? null ) ? $definition['styles'] : array() as $entry ) {
				$styles[] = $entry;
			}
			foreach ( \is_array( $definition['dynamic'] ?? null ) ? $definition['dynamic'] : array() as $attr => $spec ) {
				if ( ! \array_key_exists( $attr, $dynamic ) ) {
					$dynamic[ $attr ] = $spec;
				}
			}
		}

		$cf65['styles'] = $styles;
		if ( array() !== $dynamic ) {
			$cf65['dynamic'] = $dynamic;
		}
		$supports['cf65']       = $cf65;
		$metadata['supports']   = $supports;
		$metadata['attributes'] = $attributes;
		return $metadata;
	}
}
