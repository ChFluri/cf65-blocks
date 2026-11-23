<?php
/**
 * Zugriff auf den aktiven Profiler.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

/**
 * Hält den Profiler der aktuellen Anfrage (Standard: No-Op).
 */
final class Profiling {

	/**
	 * Aktiver Profiler.
	 *
	 * @var ProfilerInterface|null
	 */
	private static ?ProfilerInterface $profiler = null;

	/**
	 * Aktiver Profiler (No-Op, solange der Debug-Modus nicht aktiv ist).
	 */
	public static function get(): ProfilerInterface {
		return self::$profiler ??= new NullProfiler();
	}

	/**
	 * Setzt den Profiler (null → No-Op).
	 *
	 * @param ProfilerInterface|null $profiler Profiler.
	 */
	public static function set( ?ProfilerInterface $profiler ): void {
		self::$profiler = $profiler;
	}
}
