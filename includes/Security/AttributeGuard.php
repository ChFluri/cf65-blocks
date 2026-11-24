<?php
/**
 * Serverseitige Prüfung der Attribute von cf65-Blöcken beim Speichern
 * (UMSETZPLAN Kap. 7.2: „Jede Prüfung, die im UI passiert, wird serverseitig
 * wiederholt“).
 *
 * Läuft auf `wp_insert_post_data` (nach kses) für jeden gespeicherten Inhalt –
 * Editor, REST, XML-RPC, Import. Geprüft werden nur Attribute, die der Block
 * in block.json deklariert:
 *
 * - Typ laut `attributes` (string/number/integer/boolean/object/array)
 * - Stilwerte aus `supports.cf65.styles` über den Sanitizer; responsive
 *   Werte nur mit bekannten Geräten
 * - URLs aus `supports.cf65.urls` (`link` oder `image`)
 * - Bindungen im Attribut `dynamic`, nur für Attribute aus
 *   `supports.cf65.dynamic` ({@see Binding}: rein strukturell)
 * - `uniqueId`
 * - Rechte aus `supports.cf65.capabilities` ({@see CapabilityGuard})
 *
 * Ungültige Werte werden entfernt (bzw. auf den bereinigten Wert gesetzt).
 * Nicht deklarierte Attribute bleiben erhalten (Downgrade-Sicherheit); sie
 * werden nirgends ausgegeben. RichText-Inhalte filtert WordPress per kses.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Security;

use Cf65\Blocks\Blocks\Registry;
use Cf65\Blocks\Dynamic\Binding;
use Cf65\Blocks\Styles\CssGenerator;

/**
 * Bereinigt cf65-Block-Attribute im Post-Content.
 */
final class AttributeGuard {

	/** Maximale Verschachtelungstiefe (Schutz vor manipuliertem Inhalt). */
	private const MAX_DEPTH = 64;

