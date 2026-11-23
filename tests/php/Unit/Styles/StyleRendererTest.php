<?php
/**
 * Tests für die Laufzeit-Ausgabe des Block-CSS.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Styles;

use Brain\Monkey\Functions;
use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Styles\StyleRenderer;
use Cf65\Blocks\Tests\Unit\TestCase;

final class StyleRendererTest extends TestCase {

	private const MAP = array(
		array(
			'attr'     => 'textColor',
			'property' => 'color',
			'type'     => 'color',
		),
	);

	private function renderer(): StyleRenderer {
		return new StyleRenderer(
			new CssGenerator(),
			static fn ( string $name ): ?array => 'cf65/heading' === $name ? self::MAP : null
		);
	}

	public function test_adds_inline_css_and_keeps_markup(): void {
		Functions\when( 'wp_style_is' )->justReturn( false );
		Functions\expect( 'wp_register_style' )->once()->with( StyleRenderer::HANDLE, false, array(), \Mockery::type( 'string' ) );
		Functions\expect( 'wp_enqueue_style' )->once()->with( StyleRenderer::HANDLE );
		Functions\expect( 'wp_add_inline_style' )->once()->with( StyleRenderer::HANDLE, '.cf65-abcd1234{color:#ff0000}' );

		$html = '<h2 class="cf65-heading cf65-abcd1234">Hallo</h2>';
		$out  = $this->renderer()->render(
			$html,
			array(
				'blockName' => 'cf65/heading',
				'attrs'     => array(
					'uniqueId'  => 'abcd1234',
					'textColor' => '#ff0000',
				),
			)
		);

		self::assertSame( $html, $out );
	}

	public function test_same_css_is_added_only_once(): void {
		Functions\when( 'wp_style_is' )->justReturn( true );
		Functions\expect( 'wp_enqueue_style' )->once();
		Functions\expect( 'wp_add_inline_style' )->once();

		$renderer = $this->renderer();
		$block    = array(
			'blockName' => 'cf65/heading',
			'attrs'     => array(
				'uniqueId'  => 'abcd1234',
				'textColor' => '#000',
			),
		);
		$renderer->render( '', $block );
		$renderer->render( '', $block );

		self::assertTrue( true );
	}

	/**
	 * @return iterable<string, array{array<mixed>}>
	 */
	public static function ignored_blocks(): iterable {
		yield 'fremder Block' => array(
			array(
				'blockName' => 'core/heading',
				'attrs'     => array(
					'uniqueId'  => 'abcd1234',
					'textColor' => '#000',
				),
			),
		);
		yield 'ohne Style-Map' => array(
			array(
				'blockName' => 'cf65/unknown',
				'attrs'     => array(
					'uniqueId'  => 'abcd1234',
					'textColor' => '#000',
				),
			),
		);
		yield 'Freiform-Block' => array( array( 'blockName' => null ) );
		yield 'Attribute kein Array' => array(
			array(
				'blockName' => 'cf65/heading',
				'attrs'     => 'x',
			),
		);
		yield 'Payload' => array(
			array(
				'blockName' => 'cf65/heading',
				'attrs'     => array(
					'uniqueId'  => 'abcd1234',
					'textColor' => '</style><script>alert(1)</script>',
				),
			),
		);
	}

	/**
	 * @param array<mixed> $block Block.
	 */
	#[\PHPUnit\Framework\Attributes\DataProvider( 'ignored_blocks' )]
	public function test_ignored_blocks_add_nothing( array $block ): void {
		Functions\expect( 'wp_add_inline_style' )->never();
		Functions\expect( 'wp_enqueue_style' )->never();

		self::assertSame( '<p>x</p>', $this->renderer()->render( '<p>x</p>', $block ) );
	}
}
