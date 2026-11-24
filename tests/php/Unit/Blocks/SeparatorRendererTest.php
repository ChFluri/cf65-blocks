<?php
/**
 * Tests für den SVG-Renderer des Trenners.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Blocks;

use Brain\Monkey\Functions;
use Cf65\Blocks\Blocks\SeparatorRenderer;
use Cf65\Blocks\Tests\Unit\TestCase;

final class SeparatorRendererTest extends TestCase {

	private const HTML = '<div class="wp-block-cf65-separator cf65-block cf65-separator cf65-s3p4r5t6" aria-hidden="true"></div>';

	protected function setUp(): void {
		parent::setUp();
		Functions\when( 'esc_attr' )->alias( static fn ( string $text ): string => \htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ) );
	}

	public function test_shapes_are_loaded_and_valid(): void {
		$shapes = SeparatorRenderer::shapes();

		self::assertSame( array( 'wave', 'curve', 'slant', 'triangle' ), \array_keys( $shapes ) );
	}

	public function test_svg_is_inserted_into_the_wrapper(): void {
		$html = ( new SeparatorRenderer() )->render(
			self::HTML,
			array(
				'blockName' => 'cf65/separator',
				'attrs'     => array( 'design' => 'slant' ),
			)
		);

		self::assertSame(
			'<div class="wp-block-cf65-separator cf65-block cf65-separator cf65-s3p4r5t6" aria-hidden="true">'
			. '<svg viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false"><path d="M0 100L1000 0V100Z"></path></svg></div>',
			$html
		);
	}

	public function test_unknown_or_missing_design_uses_the_first_shape(): void {
		$renderer = new SeparatorRenderer();
		$wave     = SeparatorRenderer::shapes()['wave'];

		foreach ( array( array(), array( 'design' => '"><script>' ), array( 'design' => array( 'x' ) ) ) as $attrs ) {
			$html = $renderer->render(
				self::HTML,
				array(
					'blockName' => 'cf65/separator',
					'attrs'     => $attrs,
				)
			);
			self::assertStringContainsString( 'd="' . $wave . '"', $html );
			self::assertStringNotContainsString( 'script', $html );
		}
	}

	public function test_other_blocks_and_existing_svg_stay_unchanged(): void {
		$renderer = new SeparatorRenderer();

		self::assertSame( '<div></div>', $renderer->render( '<div></div>', array( 'blockName' => 'cf65/spacer' ) ) );
		$with_svg = '<div><svg></svg></div>';
		self::assertSame( $with_svg, $renderer->render( $with_svg, array( 'blockName' => 'cf65/separator' ) ) );
		self::assertSame( '', $renderer->render( '', array( 'blockName' => 'cf65/separator' ) ) );
	}
}
