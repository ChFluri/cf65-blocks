<?php
/**
 * Tests für Binding (Struktur der Bindungen).
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Dynamic;

use Cf65\Blocks\Dynamic\Binding;
use Cf65\Blocks\Tests\Unit\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

final class BindingTest extends TestCase {

	private const VALID = array(
		'source'   => 'current-post',
		'provider' => 'core',
		'field'    => 'featured_image',
	);

	public function test_valid_binding_is_normalised(): void {
		$binding = Binding::from_array(
			array(
				'field'    => 'related.title',
				'provider' => 'pods',
				'source'   => 'current-post',
				'extra'    => 'wird verworfen',
				'args'     => array(
					'suffix' => ' CHF',
					'count'  => 2,
				),
			)
		);

		self::assertNotNull( $binding );
		self::assertSame(
			array(
				'source'   => 'current-post',
				'provider' => 'pods',
				'field'    => 'related.title',
				'args'     => array(
					'count'  => 2,
					'suffix' => ' CHF',
				),
			),
			$binding->to_array()
		);
	}

	public function test_args_are_omitted_when_empty(): void {
		self::assertSame( self::VALID, Binding::from_array( self::VALID + array( 'args' => array() ) )?->to_array() );
	}

	/**
	 * @return iterable<string, array{mixed}>
	 */
	public static function invalid(): iterable {
		yield 'kein Array' => array( 'current-post' );
		yield 'Quelle fehlt' => array( array( 'provider' => 'core', 'field' => 'title' ) );
		yield 'Quelle gross' => array( array( 'source' => 'Current' ) + self::VALID );
		yield 'Provider mit Leerzeichen' => array( array( 'provider' => 'co re' ) + self::VALID );
		yield 'Feld mit HTML' => array( array( 'field' => '<script>' ) + self::VALID );
		yield 'Feld mit Zeilenumbruch' => array( array( 'field' => "title\n" ) + self::VALID );
		yield 'Feld zu lang' => array( array( 'field' => \str_repeat( 'a', 65 ) ) + self::VALID );
		yield 'Feld als Zahl' => array( array( 'field' => 42 ) + self::VALID );
		yield 'args als Liste' => array( self::VALID + array( 'args' => array( 'a' ) ) );
		yield 'args mit Objekt' => array( self::VALID + array( 'args' => array( 'size' => array( 'large' ) ) ) );
		yield 'args mit Steuerzeichen' => array( self::VALID + array( 'args' => array( 'prefix' => "\0" ) ) );
		yield 'args Schlüssel ungültig' => array( self::VALID + array( 'args' => array( 'Pre fix' => 'x' ) ) );
		yield 'args zu lang' => array( self::VALID + array( 'args' => array( 'prefix' => \str_repeat( 'x', 201 ) ) ) );
		yield 'args unendlich' => array( self::VALID + array( 'args' => array( 'n' => INF ) ) );
		yield 'args zu viele' => array( self::VALID + array( 'args' => \array_fill_keys( \array_map( static fn ( int $i ): string => 'a' . $i, \range( 1, 17 ) ), 1 ) ) );
	}

	/**
	 * @param mixed $raw Rohwert.
	 */
	#[DataProvider( 'invalid' )]
	public function test_invalid_structure_is_rejected( mixed $raw ): void {
		self::assertNull( Binding::from_array( $raw ) );
	}
}
