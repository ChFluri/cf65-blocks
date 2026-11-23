<?php
/**
 * URL-Prüfung: gemeinsame Fälle mit JS (tests/fixtures/security/urls.json).
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Security;

use Cf65\Blocks\Security\Sanitizer;
use Cf65\Blocks\Tests\Unit\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

final class SanitizerUrlTest extends TestCase {

	/**
	 * @return iterable<string, array{string, bool, bool}>
	 */
	public static function cases(): iterable {
		$json = \json_decode(
			(string) \file_get_contents( \dirname( __DIR__, 3 ) . '/fixtures/security/urls.json' ),
			true,
			512,
			JSON_THROW_ON_ERROR
		);
		foreach ( $json['cases'] as $case ) {
			yield \json_encode( $case['url'] ) => array( $case['url'], $case['link'], $case['image'] );
		}
	}

	#[DataProvider( 'cases' )]
	public function test_shared_case( string $url, bool $link, bool $image ): void {
		self::assertSame( $link ? $url : null, Sanitizer::url( $url ) );
		self::assertSame( $image ? $url : null, Sanitizer::url( $url, Sanitizer::IMAGE_SCHEMES ) );
	}

	public function test_rejects_non_strings_and_too_long(): void {
		self::assertNull( Sanitizer::url( null ) );
		self::assertNull( Sanitizer::url( 42 ) );
		self::assertNull( Sanitizer::url( array( 'https://x.y' ) ) );
		self::assertNull( Sanitizer::url( 'https://x.y/' . \str_repeat( 'a', 2048 ) ) );
		self::assertNull( Sanitizer::url( 'https://x.y/' . \str_repeat( 'ä', 1020 ) ), 'Länge in Bytes' );
	}
}
