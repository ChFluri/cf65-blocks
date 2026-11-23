<?php
/**
 * Tests für den CSS-Generator (gemeinsame Fälle mit dem JS-Port).
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Styles;

use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Tests\Unit\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

final class CssGeneratorTest extends TestCase {

	/**
	 * Lädt tests/fixtures/css/cases.json.
	 *
	 * @return array{map: array<mixed>, cases: list<array{name: string, uniqueId: mixed, attributes: array<mixed>, expected: string}>}
	 */
	private static function fixtures(): array {
		$json = file_get_contents( dirname( __DIR__, 3 ) . '/fixtures/css/cases.json' );
		self::assertIsString( $json );
		$data = json_decode( $json, true, 512, JSON_THROW_ON_ERROR );
		self::assertIsArray( $data );
		/** @var array{map: array<mixed>, cases: list<array{name: string, uniqueId: mixed, attributes: array<mixed>, expected: string}>} $data */
		return $data;
	}

	/**
	 * @return iterable<string, array{mixed, array<mixed>, string}>
	 */
	public static function shared_cases(): iterable {
		foreach ( self::fixtures()['cases'] as $case ) {
			yield $case['name'] => array( $case['uniqueId'], $case['attributes'], $case['expected'] );
		}
	}

	/**
	 * @param array<mixed> $attributes Attribute.
	 */
	#[DataProvider( 'shared_cases' )]
	public function test_shared_case( mixed $unique_id, array $attributes, string $expected ): void {
		$css = ( new CssGenerator() )->generate( $unique_id, self::fixtures()['map'], $attributes );

		self::assertSame( $expected, $css );
	}

	public function test_ignores_invalid_map_entries(): void {
		$map = array(
			null,
			array( 'attr' => 'a', 'property' => 'color;x', 'type' => 'color' ),
			array( 'attr' => 'a', 'property' => 'color', 'type' => 'color', 'selector' => '{}' ),
			array( 'attr' => 'a', 'property' => 'color', 'type' => 'unknown' ),
			array( 'attr' => 'a', 'property' => 'color', 'type' => 'color' ),
		);

		self::assertSame( '.cf65-abcd{color:#fff}', ( new CssGenerator() )->generate( 'abcd', $map, array( 'a' => '#fff' ) ) );
	}

	public function test_rejects_list_attributes(): void {
		self::assertSame( '', ( new CssGenerator() )->generate( 'abcd', self::fixtures()['map'], array( '#fff' ) ) );
	}

	public function test_output_never_contains_markup_breakout(): void {
		$payloads = array( '</style>', '<script>', '"', "'", '\\', '@import', 'expression(', 'javascript:', "\n", '}', '{' );
		$map      = self::fixtures()['map'];

		foreach ( self::fixtures()['cases'] as $case ) {
			$css = ( new CssGenerator() )->generate( $case['uniqueId'], $map, $case['attributes'] );
			foreach ( $payloads as $payload ) {
				if ( '}' === $payload || '{' === $payload ) {
					// Klammern nur als Regel-Begrenzer: Anzahl muss ausgeglichen sein.
					self::assertSame( substr_count( $css, '{' ), substr_count( $css, '}' ), $case['name'] );
					continue;
				}
				self::assertStringNotContainsString( $payload, $css, $case['name'] );
			}
		}
	}
}
