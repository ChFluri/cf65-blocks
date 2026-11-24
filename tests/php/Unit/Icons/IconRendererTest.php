<?php
/**
 * Tests für Icon-Bibliothek und Icon-Renderer.
 *
 * Das Finden der Platzhalter (IconSlotScanner, WP_HTML_Tag_Processor) prüfen die E2E-Tests.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Icons;

use Brain\Monkey\Functions;
use Cf65\Blocks\Icons\IconLibrary;
use Cf65\Blocks\Icons\IconRenderer;
use Cf65\Blocks\Tests\Unit\TestCase;

final class IconRendererTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Functions\when( 'esc_attr' )->alias( static fn ( string $text ): string => \htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ) );
	}

	public function test_library_contains_general_and_brand_icons(): void {
		$icons = IconLibrary::all();

		self::assertGreaterThan( 150, \count( $icons ) );
		self::assertSame( 'general', $icons['star']['g'] );
		self::assertSame( 'brands', $icons['brand-facebook']['g'] );
		self::assertMatchesRegularExpression( '/^#[0-9a-f]{6}$/D', $icons['brand-facebook']['c'] );
		self::assertTrue( IconLibrary::has( 'heart' ) );
		self::assertFalse( IconLibrary::has( 'gibt-es-nicht' ) );
		self::assertFalse( IconLibrary::has( array( 'star' ) ) );
	}

	public function test_svg_uses_stroke_for_general_and_fill_for_brands(): void {
		$star = IconLibrary::svg( 'star' );
		self::assertStringStartsWith( '<svg class="cf65-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"', $star );
		self::assertStringContainsString( 'aria-hidden="true" focusable="false"', $star );
		self::assertStringContainsString( '<path d="', $star );
		self::assertStringEndsWith( '</svg>', $star );

		self::assertStringContainsString( 'fill="currentColor" aria-hidden="true"', IconLibrary::svg( 'brand-github' ) );
		self::assertSame( '', IconLibrary::svg( 'gibt-es-nicht' ) );
		self::assertSame( '', IconLibrary::svg( '"><script>' ) );
	}

	public function test_every_icon_renders_only_whitelisted_markup(): void {
		foreach ( \array_keys( IconLibrary::all() ) as $name ) {
			$svg = IconLibrary::svg( $name );
			self::assertNotSame( '', $svg, $name );
			self::assertDoesNotMatchRegularExpression( '/<(?!\/?(svg|path|circle|ellipse|rect|line|polyline|polygon)[ >])/', $svg, $name );
			// Keine Event-Handler (on…=) und keine externen Referenzen.
			self::assertDoesNotMatchRegularExpression( '/\son[a-z]+=|href|xlink|url\(/i', \preg_replace( '/"[^"]*"/', '""', $svg ) ?? '', $name );
		}
	}

	public function test_fill_inserts_svgs_into_empty_slots(): void {
		$html  = '<ul><li><span class="cf65-icon-slot" aria-hidden="true"></span>A</li><li><span class="cf65-icon-slot" data-cf65-icon="star" aria-hidden="true"></span>B</li></ul>';
		$first = \strpos( $html, '></span>A' ) + 1;
		$star  = \strpos( $html, '></span>B' ) + 1;

		$result = IconRenderer::fill(
			$html,
			array(
				array(
					'position' => $first,
					'icon'     => null,
				),
				array(
					'position' => $star,
					'icon'     => 'star',
				),
			),
			'check'
		);

		self::assertStringContainsString( 'aria-hidden="true">' . IconLibrary::svg( 'check' ) . '</span>A', $result );
		self::assertStringContainsString( 'aria-hidden="true">' . IconLibrary::svg( 'star' ) . '</span>B', $result );
	}

	public function test_fill_skips_filled_slots_unknown_icons_and_bad_positions(): void {
		$html = '<span class="cf65-icon-slot"><svg></svg></span><span class="cf65-icon-slot"></span>';

		$result = IconRenderer::fill(
			$html,
			array(
				array(
					'position' => \strpos( $html, '<svg>' ),
					'icon'     => 'star',
				),
				array(
					'position' => \strrpos( $html, '</span>' ),
					'icon'     => 'gibt-es-nicht',
				),
				array(
					'position' => 9999,
					'icon'     => 'star',
				),
			),
			null
		);

		self::assertSame( $html, $result );
	}

	public function test_fallback_uses_instance_attributes_with_defaults(): void {
		$renderer = new IconRenderer( static fn (): array => array( 'iconFallback' => 'icon' ) );
		$block    = array(
			'blockName' => 'cf65/icon-list',
			'attrs'     => array( 'uniqueId' => 'l1i2s3t4' ),
		);
		$instance = \Mockery::mock( \WP_Block::class );
		// Standardwert, der nicht im Block-Kommentar steht.
		$instance->attributes = array(
			'uniqueId' => 'l1i2s3t4',
			'icon'     => 'check',
		);

		self::assertSame( 'check', $renderer->fallback( 'cf65/icon-list', $block, $instance ) );
		self::assertNull( $renderer->fallback( 'cf65/icon-list', $block, null ) );
		self::assertSame( 'x', $renderer->fallback( 'cf65/icon-list', array( 'attrs' => array( 'icon' => 'x' ) ), null ) );
		self::assertNull( ( new IconRenderer( static fn (): array => array() ) )->fallback( 'cf65/icon', $block, $instance ) );
	}

	public function test_render_ignores_foreign_blocks_and_blocks_without_slots(): void {
		$renderer = new IconRenderer( static fn (): array => array() );

		self::assertSame( '<span class="cf65-icon-slot"></span>', $renderer->render( '<span class="cf65-icon-slot"></span>', array( 'blockName' => 'core/paragraph' ) ) );
		self::assertSame( '<p>x</p>', $renderer->render( '<p>x</p>', array( 'blockName' => 'cf65/icon' ) ) );
	}
}
