<?php
/**
 * Tests für AttributeGuard und CapabilityGuard.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Security;

use Brain\Monkey\Functions;
use Cf65\Blocks\Security\AttributeGuard;
use Cf65\Blocks\Security\CapabilityGuard;
use Cf65\Blocks\Tests\Unit\TestCase;

final class AttributeGuardTest extends TestCase {

	private function guard( bool $can = true ): AttributeGuard {
		return new AttributeGuard(
			new CapabilityGuard( static fn (): bool => $can ),
			BlockTypes::resolver()
		);
	}

	public function test_valid_attributes_stay_unchanged(): void {
		$attrs = array(
			'uniqueId'             => 'b1u2t3n4',
			'content'              => 'Mehr <strong>erfahren</strong>',
			'url'                  => 'https://example.org/',
			'opensInNewTab'        => true,
			'textAlign'            => array(
				'desktop' => 'center',
				'mobile'  => 'left',
			),
			'paddingInline'        => array( 'tablet' => '2rem' ),
			'borderRadius'         => '0',
			'backgroundColor'      => 'var(--wp--preset--color--primary)',
			'backgroundColorHover' => 'rgba(0, 0, 0, 0.5)',
			'unbekannt'            => 'bleibt (Downgrade-Sicherheit)',
		);

		self::assertSame( $attrs, $this->guard()->sanitize_attributes( 'cf65/button', $attrs ) );
	}

	public function test_invalid_values_are_removed(): void {
		$clean = $this->guard()->sanitize_attributes(
			'cf65/button',
			array(
				'uniqueId'        => 'x}body{',
				'url'             => 'javascript:alert(1)',
				'opensInNewTab'   => 'yes',
				'textColor'       => 'red;}</style><script>alert(1)</script>',
				'backgroundColor' => array( '#fff' ),
				'fontSize'        => '40px',
				'textAlign'       => array(
					'desktop' => 'center;color:red',
					'watch'   => 'left',
					'mobile'  => 'right',
				),
				'content'         => 'Text',
			)
		);

		self::assertSame(
			array(
				'textAlign' => array( 'mobile' => 'right' ),
				'content'   => 'Text',
			),
			$clean
		);
	}

	public function test_values_are_normalised_like_the_generator(): void {
		$clean = $this->guard()->sanitize_attributes(
			'cf65/heading',
			array( 'textColor' => 'Transparent' )
		);

		self::assertSame( array( 'textColor' => 'transparent' ), $clean );
	}

	public function test_image_url_only_http(): void {
		$guard = $this->guard();

		self::assertSame( array(), $guard->sanitize_attributes( 'cf65/image', array( 'url' => 'mailto:x@y.z' ) ) );
		self::assertSame(
			array( 'url' => '/wp-content/uploads/a.jpg' ),
			$guard->sanitize_attributes( 'cf65/image', array( 'url' => '/wp-content/uploads/a.jpg' ) )
		);
	}

	public function test_unknown_block_is_untouched(): void {
		$attrs = array( 'textColor' => 'red;}' );
		self::assertSame( $attrs, $this->guard()->sanitize_attributes( 'cf65/does-not-exist', $attrs ) );
	}

	public function test_capability_guard_removes_restricted_attributes(): void {
		$guard = new CapabilityGuard( static fn ( string $cap ): bool => 'edit_posts' === $cap );
		$attrs = array(
			'customCss' => 'a{}',
			'safe'      => 1,
			'other'     => 2,
		);

		self::assertSame(
			array(
				'safe'  => 1,
				'other' => 2,
			),
			$guard->filter(
				$attrs,
				array(
					'customCss' => 'unfiltered_html',
					'other'     => 'edit_posts',
					'missing'   => 'unfiltered_html',
				)
			)
		);
		self::assertSame( array(), $guard->filter( array( 'other' => 2 ), array( 'other' => '' ) ), 'ungültige Deklaration → entfernen' );
	}

	public function test_filter_post_data_reserializes_only_on_change(): void {
		Functions\when( 'wp_unslash' )->returnArg();
		Functions\when( 'wp_slash' )->returnArg();
		Functions\when( 'parse_blocks' )->justReturn(
			array(
				array(
					'blockName'   => 'cf65/columns',
					'attrs'       => array( 'uniqueId' => 'c0l5abcd' ),
					'innerBlocks' => array(
						array(
							'blockName'   => 'cf65/column',
							'attrs'       => array( 'backgroundColor' => 'url(javascript:x)' ),
							'innerBlocks' => array(),
						),
					),
				),
			)
		);
		Functions\expect( 'serialize_blocks' )->once()->andReturnUsing(
			static fn ( array $blocks ): string => (string) \json_encode( $blocks[0]['innerBlocks'][0]['attrs'] )
		);

		$data = $this->guard()->filter_post_data( array( 'post_content' => '<!-- wp:cf65/columns -->x' ) );

		self::assertSame( '[]', $data['post_content'] );
	}

	public function test_filter_post_data_ignores_content_without_cf65_blocks(): void {
		Functions\expect( 'parse_blocks' )->never();
		$data = array( 'post_content' => '<!-- wp:paragraph --><p>x</p><!-- /wp:paragraph -->' );

		self::assertSame( $data, $this->guard()->filter_post_data( $data ) );
	}

	public function test_unchanged_content_is_returned_byte_identical(): void {
		Functions\when( 'parse_blocks' )->justReturn(
			array(
				array(
					'blockName'   => 'cf65/text',
					'attrs'       => array( 'uniqueId' => 't1x2t3x4' ),
					'innerBlocks' => array(),
				),
			)
		);
		Functions\expect( 'serialize_blocks' )->never();

		$content = '<!-- wp:cf65/text {"uniqueId":"t1x2t3x4"} --><p>x</p><!-- /wp:cf65/text -->';
		self::assertSame( $content, $this->guard()->sanitize_content( $content ) );
	}
}
