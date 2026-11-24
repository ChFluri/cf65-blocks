<?php
/**
 * Tests für Inline-Platzhalter: Ersetzung, Text-Formatter, Rekursionsschutz.
 *
 * Das Finden der Bereiche (InlineScanner, WP_HTML_Tag_Processor) prüfen die E2E-Tests.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Dynamic;

use Brain\Monkey\Functions;
use Cf65\Blocks\Dynamic\Binding;
use Cf65\Blocks\Dynamic\DynamicRegistry;
use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\Formatter;
use Cf65\Blocks\Dynamic\InlineReplacer;
use Cf65\Blocks\Dynamic\ObjectRef;
use Cf65\Blocks\Dynamic\Providers\ProviderInterface;
use Cf65\Blocks\Dynamic\Resolver;
use Cf65\Blocks\Dynamic\Sources\CurrentPostSource;
use Cf65\Blocks\Tests\Unit\TestCase;

final class InlineTest extends TestCase {

	private const TITLE = array(
		'source'   => 'current-post',
		'provider' => 'core',
		'field'    => 'title',
	);

	protected function setUp(): void {
		parent::setUp();
		Functions\when( 'esc_html' )->alias( static fn ( string $text ): string => \htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ) );
		Functions\when( 'wp_strip_all_tags' )->alias( 'strip_tags' );
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
	}

	/**
	 * Bereich des Platzhalterinhalts in einem HTML-Schnipsel.
	 *
	 * @param string               $html    HTML.
	 * @param string               $inner   Inhalt des Platzhalters.
	 * @param array<string, mixed> $binding Bindung.
	 * @return array{start: int, end: int, binding: array<string, mixed>}
	 */
	private static function token( string $html, string $inner, array $binding = self::TITLE ): array {
		$start = \strpos( $html, '>' . $inner . '</span>' );
		self::assertIsInt( $start );
		return array(
			'start'   => $start + 1,
			'end'     => $start + 1 + \strlen( $inner ),
			'binding' => $binding,
		);
	}

	public function test_placeholders_are_replaced_and_escaped(): void {
		$html   = '<p>Neu: <span class="cf65-dynamic">Titel</span> von <span class="cf65-dynamic">Autor</span></p>';
		$tokens = array(
			self::token( $html, 'Titel' ),
			self::token( $html, 'Autor', array( 'field' => 'author' ) + self::TITLE ),
		);

		$result = InlineReplacer::replace(
			$html,
			$tokens,
			static fn ( Binding $binding ): ?string => 'title' === $binding->field ? 'Tom & <Jerry>' : 'Anna'
		);

		self::assertSame( '<p>Neu: <span class="cf65-dynamic">Tom &amp; &lt;Jerry&gt;</span> von <span class="cf65-dynamic">Anna</span></p>', $result );
	}

	public function test_missing_values_and_invalid_bindings_empty_the_placeholder(): void {
		$html   = '<p><span class="cf65-dynamic"><strong>Titel</strong></span>|<span class="cf65-dynamic">X</span></p>';
		$tokens = array(
			self::token( $html, '<strong>Titel</strong>' ),
			self::token( $html, 'X', array( 'source' => '<script>' ) + self::TITLE ),
		);

		$calls  = 0;
		$result = InlineReplacer::replace(
			$html,
			$tokens,
			static function () use ( &$calls ): ?string {
				++$calls;
				return null;
			}
		);

		self::assertSame( '<p><span class="cf65-dynamic"></span>|<span class="cf65-dynamic"></span></p>', $result );
		self::assertSame( 1, $calls );
	}

	public function test_overlapping_or_out_of_range_tokens_are_skipped(): void {
		$html = '<p><span class="cf65-dynamic">abc</span></p>';

		$result = InlineReplacer::replace(
			$html,
			array(
				array(
					'start'   => 5,
					'end'     => 999,
					'binding' => self::TITLE,
				),
				array(
					'start'   => 10,
					'end'     => 4,
					'binding' => self::TITLE,
				),
			),
			static fn (): string => 'X'
		);

		self::assertSame( $html, $result );
	}

	public function test_has_tokens(): void {
		self::assertTrue( InlineReplacer::has_tokens( '<span class="cf65-dynamic">x</span>' ) );
		self::assertFalse( InlineReplacer::has_tokens( '<p>x</p>' ) );
	}

	public function test_text_formatter(): void {
		self::assertSame( 'Tom’s & Jerry', Formatter::text( 'Tom&#8217;s &amp; <em>Jerry</em> ' ) );
		self::assertSame( '42', Formatter::text( 42 ) );
		self::assertSame( 'ab', Formatter::text( "a\0b" ) );
		self::assertNull( Formatter::text( '   ' ) );
		self::assertNull( Formatter::text( array( 'x' ) ) );
		self::assertNull( Formatter::text( null ) );
		self::assertSame( 10000, \strlen( (string) Formatter::text( \str_repeat( 'a', 20000 ) ) ) );
		self::assertSame( 10000, \preg_match_all( '/./su', (string) Formatter::text( \str_repeat( 'ä', 20000 ) ) ) );
	}

	public function test_text_kind_accepts_text_and_url_fields(): void {
		self::assertTrue( Formatter::accepts( Formatter::KIND_TEXT, Field::TYPE_TEXT ) );
		self::assertTrue( Formatter::accepts( Formatter::KIND_TEXT, Field::TYPE_URL ) );
		self::assertFalse( Formatter::accepts( Formatter::KIND_TEXT, Field::TYPE_IMAGE ) );
	}

	public function test_recursive_resolution_returns_null(): void {
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
			public ?Resolver $resolver = null;

			public function id(): string {
				return 'loop';
			}

			public function label(): string {
				return 'Loop';
			}

			public function is_available(): bool {
				return true;
			}

			public function fields( ObjectRef $ref ): array {
				return array( new Field( 'excerpt', 'Auszug', Field::TYPE_TEXT ) );
			}

			public function value( ObjectRef $ref, Field $field, array $args ): mixed {
				// Simuliert einen Auszug, der den Inhalt (mit demselben Platzhalter) rendert.
				$binding = Binding::from_array(
					array(
						'source'   => 'current-post',
						'provider' => 'loop',
						'field'    => 'excerpt',
					)
				);
				$inner   = null !== $binding ? $this->resolver?->resolve( $binding, array( 'postId' => $ref->id ), Formatter::KIND_TEXT ) : null;
				return 'Auszug[' . ( \is_string( $inner ) ? $inner : '' ) . ']';
			}
		};
		$resolver           = new Resolver( new DynamicRegistry( array( new CurrentPostSource() ), array( $provider ) ) );
		$provider->resolver = $resolver;

		$binding = Binding::from_array(
			array(
				'source'   => 'current-post',
				'provider' => 'loop',
				'field'    => 'excerpt',
			)
		);
		self::assertNotNull( $binding );
		self::assertSame( 'Auszug[]', $resolver->resolve( $binding, array( 'postId' => 3 ), Formatter::KIND_TEXT ) );
	}
}
