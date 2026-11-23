<?php
/**
 * No-Op-Profiler für den Normalbetrieb: keine Timer, kein Speicher.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

/**
 * Tut nichts.
 */
final class NullProfiler implements ProfilerInterface {

	/**
	 * {@inheritDoc}
	 */
	public function enabled(): bool {
		return false;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param string $name Blockname.
	 */
	public function begin_block( string $name ): void {}

	/**
	 * {@inheritDoc}
	 *
	 * @param string $name Blockname.
	 */
	public function end_block( string $name ): void {}

	/**
	 * {@inheritDoc}
	 *
	 * @param string $metric Kennzahl.
	 * @param float  $ms     Dauer.
	 * @param int    $bytes  Bytes.
	 */
	public function record( string $metric, float $ms, int $bytes = 0 ): void {}

	/**
	 * {@inheritDoc}
	 */
	public function report(): array {
		return array(
			'count'       => 0,
			'total_ms'    => 0.0,
			'queries'     => 0,
			'blocks'      => array(),
			'slowest'     => array(),
			'metrics'     => array(),
			'memory_peak' => 0,
		);
	}
}
