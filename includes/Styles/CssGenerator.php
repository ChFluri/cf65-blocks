<?php
/**
 * CSS-Generator für cf65-Blöcke (Frontend).
 *
 * Quelle der Wahrheit für die Ausgabe; src/styles/generator.js ist der
 * JS-Port für den Editor. Beide müssen byte-identisches CSS erzeugen
 * (tests/fixtures/css/cases.json).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Styles;

use Cf65\Blocks\Security\Sanitizer;

/**
 * Erzeugt gescoptes CSS aus Block-Attributen und der Style-Map aus block.json.
 */
final class CssGenerator {

	/**
	 * Geräte in Ausgabereihenfolge (Desktop-first) mit Media Query.
	 */
	public const DEVICES = array(
		'desktop' => null,
		'tablet'  => '(max-width:1024px)',
		'mobile'  => '(max-width:767px)',
	);

	private const STATES          = array( 'normal', 'hover' );
	private const PROPERTY        = '/^(?:[a-z-]+|--[a-z0-9-]+)$/D';
	private const SELECTOR_SUFFIX = '/^(?: [a-z0-9_-]+| \.[a-z0-9_-]+)*$/D';

	/**
	 * Erzeugt CSS für eine Blockinstanz.
	 *
	 * @param mixed        $unique_id  Block-ID (Klasse `cf65-<id>`).
	 * @param array<mixed> $map        Style-Map aus `supports.cf65.styles`.
	 * @param array<mixed> $attributes Block-Attribute (unvertrauenswürdig).
	 * @return string CSS oder leerer String.
	 */
	public function generate( mixed $unique_id, array $map, array $attributes ): string {
		$id = Sanitizer::unique_id( $unique_id );
		if ( null === $id || ( array() !== $attributes && \array_is_list( $attributes ) ) ) {
			return '';
		}

		/** @var array<string, array<string, array<string, list<string>>>> $buckets */
		$buckets = array();
		foreach ( \array_keys( self::DEVICES ) as $device ) {
			$buckets[ $device ] = array(
				'normal' => array(),
				'hover'  => array(),
			);
		}

		foreach ( $map as $entry ) {
			if ( ! \is_array( $entry ) || \array_is_list( $entry ) ) {
				continue;
			}
			$attr     = $entry['attr'] ?? null;
			$property = $entry['property'] ?? null;
			$selector = $entry['selector'] ?? '';
			if ( ! \is_string( $attr ) || ! \is_string( $property ) || 1 !== \preg_match( self::PROPERTY, $property ) ) {
				continue;
			}
			if ( ! \is_string( $selector ) || 1 !== \preg_match( self::SELECTOR_SUFFIX, $selector ) ) {
				continue;
			}
			$state  = ( $entry['state'] ?? null ) === 'hover' ? 'hover' : 'normal';
			$target = $selector;
			if ( 'hover' === $state ) {
				$target = ( ( $entry['hoverScope'] ?? null ) === 'selector' && '' !== $selector )
					? $selector . ':hover'
					: ':hover' . $selector;
			}
			$device_var = true === ( $entry['deviceVar'] ?? null ) && \str_starts_with( $property, '--' );
			$responsive = ! empty( $entry['responsive'] );
			$raw        = \array_key_exists( $attr, $attributes ) ? $attributes[ $attr ] : null;

			foreach ( \array_keys( self::DEVICES ) as $device ) {
				if ( $responsive ) {
					$value = self::is_object_like( $raw ) && \array_key_exists( $device, $raw ) ? $raw[ $device ] : null;
				} else {
					$value = 'desktop' === $device ? $raw : null;
				}

				$clean = $this->sanitize_value( $entry, $value );
				if ( null === $clean ) {
					continue;
				}
				$name = ( $device_var && 'desktop' !== $device ) ? $property . '-' . $device : $property;

				$buckets[ $device ][ $state ][ $target ][] = $name . ':' . $clean;
			}
		}

		$css = '';
		foreach ( self::DEVICES as $device => $media ) {
			$rules = '';
			foreach ( self::STATES as $state ) {
				foreach ( $buckets[ $device ][ $state ] as $target => $declarations ) {
					$rules .= '.cf65-' . $id . $target . '{' . \implode( ';', $declarations ) . '}';
				}
			}
			if ( '' !== $rules ) {
				$css .= null === $media ? $rules : '@media ' . $media . '{' . $rules . '}';
			}
		}
		return $css;
	}

	/**
	 * Bereinigt einen Wert nach dem Typ des Map-Eintrags.
	 *
	 * @param array<mixed> $entry Map-Eintrag.
	 * @param mixed        $value Rohwert.
	 */
	private function sanitize_value( array $entry, mixed $value ): ?string {
		return match ( $entry['type'] ?? null ) {
			'color'  => Sanitizer::color( $value ),
			'length' => Sanitizer::length( $value ),
			'enum'   => Sanitizer::enum( $value, \is_array( $entry['values'] ?? null ) ? $entry['values'] : array() ),
			default  => null,
		};
	}

	/**
	 * JSON-Objekt (assoziatives Array); leere Arrays zählen als Objekt.
	 *
	 * @param mixed $value Wert.
	 * @phpstan-assert-if-true array<mixed> $value
	 */
	private static function is_object_like( mixed $value ): bool {
		return \is_array( $value ) && ( array() === $value || ! \array_is_list( $value ) );
	}
}
