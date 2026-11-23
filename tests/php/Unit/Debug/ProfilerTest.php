<?php
/**
 * Tests für den Profiler.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Debug;

use Cf65\Blocks\Debug\NullProfiler;
use Cf65\Blocks\Debug\Profiler;
use Cf65\Blocks\Tests\Unit\TestCase;

final class ProfilerTest extends TestCase {

	private int $now = 0;

	private int $queries = 0;

	private function profiler(): Profiler {
		return new Profiler(
			fn (): int => $this->now,
			fn (): int => $this->queries
		);
	}

	/** Zeit in Millisekunden vorstellen. */
	private function tick( float $ms ): void {
		$this->now += (int) ( $ms * 1e6 );
	}

	public function test_nested_blocks_are_inclusive_and_total_counts_outermost_only(): void {
		$p = $this->profiler();

		$p->begin_block( 'cf65/columns' );
		$this->tick( 1 );
		$p->begin_block( 'cf65/column' );
		$this->tick( 2 );
		++$this->queries;
		$p->end_block( 'cf65/column' );
		$p->begin_block( 'cf65/column' );
		$this->tick( 3 );
		$p->end_block( 'cf65/column' );
		$this->tick( 1 );
		$p->end_block( 'cf65/columns' );

		$report = $p->report();

		self::assertSame( 3, $report['count'] );
		self::assertEqualsWithDelta( 7.0, $report['total_ms'], 1e-9 );
		self::assertSame( 1, $report['queries'] );
		self::assertSame( 2, $report['blocks']['cf65/column']['count'] );
		self::assertEqualsWithDelta( 5.0, $report['blocks']['cf65/column']['total_ms'], 1e-9 );
		self::assertEqualsWithDelta( 3.0, $report['blocks']['cf65/column']['max_ms'], 1e-9 );
		self::assertSame( 'cf65/columns', \array_key_first( $report['blocks'] ), 'nach Gesamtzeit sortiert' );
		self::assertSame( 'cf65/columns', $report['slowest'][0]['name'] );
		self::assertSame( 0, $report['slowest'][0]['depth'] );
		self::assertSame( 1, $report['slowest'][1]['depth'] );
	}

	public function test_unfinished_inner_block_is_discarded(): void {
		$p = $this->profiler();

		$p->begin_block( 'cf65/columns' );
		$p->begin_block( 'cf65/text' ); // kein Ende (kurzgeschlossen)
		$this->tick( 4 );
		$p->end_block( 'cf65/columns' );

		$report = $p->report();
		self::assertSame( 1, $report['count'] );
		self::assertArrayNotHasKey( 'cf65/text', $report['blocks'] );
		self::assertEqualsWithDelta( 4.0, $report['total_ms'], 1e-9 );
	}

	public function test_end_without_begin_is_ignored(): void {
		$p = $this->profiler();
		$p->begin_block( 'cf65/columns' );
		$p->end_block( 'cf65/text' );
		$this->tick( 2 );
		$p->end_block( 'cf65/columns' );

		self::assertSame( 1, $p->report()['count'] );
		self::assertEqualsWithDelta( 2.0, $p->report()['total_ms'], 1e-9 );
	}

	public function test_metrics_are_summed(): void {
		$p = $this->profiler();
		$p->record( 'css', 0.5, 100 );
		$p->record( 'css', 0.25, 20 );

		self::assertSame(
			array(
				'count' => 2,
				'ms'    => 0.75,
				'bytes' => 120,
			),
			$p->report()['metrics']['css']
		);
	}

	public function test_null_profiler_is_disabled_and_empty(): void {
		$p = new NullProfiler();
		$p->begin_block( 'cf65/text' );
		$p->end_block( 'cf65/text' );
		$p->record( 'css', 1.0, 10 );

		self::assertFalse( $p->enabled() );
		self::assertSame( 0, $p->report()['count'] );
		self::assertSame( array(), $p->report()['metrics'] );
	}
}
