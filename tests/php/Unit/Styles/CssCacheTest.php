<?php
/**
 * Tests für den CSS-Cache (Post-Meta).
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Styles;

use Brain\Monkey\Actions;
use Brain\Monkey\Functions;
use Cf65\Blocks\Debug\Profiler;
use Cf65\Blocks\Debug\Profiling;
use Cf65\Blocks\Styles\CssCache;
use Cf65\Blocks\Styles\CssGenerator;
use Cf65\Blocks\Styles\StyleRenderer;
use Cf65\Blocks\Tests\Unit\TestCase;

final class CssCacheTest extends TestCase {

	private const MAP = array(
		array(
			'attr'     => 'textColor',
			'property' => 'color',
			'type'     => 'color',
		),
	);

	private const ATTRS = array(
		'uniqueId'  => 'abcd1234',
		'textColor' => '#ff0000',
	);

	protected function tearDown(): void {
		Profiling::set( null );
		parent::tearDown();
	}

	private static function blocks(): array {
		return array(
			array(
				'blockName'   => 'cf65/columns',
				'attrs'       => array( 'uniqueId' => 'c0l5abcd' ),
				'innerBlocks' => array(
					array(
						'blockName'   => 'cf65/heading',
						'attrs'       => self::ATTRS,
						'innerBlocks' => array(),
					),
					array(
						'blockName'   => 'core/paragraph',
						'attrs'       => array(),
						'innerBlocks' => array(),
					),
				),
			),
		);
	}

	private static function compute(): \Closure {
		return static fn ( string $name, array $attrs ): string => 'cf65/heading' === $name ? '.cf65-' . $attrs['uniqueId'] . '{color:red}' : '';
	}

	public function test_build_stores_css_of_all_cf65_blocks(): void {
		Functions\when( 'add_action' )->justReturn( true );
		Functions\when( 'parse_blocks' )->justReturn( self::blocks() );
		Functions\when( 'wp_slash' )->returnArg();
		Functions\expect( 'update_post_meta' )->once()->with(
			7,
			CssCache::META_KEY,
			array(
				'v'   => CssCache::stamp(),
				'css' => array(
					CssCache::key( 'cf65/columns', array( 'uniqueId' => 'c0l5abcd' ) ) => '',
					CssCache::key( 'cf65/heading', self::ATTRS ) => '.cf65-abcd1234{color:red}',
				),
			)
		);

		$cache = new CssCache();
		$cache->register_hooks( self::compute() );
		$cache->build( 7, '<!-- wp:cf65/columns -->' );

		self::assertTrue( true );
	}

	public function test_build_without_cf65_blocks_deletes_meta(): void {
		Functions\when( 'add_action' )->justReturn( true );
		Functions\expect( 'parse_blocks' )->never();
		Functions\expect( 'delete_post_meta' )->once()->with( 7, CssCache::META_KEY );

		$cache = new CssCache();
		$cache->register_hooks( self::compute() );
		$cache->build( 7, '<!-- wp:paragraph --><p>x</p><!-- /wp:paragraph -->' );

		self::assertTrue( true );
	}

	public function test_revisions_and_autosaves_are_skipped(): void {
		Functions\when( 'add_action' )->justReturn( true );
		Functions\when( 'wp_is_post_revision' )->justReturn( 3 );
		Functions\when( 'wp_is_post_autosave' )->justReturn( false );
		Functions\expect( 'update_post_meta' )->never();
		Functions\expect( 'delete_post_meta' )->never();

		$cache = new CssCache();
		$cache->register_hooks( self::compute() );
		$post               = \Mockery::mock( \WP_Post::class );
		$post->post_content = '<!-- wp:cf65/heading -->';
		$cache->on_save( 7, $post );

		self::assertTrue( true );
	}

	public function test_get_reads_meta_once_per_post_and_validates_entries(): void {
		$key = CssCache::key( 'cf65/heading', self::ATTRS );
		Functions\expect( 'get_post_meta' )->once()->with( 7, CssCache::META_KEY, true )->andReturn(
			array(
				'v'   => CssCache::stamp(),
				'css' => array(
					$key                                => '.cf65-abcd1234{color:red}',
					\md5( 'x' )                         => '</style><script>',
					'kein-hash'                         => '.a{}',
					\md5( 'y' )                         => array( 'kein String' ),
				),
			)
		);

		$cache = new CssCache( static fn (): int => 7 );

		self::assertSame( '.cf65-abcd1234{color:red}', $cache->get( $key ) );
		self::assertNull( $cache->get( \md5( 'x' ) ), 'Eintrag mit < wird verworfen' );
		self::assertNull( $cache->get( 'kein-hash' ) );
		self::assertNull( $cache->get( \md5( 'y' ) ) );
	}

	public function test_stale_version_is_ignored(): void {
		Functions\when( 'get_post_meta' )->justReturn(
			array(
				'v'   => '0.0.1|1',
				'css' => array( \md5( 'a' ) => '.a{}' ),
			)
		);

		self::assertNull( ( new CssCache( static fn (): int => 7 ) )->get( \md5( 'a' ) ) );
	}

	public function test_no_post_context_means_no_lookup(): void {
		Functions\expect( 'get_post_meta' )->never();

		self::assertNull( ( new CssCache( static fn (): bool => false ) )->get( \md5( 'a' ) ) );
	}

	public function test_renderer_uses_cache_hit_and_records_metric(): void {
		$profiler = new Profiler();
		Profiling::set( $profiler );
		Functions\when( 'get_post_meta' )->justReturn(
			array(
				'v'   => CssCache::stamp(),
				'css' => array( CssCache::key( 'cf65/heading', self::ATTRS ) => '.cf65-abcd1234{color:#00f}' ),
			)
		);
		Functions\when( 'wp_style_is' )->justReturn( true );
		Functions\when( 'wp_enqueue_style' )->justReturn( true );
		// Der Wert aus dem Cache (blau) wird ausgegeben, nicht neu berechnet (rot).
		Functions\expect( 'wp_add_inline_style' )->once()->with( StyleRenderer::HANDLE, '.cf65-abcd1234{color:#00f}' );

		$renderer = new StyleRenderer(
			new CssGenerator(),
			static fn (): array => self::MAP,
			new CssCache( static fn (): int => 7 )
		);
		$renderer->render(
			'',
			array(
				'blockName' => 'cf65/heading',
				'attrs'     => self::ATTRS,
			)
		);

		$metrics = $profiler->report()['metrics'];
		self::assertSame( 1, $metrics['css_cache']['count'] );
		self::assertArrayNotHasKey( 'css', $metrics );
	}

	public function test_renderer_falls_back_to_generator_on_miss(): void {
		Functions\when( 'get_post_meta' )->justReturn( '' );
		Functions\when( 'wp_style_is' )->justReturn( true );
		Functions\when( 'wp_enqueue_style' )->justReturn( true );
		Functions\expect( 'wp_add_inline_style' )->once()->with( StyleRenderer::HANDLE, '.cf65-abcd1234{color:#ff0000}' );

		$renderer = new StyleRenderer(
			new CssGenerator(),
			static fn (): array => self::MAP,
			new CssCache( static fn (): int => 7 )
		);
		$renderer->render(
			'',
			array(
				'blockName' => 'cf65/heading',
				'attrs'     => self::ATTRS,
			)
		);

		self::assertTrue( true );
	}

	public function test_register_hooks_wires_cache(): void {
		Functions\when( 'add_filter' )->justReturn( true );
		Actions\expectAdded( 'wp_after_insert_post' )->once();

		( new StyleRenderer( new CssGenerator(), null, new CssCache() ) )->register_hooks();

		self::assertTrue( true );
	}
}
