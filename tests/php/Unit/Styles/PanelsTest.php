<?php
/**
 * Tests für die gemeinsamen Style-Panels und das Hintergrundbild.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Styles;

use Brain\Monkey\Functions;
use Cf65\Blocks\Dynamic\DynamicRegistry;
use Cf65\Blocks\Dynamic\DynamicRenderer;
use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectRef;
use Cf65\Blocks\Dynamic\Providers\ProviderInterface;
use Cf65\Blocks\Dynamic\Resolver;
use Cf65\Blocks\Dynamic\Sources\CurrentPostSource;
use Cf65\Blocks\Security\AttributeGuard;
use Cf65\Blocks\Security\CapabilityGuard;
use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Styles\Panels;
use Cf65\Blocks\Tests\Unit\Security\BlockTypes;
use Cf65\Blocks\Tests\Unit\TestCase;

final class PanelsTest extends TestCase {

	private const METADATA = array(
		'name'       => 'cf65/test',
		'attributes' => array(
			'uniqueId'          => array( 'type' => 'string' ),
			'styleBorderRadius' => array(
				'type'    => 'string',
				'default' => '4px',
			),
		),
		'supports'   => array(
			'cf65' => array(
				'panels' => array( 'margin', 'border', 'backgroundImage', 'unbekannt' ),
				'styles' => array(
					array(
						'attr'     => 'textColor',
						'property' => 'color',
						'type'     => 'color',
					),
				),
			),
		),
	);

	public function test_panels_add_attributes_styles_and_dynamic(): void {
		$metadata = Panels::apply( self::METADATA );

		self::assertArrayHasKey( 'styleMarginTop', $metadata['attributes'] );
		self::assertArrayHasKey( 'styleBackgroundImage', $metadata['attributes'] );
		self::assertArrayNotHasKey( 'styleShadow', $metadata['attributes'] );
		// Bestehende Definition bleibt.
		self::assertSame( '4px', $metadata['attributes']['styleBorderRadius']['default'] );

		$attrs = \array_column( $metadata['supports']['cf65']['styles'], 'attr' );
		self::assertSame( 'textColor', $attrs[0] );
		self::assertContains( 'styleMarginBottom', $attrs );
		self::assertContains( 'styleBorderColorHover', $attrs );
		self::assertContains( 'styleBackgroundRepeat', $attrs );

		self::assertSame(
			array(
				'kind'  => 'image',
				'style' => 'background-image',
			),
			$metadata['supports']['cf65']['dynamic']['styleBackgroundImage']
		);
	}

	public function test_blocks_without_panels_and_foreign_blocks_are_unchanged(): void {
		$plain = array(
			'name'     => 'cf65/plain',
			'supports' => array( 'cf65' => array( 'styles' => array() ) ),
		);
		$core  = array( 'name' => 'core/paragraph' ) + \array_diff_key( self::METADATA, array( 'name' => 0 ) );

		self::assertSame( $plain, Panels::apply( $plain ) );
		self::assertSame( $core, Panels::apply( $core ) );
	}

	public function test_every_panel_style_attribute_is_declared(): void {
		foreach ( Panels::definitions() as $name => $definition ) {
			foreach ( $definition['styles'] as $entry ) {
				self::assertArrayHasKey( $entry['attr'], $definition['attributes'], $name );
			}
			self::assertContains( $definition['tab'], array( 'layout', 'style' ), $name );
		}
	}

	public function test_panel_css_for_text_block(): void {
		$map = BlockTypes::all()['cf65/text']['supports']['cf65']['styles'];
		$css = ( new CssGenerator() )->generate(
			'abcd1234',
			$map,
			array(
				'styleMarginTop'          => array(
					'desktop' => '2rem',
					'mobile'  => '1rem',
				),
				'styleBorderWidth'        => '1px',
				'styleBorderStyle'        => 'solid',
				'styleBorderColorHover'   => '#ff0000',
				'styleShadow'             => '0 4px 12px rgba(0,0,0,.15)',
				'styleBackgroundImage'    => array(
					'url' => '/wp-content/uploads/a.jpg',
					'id'  => 3,
				),
				'styleBackgroundPosition' => 'center center',
			)
		);

		self::assertSame(
			".cf65-abcd1234{margin-top:2rem;border-width:1px;border-style:solid;box-shadow:0 4px 12px rgba(0,0,0,.15);background-image:url(/wp-content/uploads/a.jpg);background-position:center center}"
			. '.cf65-abcd1234:hover{border-color:#ff0000}'
			. '@media (max-width:767px){.cf65-abcd1234{margin-top:1rem}}',
			$css
		);
	}

	public function test_guard_normalises_background_image_and_rejects_invalid(): void {
		$guard = new AttributeGuard( new CapabilityGuard( static fn (): bool => true ), BlockTypes::resolver() );

		self::assertSame(
			array(
				'styleBackgroundImage' => array( 'url' => 'https://example.org/a.jpg' ),
				'styleShadow'          => 'none',
			),
			$guard->sanitize_attributes(
				'cf65/text',
				array(
					'styleBackgroundImage' => array(
						'url' => 'https://example.org/a.jpg',
						'id'  => '3',
						'x'   => '<script>',
					),
					'styleShadow'          => 'none',
					'styleBorderStyle'     => 'solid;color:red',
				)
			)
		);
		self::assertSame(
			array(),
			$guard->sanitize_attributes( 'cf65/text', array( 'styleBackgroundImage' => array( 'url' => "a.jpg');}" ) ) )
		);
	}

	public function test_dynamic_background_image_becomes_inline_style(): void {
		Functions\when( '__' )->returnArg();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'get_the_ID' )->justReturn( false );
		Functions\when( 'current_user_can' )->justReturn( true );
		Functions\when( 'get_post' )->alias(
			static function ( int $id ): \WP_Post {
				$post     = \Mockery::mock( \WP_Post::class );
				$post->ID = $id;
				return $post;
			}
		);

		$provider = new class() implements ProviderInterface {
			public function id(): string {
				return 'test';
			}

			public function label(): string {
				return 'Test';
			}

			public function is_available(): bool {
				return true;
			}

			public function fields( ObjectRef $ref ): array {
				return array( new Field( 'bild', 'Bild', Field::TYPE_IMAGE ), new Field( 'leer', 'Leer', Field::TYPE_IMAGE ) );
			}

			public function value( ObjectRef $ref, Field $field, array $args ): mixed {
				return 'bild' === $field->name ? 'https://example.org/hero.jpg' : null;
			}
		};
		$renderer = new DynamicRenderer(
			new Resolver( new DynamicRegistry( array( new CurrentPostSource() ), array( $provider ) ) ),
			static fn ( string $name ): ?array => BlockTypes::all()[ $name ]['supports']['cf65'] ?? null
		);
		$binding  = static fn ( string $field ): array => array(
			'dynamic' => array(
				'styleBackgroundImage' => array(
					'source'   => 'current-post',
					'provider' => 'test',
					'field'    => $field,
				),
			),
		);

		self::assertSame(
			array(
				array(
					'tag'          => null,
					'class'        => null,
					'set'          => array(),
					'add_class'    => array(),
					'remove_class' => null,
					'drop_without' => null,
					'style'        => array( 'background-image' => "url(https://example.org/hero.jpg)" ),
				),
			),
			$renderer->plan( 'cf65/columns', $binding( 'bild' ), array( 'postId' => 4 ) )
		);
		self::assertSame( array(), $renderer->plan( 'cf65/columns', $binding( 'leer' ), array( 'postId' => 4 ) ) );
		// Block ohne Panel backgroundImage: Bindung wird ignoriert.
		self::assertSame( array(), $renderer->plan( 'cf65/button', $binding( 'bild' ), array( 'postId' => 4 ) ) );
	}
}
