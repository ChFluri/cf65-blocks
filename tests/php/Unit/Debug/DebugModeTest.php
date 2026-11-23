<?php
/**
 * Tests für Debug-Modus, Ausgabe und Statistik.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Debug;

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use Cf65\Blocks\Cli\BenchCommand;
use Cf65\Blocks\Debug\BlockTimer;
use Cf65\Blocks\Debug\DebugMode;
use Cf65\Blocks\Debug\Profiler;
use Cf65\Blocks\Debug\Profiling;
use Cf65\Blocks\Debug\Stats;
use Cf65\Blocks\Tests\Unit\TestCase;

final class DebugModeTest extends TestCase {

	protected function tearDown(): void {
		Profiling::set( null );
		parent::tearDown();
	}

	private const REPORT = array(
		'count'       => 3,
		'total_ms'    => 12.345,
		'queries'     => 2,
		'blocks'      => array(),
		'slowest'     => array(
			array(
				'name'  => 'cf65/columns',
				'ms'    => 9.5,
				'depth' => 0,
			),
		),
		'metrics'     => array(
			'css' => array(
				'count' => 3,
				'ms'    => 0.8,
				'bytes' => 512,
			),
		),
		'memory_peak' => 2097152,
	);

	public function test_disabled_by_default(): void {
		Functions\when( 'get_option' )->justReturn( false );
		self::assertFalse( DebugMode::is_enabled() );
	}

	public function test_enabled_by_option(): void {
		Functions\when( 'get_option' )->justReturn( '1' );
		self::assertTrue( DebugMode::is_enabled() );
	}

	public function test_filter_wins(): void {
		Functions\when( 'get_option' )->justReturn( '1' );
		Filters\expectApplied( 'cf65_blocks/debug_enabled' )->once()->with( true )->andReturn( false );
		self::assertFalse( DebugMode::is_enabled() );
	}

	public function test_not_active_without_capability(): void {
		Functions\when( 'get_option' )->justReturn( '1' );
		Functions\expect( 'current_user_can' )->once()->with( 'manage_options' )->andReturn( false );

		self::assertFalse( DebugMode::is_active_for_current_user() );
	}

	public function test_maybe_start_keeps_null_profiler_for_visitors(): void {
		Functions\when( 'get_option' )->justReturn( '1' );
		Functions\when( 'current_user_can' )->justReturn( false );
		Functions\expect( 'add_filter' )->never();

		( new DebugMode() )->maybe_start();

		self::assertFalse( Profiling::get()->enabled() );
	}

	public function test_maybe_start_enables_profiler_for_admins(): void {
		Functions\when( 'get_option' )->justReturn( '1' );
		Functions\when( 'current_user_can' )->justReturn( true );
		Functions\when( 'add_filter' )->justReturn( true );
		Functions\when( 'add_action' )->justReturn( true );

		( new DebugMode() )->maybe_start();

		self::assertTrue( Profiling::get()->enabled() );
	}

	public function test_server_timing_header(): void {
		self::assertSame(
			'cf65-render;dur=12.35;desc="cf65 blocks: 3", cf65-css;dur=0.80;desc="css: 512 B", cf65-queries;desc="queries: 2"',
			DebugMode::server_timing( self::REPORT )
		);
	}

	public function test_server_timing_with_empty_report(): void {
		self::assertSame(
			'cf65-render;dur=0.00;desc="cf65 blocks: 0", cf65-css;dur=0.00;desc="css: 0 B", cf65-queries;desc="queries: 0"',
			DebugMode::server_timing( array() )
		);
	}

	public function test_admin_bar_nodes_are_escaped(): void {
		Functions\when( '__' )->returnArg();
		Functions\when( 'esc_html' )->alias( static fn ( string $text ): string => \htmlspecialchars( $text, ENT_QUOTES ) );

		$report                       = self::REPORT;
		$report['slowest'][0]['name'] = 'cf65/<script>';
		$nodes                        = DebugMode::admin_bar_nodes( $report );

		self::assertSame( DebugMode::NODE, $nodes[0]['id'] );
		self::assertSame( 'cf65 Performance: 12.35 ms', $nodes[0]['title'] );
		self::assertCount( 6, $nodes );
		self::assertStringContainsString( '&lt;script&gt;', $nodes[5]['title'] );
		self::assertStringContainsString( '2.0 MB', $nodes[4]['title'] );
	}

	public function test_block_timer_measures_only_own_blocks(): void {
		$profiler = new Profiler();
		Profiling::set( $profiler );
		$timer = new BlockTimer();

		self::assertNull( $timer->before( null, array( 'blockName' => 'core/paragraph' ) ) );
		self::assertSame( 'x', $timer->after( 'x', array( 'blockName' => 'core/paragraph' ) ) );
		$timer->before( null, array( 'blockName' => 'cf65/text' ) );
		$timer->after( '<p></p>', array( 'blockName' => 'cf65/text' ) );
		// Kurzgeschlossener Block (pre_render gesetzt) wird nicht gemessen.
		self::assertSame( 'pre', $timer->before( 'pre', array( 'blockName' => 'cf65/heading' ) ) );

		$report = $profiler->report();
		self::assertSame( 1, $report['count'] );
		self::assertSame( array( 'cf65/text' ), \array_keys( $report['blocks'] ) );
	}

	public function test_stats(): void {
		self::assertSame( 0.0, Stats::mean( array() ) );
		self::assertSame( 2.0, Stats::mean( array( 1, 2, 3 ) ) );
		self::assertSame( 0.0, Stats::percentile( array(), 95 ) );
		self::assertSame( 95.0, Stats::percentile( \range( 1, 100 ), 95 ) );
		self::assertSame( 5.0, Stats::percentile( array( 5, 1, 3 ), 100 ) );
		self::assertSame( 1.0, Stats::percentile( array( 5, 1, 3 ), 0 ) );
		self::assertSame( '1.50', Stats::ms( 1.499 ) );
		self::assertSame( '512 B', Stats::bytes( 512 ) );
		self::assertSame( '1.5 KB', Stats::bytes( 1536 ) );
	}

	public function test_bench_rows(): void {
		$rows = BenchCommand::rows(
			array(
				'cf65/text'    => array( 1.0, 3.0 ),
				'cf65/columns' => array( 2.0, 2.0 ),
			),
			array( 4.0, 6.0 ),
			array( 1, 2 ),
			2
		);

		self::assertSame( array( 'cf65/columns', 'cf65/text', '(gesamt do_blocks)' ), \array_column( $rows, 'block' ) );
		self::assertSame( '2.00', $rows[1]['mean_ms'] );
		self::assertSame( '3.00', $rows[1]['p95_ms'] );
		self::assertSame( '5.00', $rows[2]['mean_ms'] );
		self::assertSame( '1.5', $rows[2]['queries'] );
	}
}