	/**
	 * Konstruktor.
	 *
	 * @param CapabilityGuard $capabilities  Rechteprüfung.
	 * @param \Closure|null   $type_resolver Liefert zu einem Blocknamen
	 *                                       `array{attributes: array, supports: array}` oder null
	 *                                       (Standard: Block-Registry).
	 */
	public function __construct(
		private readonly CapabilityGuard $capabilities = new CapabilityGuard(),
		private readonly ?\Closure $type_resolver = null
	) {}

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_filter( 'wp_insert_post_data', array( $this, 'filter_post_data' ), 20, 1 );
	}

	/**
	 * `wp_insert_post_data`: Inhalt (geslasht) bereinigen.
	 *
	 * @param array<string, mixed> $data Post-Daten (geslasht).
	 * @return array<string, mixed>
	 */
	public function filter_post_data( array $data ): array {
		$raw = $data['post_content'] ?? null;
		if ( ! \is_string( $raw ) || ! \str_contains( $raw, '<!-- wp:' . Registry::BLOCK_PREFIX ) ) {
			return $data;
		}

		$content   = \wp_unslash( $raw );
		$sanitized = $this->sanitize_content( $content );
		if ( $sanitized !== $content ) {
			$data['post_content'] = \wp_slash( $sanitized );
		}
		return $data;
	}

	/**
	 * Bereinigt einen Post-Content. Unveränderter Inhalt wird unverändert
	 * (byte-identisch) zurückgegeben.
	 *
	 * @param string $content Inhalt mit Block-Kommentaren.
	 */
	public function sanitize_content( string $content ): string {
		$changed = false;
		$blocks  = $this->walk( \parse_blocks( $content ), $changed, 0 );
		return $changed ? \serialize_blocks( $blocks ) : $content;
	}

	/**
	 * Bereinigt die Attribute eines Blocks.
	 *
	 * @param string               $name       Blockname.
	 * @param array<string, mixed> $attributes Attribute aus dem Block-Kommentar.
	 * @return array<string, mixed>
	 */
	public function sanitize_attributes( string $name, array $attributes ): array {
		$type = $this->resolve( $name );
		if ( null === $type ) {
			return $attributes;
		}

		$schema = $type['attributes'];
		$cf65   = \is_array( $type['supports']['cf65'] ?? null ) ? $type['supports']['cf65'] : array();

		// 1. Typ laut block.json.
		foreach ( $attributes as $key => $value ) {
			$definition = $schema[ $key ] ?? null;
			if ( \is_array( $definition ) && ! self::has_type( $value, $definition['type'] ?? null ) ) {
				unset( $attributes[ $key ] );
			}
		}

		// 2. uniqueId.
		if ( \array_key_exists( 'uniqueId', $attributes ) && null === Sanitizer::unique_id( $attributes['uniqueId'] ) ) {
			unset( $attributes['uniqueId'] );
		}

		// 3. Stilwerte.
		$styles = \is_array( $cf65['styles'] ?? null ) ? $cf65['styles'] : array();
		foreach ( $styles as $entry ) {
			if ( ! \is_array( $entry ) || ! \is_string( $entry['attr'] ?? null ) || ! \array_key_exists( $entry['attr'], $attributes ) ) {
				continue;
			}
			$attr  = $entry['attr'];
			$clean = self::sanitize_style( $entry, $attributes[ $attr ] );
			if ( null === $clean ) {
				unset( $attributes[ $attr ] );
			} else {
				$attributes[ $attr ] = $clean;
			}
		}

		// 4. URLs.
		$urls = \is_array( $cf65['urls'] ?? null ) ? $cf65['urls'] : array();
		foreach ( $urls as $attr => $kind ) {
			if ( ! \is_string( $attr ) || ! \array_key_exists( $attr, $attributes ) ) {
				continue;
			}
			$schemes = 'image' === $kind ? Sanitizer::IMAGE_SCHEMES : Sanitizer::LINK_SCHEMES;
			if ( null === Sanitizer::url( $attributes[ $attr ], $schemes ) ) {
				unset( $attributes[ $attr ] );
			}
		}

		// 5. Bindungen (Dynamic Content): nur deklarierte Attribute, Struktur geprüft.
		if ( \array_key_exists( 'dynamic', $attributes ) ) {
			$dynamic = self::sanitize_dynamic( $attributes['dynamic'], \is_array( $cf65['dynamic'] ?? null ) ? $cf65['dynamic'] : array() );
			if ( null === $dynamic ) {
				unset( $attributes['dynamic'] );
			} else {
				$attributes['dynamic'] = $dynamic;
			}
		}

		// 6. Rechte.
		$capabilities = \is_array( $cf65['capabilities'] ?? null ) ? $cf65['capabilities'] : array();
		return $this->capabilities->filter( $attributes, $capabilities );
	}

	/**
	 * Geht rekursiv durch geparste Blöcke.
	 *
	 * @param array<mixed> $blocks  Blöcke aus parse_blocks().
	 * @param bool         $changed Wird auf true gesetzt, wenn sich etwas ändert.
	 * @param int          $depth   Aktuelle Tiefe.
	 * @return array<mixed>
	 */
	private function walk( array $blocks, bool &$changed, int $depth ): array {
		if ( $depth > self::MAX_DEPTH ) {
			return $blocks;
		}
		foreach ( $blocks as $index => $block ) {
			if ( ! \is_array( $block ) ) {
				continue;
			}
			$name = $block['blockName'] ?? null;
			if ( \is_string( $name ) && \str_starts_with( $name, Registry::BLOCK_PREFIX ) ) {
				$attrs = \is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
				/** @var array<string, mixed> $attrs */
				$clean = $this->sanitize_attributes( $name, $attrs );
				if ( $clean !== $attrs ) {
					$block['attrs'] = $clean;
					$changed        = true;
				}
			}
			if ( \is_array( $block['innerBlocks'] ?? null ) && array() !== $block['innerBlocks'] ) {
				$block['innerBlocks'] = $this->walk( $block['innerBlocks'], $changed, $depth + 1 );
			}
			$blocks[ $index ] = $block;
		}
		return $blocks;
	}

	/**
	 * Bereinigt einen Stilwert; responsive Werte nur mit bekannten Geräten.
	 *
	 * @param array<mixed> $entry Map-Eintrag.
	 * @param mixed        $value Rohwert.
	 * @return mixed Bereinigter Wert oder null (entfernen).
	 */
	private static function sanitize_style( array $entry, mixed $value ): mixed {
		// Bilder bleiben Objekte ({ url, id? }), werden aber normalisiert.
		if ( 'image' === ( $entry['type'] ?? null ) ) {
			return empty( $entry['responsive'] ) ? Sanitizer::image( $value ) : null;
		}
		if ( empty( $entry['responsive'] ) ) {
			return self::sanitize_value( $entry, $value );
		}
		if ( ! \is_array( $value ) || ( array() !== $value && \array_is_list( $value ) ) ) {
			return null;
		}
		$clean = array();
		foreach ( \array_keys( CssGenerator::DEVICES ) as $device ) {
			if ( ! \array_key_exists( $device, $value ) ) {
				continue;
			}
			$device_value = self::sanitize_value( $entry, $value[ $device ] );
			if ( null !== $device_value ) {
				$clean[ $device ] = $device_value;
			}
		}
		return array() === $clean ? null : $clean;
	}

	/**
	 * Bereinigt das Attribut `dynamic` gegen `supports.cf65.dynamic`.
	 *
	 * @param mixed        $value Rohwert.
	 * @param array<mixed> $specs Bindbare Attribute.
	 * @return array<string, array<string, mixed>>|null Null = entfernen.
	 */
	private static function sanitize_dynamic( mixed $value, array $specs ): ?array {
		if ( ! \is_array( $value ) ) {
			return null;
		}
		$clean = array();
		foreach ( $value as $attr => $raw ) {
			if ( ! \is_string( $attr ) || ! \is_array( $specs[ $attr ] ?? null ) ) {
				continue;
			}
			$binding = Binding::from_array( $raw );
			if ( null !== $binding ) {
				$clean[ $attr ] = $binding->to_array();
			}
		}
		return array() === $clean ? null : $clean;
	}

	/**
	 * Wert nach Typ des Map-Eintrags.
	 *
	 * @param array<mixed> $entry Map-Eintrag.
	 * @param mixed        $value Rohwert.
	 */
	private static function sanitize_value( array $entry, mixed $value ): ?string {
		return match ( $entry['type'] ?? null ) {
			'color'  => Sanitizer::color( $value ),
			'length' => Sanitizer::length( $value ),
			'enum'   => Sanitizer::enum( $value, \is_array( $entry['values'] ?? null ) ? $entry['values'] : array() ),
			default  => null,
		};
	}

	/**
	 * Prüft einen Wert gegen den block.json-Typ (unbekannte Typen: ok).
	 *
	 * @param mixed $value Wert.
	 * @param mixed $type  Typ aus block.json.
	 */
	private static function has_type( mixed $value, mixed $type ): bool {
		return match ( $type ) {
			'string'  => \is_string( $value ),
			'number'  => \is_int( $value ) || \is_float( $value ),
			'integer' => \is_int( $value ),
			'boolean' => \is_bool( $value ),
			'object'  => \is_array( $value ) && ( array() === $value || ! \array_is_list( $value ) ),
			'array'   => \is_array( $value ) && \array_is_list( $value ),
			default   => true,
		};
	}

	/**
	 * Attribut-Schema und Supports eines Blocktyps.
	 *
	 * @param string $name Blockname.
	 * @return array{attributes: array<mixed>, supports: array<mixed>}|null
	 */
	private function resolve( string $name ): ?array {
		if ( null !== $this->type_resolver ) {
			$type = ( $this->type_resolver )( $name );
			return \is_array( $type ) ? array(
				'attributes' => \is_array( $type['attributes'] ?? null ) ? $type['attributes'] : array(),
				'supports'   => \is_array( $type['supports'] ?? null ) ? $type['supports'] : array(),
			) : null;
		}
		$type = \WP_Block_Type_Registry::get_instance()->get_registered( $name );
		if ( null === $type ) {
			return null;
		}
		return array(
			'attributes' => \is_array( $type->attributes ) ? $type->attributes : array(),
			'supports'   => \is_array( $type->supports ) ? $type->supports : array(),
		);
	}
}
