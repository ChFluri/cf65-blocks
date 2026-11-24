<?php
/**
 * Tests für Resolver, Quelle „Aktueller Beitrag“, Core-Provider, Objektprüfung und Formatter.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Dynamic;

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use Cf65\Blocks\Dynamic\Binding;
use Cf65\Blocks\Dynamic\DynamicRegistry;
use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\Formatter;
use Cf65\Blocks\Dynamic\ObjectPolicy;
use Cf65\Blocks\Dynamic\ObjectRef;
use Cf65\Blocks\Dynamic\Providers\CoreProvider;
use Cf65\Blocks\Dynamic\Providers\ProviderInterface;
use Cf65\Blocks\Dynamic\Resolver;
use Cf65\Blocks\Dynamic\Sources\CurrentPostSource;
use Cf65\Blocks\Tests\Unit\TestCase;

final class ResolverTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Functions\when( '__' )->returnArg();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'get_the_ID' )->justReturn( false );
	}

	/**
	 * Beitrag als WP_Post-Mock.
	 *
	 * @param int $id ID.
	 */
	private static function post( int $id ): \WP_Post {
		$post     = \Mockery::mock( \WP_Post::class );
		$post->ID = $id;
		return $post;
	}

	/**
	 * Stubs für WordPress: Beitrag 10 öffentlich, 20 privat, 30 passwortgeschützt.
	 *
	 * @param bool $can_edit Darf der Benutzer bearbeiten.
	 */
	private function wordpress( bool $can_edit = false ): void {
		Functions\when( 'get_post' )->alias( static fn ( int $id ): ?\WP_Post => \in_array( $id, array( 10, 20, 30 ), true ) ? self::post( $id ) : null );
		Functions\when( 'current_user_can' )->justReturn( $can_edit );
		Functions\when( 'post_password_required' )->alias( static fn ( \WP_Post $post ): bool => 30 === $post->ID );
		Functions\when( 'is_post_publicly_viewable' )->alias( static fn ( \WP_Post $post ): bool => 20 !== $post->ID );
		Functions\when( 'get_permalink' )->alias( static fn ( int $id ): string => 'https://example.org/?p=' . $id );
		Functions\when( 'get_the_title' )->justReturn( 'Titel' );
		Functions\when( 'get_post_thumbnail_id' )->justReturn( 5 );
		Functions\when( 'wp_attachment_is_image' )->alias( static fn ( int $id ): bool => 5 === $id );
		Functions\when( 'wp_get_attachment_image_src' )->justReturn( array( 'https://example.org/bild.jpg', 1200, 800, false ) );
		Functions\when( 'get_post_meta' )->justReturn( 'Ein <b>Berg</b> ' );
		Functions\when( 'wp_strip_all_tags' )->alias( 'strip_tags' );
	}

	/**
	 * Resolver nur mit dem Core-Provider (unabhängig von ACF / Meta).
	 */
	private static function core(): Resolver {
		return new Resolver( new DynamicRegistry( array( new CurrentPostSource() ), array( new CoreProvider() ) ) );
	}

	private static function binding( string $field, string $provider = 'core' ): Binding {
		$binding = Binding::from_array(
			array(
				'source'   => 'current-post',
				'provider' => $provider,
				'field'    => $field,
			)
		);
		self::assertNotNull( $binding );
		return $binding;
	}

	public function test_link_from_current_post_context(): void {
		$this->wordpress();

		self::assertSame(
			'https://example.org/?p=10',
			self::core()->resolve( self::binding( 'permalink' ), array( 'postId' => 10 ), Formatter::KIND_LINK )
		);
	}

	public function test_image_from_featured_image(): void {
		$this->wordpress();

		self::assertSame(
			array(
				'url'    => 'https://example.org/bild.jpg',
				'id'     => 5,
				'alt'    => 'Ein Berg',
				'width'  => 1200,
				'height' => 800,
			),
			self::core()->resolve( self::binding( 'featured_image' ), array( 'postId' => 10 ), Formatter::KIND_IMAGE )
		);
	}

	public function test_global_post_is_used_without_context(): void {
		$this->wordpress();
		Functions\when( 'get_the_ID' )->justReturn( 10 );

		self::assertSame(
			'https://example.org/?p=10',
			self::core()->resolve( self::binding( 'permalink' ), array(), Formatter::KIND_LINK )
		);
	}

	public function test_no_post_gives_null(): void {
		$this->wordpress();

		self::assertNull( self::core()->resolve( self::binding( 'permalink' ), array( 'postId' => 0 ), Formatter::KIND_LINK ) );
		self::assertNull( self::core()->resolve( self::binding( 'permalink' ), array( 'postId' => 99 ), Formatter::KIND_LINK ) );
	}

	public function test_private_and_protected_posts_are_hidden_from_visitors(): void {
		$this->wordpress();
		$resolver = self::core();

		self::assertNull( $resolver->resolve( self::binding( 'permalink' ), array( 'postId' => 20 ), Formatter::KIND_LINK ) );
		self::assertNull( $resolver->resolve( self::binding( 'permalink' ), array( 'postId' => 30 ), Formatter::KIND_LINK ) );
	}

	public function test_editors_see_their_drafts(): void {
		$this->wordpress( true );

		self::assertSame(
			'https://example.org/?p=20',
			self::core()->resolve( self::binding( 'permalink' ), array( 'postId' => 20 ), Formatter::KIND_LINK )
		);
	}

	public function test_unknown_field_provider_and_source_give_null(): void {
		$this->wordpress();
		$resolver = self::core();

		self::assertNull( $resolver->resolve( self::binding( 'post_password' ), array( 'postId' => 10 ), Formatter::KIND_LINK ) );
		self::assertNull( $resolver->resolve( self::binding( 'permalink', 'acf' ), array( 'postId' => 10 ), Formatter::KIND_LINK ) );

		$other = Binding::from_array(
			array(
				'source'   => 'specific-post',
				'provider' => 'core',
				'field'    => 'permalink',
			)
		);
		self::assertNotNull( $other );
		self::assertNull( $resolver->resolve( $other, array( 'postId' => 10 ), Formatter::KIND_LINK ) );
	}

	public function test_field_type_must_match_kind(): void {
		$this->wordpress();
		$resolver = self::core();

		self::assertNull( $resolver->resolve( self::binding( 'title' ), array( 'postId' => 10 ), Formatter::KIND_LINK ) );
		self::assertNull( $resolver->resolve( self::binding( 'permalink' ), array( 'postId' => 10 ), Formatter::KIND_IMAGE ) );
	}

	public function test_allow_field_filter_can_block(): void {
		$this->wordpress();
		Filters\expectApplied( 'cf65_blocks/dynamic/allow_field' )->once()->andReturn( false );

		self::assertNull( self::core()->resolve( self::binding( 'permalink' ), array( 'postId' => 10 ), Formatter::KIND_LINK ) );
	}

	public function test_unsafe_values_are_dropped(): void {
		$this->wordpress();
		Functions\when( 'get_permalink' )->justReturn( 'javascript:alert(1)' );
		Functions\when( 'get_post_thumbnail_id' )->justReturn( 0 );

		$resolver = self::core();
		self::assertNull( $resolver->resolve( self::binding( 'permalink' ), array( 'postId' => 10 ), Formatter::KIND_LINK ) );
		self::assertNull( $resolver->resolve( self::binding( 'featured_image' ), array( 'postId' => 10 ), Formatter::KIND_IMAGE ) );
	}

	public function test_values_are_cached_per_request(): void {
		$provider = new class() implements ProviderInterface {
			public int $calls = 0;

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
				return array( new Field( 'link', 'Link', Field::TYPE_URL ) );
			}

			public function value( ObjectRef $ref, Field $field, array $args ): mixed {
				++$this->calls;
				return '/beitrag-' . $ref->id;
			}
		};
		$this->wordpress();
		$resolver = new Resolver( new DynamicRegistry( array( new CurrentPostSource() ), array( $provider ) ), new ObjectPolicy() );
		$binding  = self::binding( 'link', 'test' );

		self::assertSame( '/beitrag-10', $resolver->resolve( $binding, array( 'postId' => 10 ), Formatter::KIND_LINK ) );
		self::assertSame( '/beitrag-10', $resolver->resolve( $binding, array( 'postId' => 10 ), Formatter::KIND_LINK ) );
		// Geschützter Beitrag: der Provider wird gar nicht erst gefragt.
		self::assertNull( $resolver->resolve( $binding, array( 'postId' => 30 ), Formatter::KIND_LINK ) );
		self::assertSame( 1, $provider->calls );
	}

	public function test_fields_are_grouped_and_filtered_by_kind(): void {
		$resolver = self::core();
		$ref   = new ObjectRef( ObjectRef::TYPE_POST, 0, 'post' );

		self::assertSame(
			array(
				array(
					'id'     => CoreProvider::ID,
					'label'  => 'WordPress',
					'fields' => array(
						array(
							'name'  => 'featured_image',
							'label' => 'Beitragsbild',
							'type'  => 'image',
						),
					),
				),
			),
			$resolver->fields( $ref, Formatter::KIND_IMAGE )
		);
		self::assertSame( array( 'permalink' ), \array_column( $resolver->fields( $ref, Formatter::KIND_LINK )[0]['fields'], 'name' ) );
		self::assertSame( array(), $resolver->fields( $ref, 'unbekannt' ) );
		self::assertSame(
			array(
				array(
					'id'    => 'current-post',
					'label' => 'Aktueller Beitrag',
				),
			),
			$resolver->sources()
		);
	}

	public function test_unavailable_providers_are_skipped(): void {
		$provider = new class() implements ProviderInterface {
			public function id(): string {
				return 'acf';
			}

			public function label(): string {
				return 'ACF';
			}

			public function is_available(): bool {
				return false;
			}

			public function fields( ObjectRef $ref ): array {
				return array( new Field( 'bild', 'Bild', Field::TYPE_IMAGE ) );
			}

			public function value( ObjectRef $ref, Field $field, array $args ): mixed {
				return 5;
			}
		};
		$resolver = new Resolver( new DynamicRegistry( array( new CurrentPostSource() ), array( $provider ) ) );

		self::assertSame( array(), $resolver->fields( new ObjectRef( ObjectRef::TYPE_POST, 0 ), Formatter::KIND_IMAGE ) );
	}

	public function test_image_from_url_and_invalid_ids(): void {
		Functions\when( 'wp_attachment_is_image' )->justReturn( false );

		self::assertSame( 'https://example.org/a.png', Formatter::image( 'https://example.org/a.png' )['url'] ?? null );
		self::assertNull( Formatter::image( 'data:image/png;base64,xx' ) );
		self::assertNull( Formatter::image( 7 ) );
		self::assertNull( Formatter::image( '7' ) );
		self::assertNull( Formatter::image( -1 ) );
		self::assertNull( Formatter::image( null ) );
	}
}
