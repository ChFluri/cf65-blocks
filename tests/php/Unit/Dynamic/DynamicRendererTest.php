<?php
/**
 * Tests für DynamicRenderer::plan() (welche Attribute im HTML gesetzt werden).
 *
 * Das Anwenden auf HTML (HtmlPatcher, WP_HTML_Tag_Processor) prüfen die E2E-Tests.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Dynamic;

use Brain\Monkey\Functions;
use Cf65\Blocks\Dynamic\DynamicRegistry;
use Cf65\Blocks\Dynamic\DynamicRenderer;
use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectRef;
use Cf65\Blocks\Dynamic\Providers\ProviderInterface;
use Cf65\Blocks\Dynamic\Resolver;
use Cf65\Blocks\Dynamic\Sources\CurrentPostSource;
use Cf65\Blocks\Tests\Unit\Security\BlockTypes;
use Cf65\Blocks\Tests\Unit\TestCase;

final class DynamicRendererTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Functions\when( '__' )->returnArg();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'get_the_ID' )->justReturn( false );
		Functions\when( 'current_user_can' )->justReturn( false );
		Functions\when( 'post_password_required' )->justReturn( false );
		Functions\when( 'is_post_publicly_viewable' )->justReturn( true );
		Functions\when( 'get_post' )->alias(
			static function ( int $id ): \WP_Post {
				$post     = \Mockery::mock( \WP_Post::class );
				$post->ID = $id;
				return $post;
			}
		);
		Functions\when( 'wp_attachment_is_image' )->justReturn( true );
		Functions\when( 'wp_get_attachment_image_src' )->justReturn( array( 'https://example.org/b.jpg', 640, 480, false ) );
		Functions\when( 'get_post_meta' )->justReturn( '' );
		Functions\when( 'wp_strip_all_tags' )->alias( 'strip_tags' );
	}

	/**
	 * Renderer mit Test-Provider: `link` → URL, `bild` → Attachment 9, `leer` → nichts.
	 */
	private static function renderer(): DynamicRenderer {
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
				return array(
					new Field( 'link', 'Link', Field::TYPE_URL ),
					new Field( 'bild', 'Bild', Field::TYPE_IMAGE ),
					new Field( 'leer', 'Leer', Field::TYPE_IMAGE ),
				);
			}

			public function value( ObjectRef $ref, Field $field, array $args ): mixed {
				return match ( $field->name ) {
					'link'  => '/beitrag-' . $ref->id . '/',
					'bild'  => 9,
					default => null,
				};
			}
		};
		$resolver = new Resolver( new DynamicRegistry( array( new CurrentPostSource() ), array( $provider ) ) );
		return new DynamicRenderer(
			$resolver,
			static fn ( string $name ): ?array => BlockTypes::all()[ $name ]['supports']['cf65'] ?? null
		);
	}

	/**
	 * @param string $field Feld.
	 * @return array<string, array<string, string>>
	 */
	private static function dynamic( string $field ): array {
		return array(
			'url' => array(
				'source'   => 'current-post',
				'provider' => 'test',
				'field'    => $field,
			),
		);
	}

	public function test_button_link_with_new_tab(): void {
		$plan = self::renderer()->plan(
			'cf65/button',
			array(
				'opensInNewTab' => true,
				'dynamic'       => self::dynamic( 'link' ),
			),
			array( 'postId' => 7 )
		);

		self::assertSame(
			array(
				array(
					'tag'          => 'a',
					'class'        => 'cf65-button__link',
					'set'          => array(
						'href'   => '/beitrag-7/',
						'target' => '_blank',
						'rel'    => 'noopener',
					),
					'add_class'    => array(),
					'remove_class' => null,
					'drop_without' => null,
					'style'        => array(),
				),
			),
			$plan
		);
	}

	public function test_button_without_value_keeps_static_markup(): void {
		self::assertSame(
			array(),
			self::renderer()->plan( 'cf65/button', array( 'dynamic' => self::dynamic( 'leer' ) ), array( 'postId' => 7 ) )
		);
	}

	public function test_image_sets_src_size_and_media_class(): void {
		$plan = self::renderer()->plan( 'cf65/image', array( 'dynamic' => self::dynamic( 'bild' ) ), array( 'postId' => 7 ) );

		self::assertCount( 1, $plan );
		self::assertSame( 'img', $plan[0]['tag'] );
		self::assertSame(
			array(
				'src'    => 'https://example.org/b.jpg',
				'width'  => '640',
				'height' => '480',
			),
			$plan[0]['set']
		);
		self::assertSame( array( 'wp-image-9' ), $plan[0]['add_class'] );
		self::assertSame( '/^wp-image-[0-9]+$/D', $plan[0]['remove_class'] );
		self::assertSame( 'src', $plan[0]['drop_without'] );
	}

	public function test_image_without_value_drops_block_without_fallback(): void {
		$plan = self::renderer()->plan( 'cf65/image', array( 'dynamic' => self::dynamic( 'leer' ) ), array( 'postId' => 7 ) );

		self::assertSame( array(), $plan[0]['set'] );
		self::assertSame( 'src', $plan[0]['drop_without'] );
	}

	public function test_undeclared_attributes_and_invalid_bindings_are_ignored(): void {
		$renderer = self::renderer();

		self::assertSame( array(), $renderer->plan( 'cf65/heading', array( 'dynamic' => self::dynamic( 'link' ) ), array( 'postId' => 7 ) ) );
		self::assertSame(
			array(),
			$renderer->plan(
				'cf65/button',
				array(
					'dynamic' => array(
						'content' => self::dynamic( 'link' )['url'],
						'url'     => array( 'source' => '<x>' ),
					),
				),
				array( 'postId' => 7 )
			)
		);
	}

	public function test_render_ignores_foreign_blocks_and_blocks_without_bindings(): void {
		$renderer = self::renderer();

		self::assertSame( '<p>x</p>', $renderer->render( '<p>x</p>', array( 'blockName' => 'core/paragraph' ) ) );
		self::assertSame(
			'<a class="cf65-button__link">x</a>',
			$renderer->render(
				'<a class="cf65-button__link">x</a>',
				array(
					'blockName' => 'cf65/button',
					'attrs'     => array( 'dynamic' => array() ),
				)
			)
		);
	}
}
