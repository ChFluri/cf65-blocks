<?php
/**
 * Schnittstelle für Messungen im Debug-Modus (UMSETZPLAN Kap. 8).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

/**
 * Sammelt Laufzeitdaten. Im Normalbetrieb ist ein {@see NullProfiler} aktiv.
 */
interface ProfilerInterface {

	/**
	 * Ob gemessen wird. Aufrufer prüfen das, bevor sie Timer starten.
	 */
	public function enabled(): bool;

	/**
	 * Beginn des Renderings einer Blockinstanz.
	 *
	 * @param string $name Blockname.
	 */
	public function begin_block( string $name ): void;

	/**
	 * Ende des Renderings einer Blockinstanz.
	 *
	 * @param string $name Blockname.
	 */
	public function end_block( string $name ): void;

	/**
	 * Einzelmessung einer Kennzahl (z. B. `css`).
	 *
	 * @param string $metric Kennzahl.
	 * @param float  $ms     Dauer in Millisekunden.
	 * @param int    $bytes  Erzeugte Bytes (optional).
	 */
	public function record( string $metric, float $ms, int $bytes = 0 ): void;

	/**
	 * Zusammenfassung der bisherigen Messungen.
	 *
	 * @return array{
	 *     count: int,
	 *     total_ms: float,
	 *     queries: int,
	 *     blocks: array<string, array{count: int, total_ms: float, max_ms: float, queries: int}>,
	 *     slowest: list<array{name: string, ms: float, depth: int}>,
	 *     metrics: array<string, array{count: int, ms: float, bytes: int}>,
	 *     memory_peak: int
	 * }
	 */
	public function report(): array;
}
