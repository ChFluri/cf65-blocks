<?php
/**
 * Payload-Testsuite (UMSETZPLAN Kap. 7.5), generiert aus allen block.json:
 * Jedes Stil-Attribut jedes Blocks wird mit XSS-/CSS-Injection-Payloads
 * belegt. Erwartung: kein CSS und Entfernung beim Speichern.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Security;

use Cf65\Blocks\Security\AttributeGuard;
use Cf65\Blocks\Security\CapabilityGuard;
use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Tests\Unit\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

final class PayloadTest extends TestCase {

	/** Payloads, die in keinem Werttyp gültig sein dürfen. */
	private const PAYLOADS = array(
		'red;}</style><script>alert(1)</script>',
		'</style><img src=x onerror=alert(1)>',
		'"><svg onload=alert(1)>',
		'expression(alert(1))',
		'url(javascript:alert(1))',
		'1px;background:url(//evil.example/x)',
		'10px}body{display:none',
		"#fff\n}",
		"#fff\0",
		'var(--x);}',
		'var(--x)}</style>',
		'calc(1px + 1px)',
		'@import url(x)',
		'left;color:red',
		'CENTER',
		'',
		' 10px',
		'10px ',
		'１０px',
	);

	/** Falsche Typen. */
	private const WRONG_TYPES = array( 42, 1.5, true, null, array( '#fff' ) );

	/**
	 * @return iterable<string, array{string, array<string, mixed>, mixed}>
	 */
	public static function cases(): iterable {
		foreach ( BlockTypes::all() as $name => $type ) {
			$styles = $type['supports']['cf65']['styles'] ?? array();
			foreach ( $styles as $entry ) {
				foreach ( \array_merge( self::PAYLOADS, self::WRONG_TYPES ) as $i => $payload ) {
					$value = ! empty( $entry['responsive'] )
						? array(
							'desktop' => $payload,
							'tablet'  => $payload,
							'mobile'  => $payload,
						)
						: $payload;
					yield \sprintf( '%s %s #%d', $name, $entry['attr'], $i ) => array( $name, $entry, $value );
				}
				if ( ! empty( $entry['responsive'] ) ) {
					yield \sprintf( '%s %s Liste', $name, $entry['attr'] ) => array( $name, $entry, array( '10px' ) );
				}
			}
		}
	}

	/**
	 * @param string               $name  Blockname.
	 * @param array<string, mixed> $entry Map-Eintrag.
	 * @param mixed                $value Payload.
	 */
	#[DataProvider( 'cases' )]
	public function test_payload_produces_no_css_and_is_removed( string $name, array $entry, mixed $value ): void {
		$attr       = (string) $entry['attr'];
		$attributes = array(
			'uniqueId' => 'abcd1234',
			$attr      => $value,
		);
		$map        = BlockTypes::all()[ $name ]['supports']['cf65']['styles'];

		self::assertSame( '', ( new CssGenerator() )->generate( 'abcd1234', $map, $attributes ) );

		$guard = new AttributeGuard( new CapabilityGuard( static fn (): bool => true ), BlockTypes::resolver() );
		self::assertSame( array( 'uniqueId' => 'abcd1234' ), $guard->sanitize_attributes( $name, $attributes ) );
	}

	public function test_every_block_has_styles_covered(): void {
		$covered = \array_unique( \array_map( static fn ( array $case ): string => $case[0], \iterator_to_array( self::cases() ) ) );
		self::assertSame( \array_keys( BlockTypes::all() ), \array_values( $covered ) );
	}
}
