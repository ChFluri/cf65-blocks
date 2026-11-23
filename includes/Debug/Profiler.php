<?php
/**
 * Profiler für den Debug-Modus.
 *
 * Zeiten mit hrtime(), Queries als Delta von `$wpdb->num_queries`. Blockzeiten
 * sind inklusiv (ein Container enthält die Zeit seiner Kinder); `total_ms`
 * summiert nur die äussersten cf65-Blöcke und zählt dadurch nichts doppelt.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

/**
 * Misst Block-Rendering und Einzelkennzahlen einer Anfrage.
 */
final class Profiler implements ProfilerInterface {

	/** Maximale Anzahl gespeicherter Einzelinstanzen (Speicherschutz). */
	private const MAX_INSTANCES = 1000;

	/** Anzahl langsamster Instanzen im Bericht. */
	private const SLOWEST = 10;

	/**
	 * Offene Blöcke (verschachtelt).
	 *
	 * @var list<array{name: string, start: int, queries: int}>
	 */
	private array $stack = array();

	/**
	 * Aggregat pro Blocktyp.
	 *
	 * @var array<string, array{count: int, total_ms: float, max_ms: float, queries: int}>
	 */
	private array $blocks = array();

	/**
	 * Einzelinstanzen.
	 *
	 * @var list<array{name: string, ms: float, depth: int}>
	 */
	private array $instances = array();

	/**
	 * Einzelkennzahlen.
	 *
	 * @var array<string, array{count: int, ms: float, bytes: int}>
	 */
	private array $metrics = array();

	/**
	 * Anzahl gemessener Blockinstanzen.
	 *
	 * @var int
	 */
	private int $count = 0;

	/**
	 * Summe der äussersten cf65-Blöcke in Millisekunden.
	 *
	 * @var float
	 */
	private float $total_ms = 0.0;

	/**
	 * DB-Queries in den äussersten cf65-Blöcken.
	 *
	 * @var int
	 */
	private int $queries = 0;

	/**
	 * Uhr in Nanosekunden.
	 *
	 * @var \Closure(): int
	 */
	private readonly \Closure $clock;

	/**
	 * Zähler der bisherigen DB-Queries.
	 *
	 * @var \Closure(): int
	 */
	private readonly \Closure $query_counter;

	/**
	 * Konstruktor.
	 *
	 * @param \Closure|null $clock         Liefert Nanosekunden (Standard: hrtime).
	 * @param \Closure|null $query_counter Liefert die bisherige Anzahl DB-Queries (Standard: $wpdb).
	 */
	public function __construct( ?\Closure $clock = null, ?\Closure $query_counter = null ) {
		$this->clock         = $clock ?? static fn (): int => (int) \hrtime( true );
		$this->query_counter = $query_counter ?? static function (): int {
			global $wpdb;
			return \is_object( $wpdb ) && isset( $wpdb->num_queries ) ? (int) $wpdb->num_queries : 0;
		};
	}

	/**
	 * {@inheritDoc}
	 */
	public function enabled(): bool {
		return true;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param string $name Blockname.
	 */
	public function begin_block( string $name ): void {
		$this->stack[] = array(
			'name'    => $name,
			'start'   => ( $this->clock )(),
			'queries' => ( $this->query_counter )(),
		);
	}

	/**
	 * {@inheritDoc}
	 *
	 * Offene Einträge oberhalb des passenden Blocks (Block ohne Ende, z. B.
	 * durch einen anderen `pre_render_block`-Filter kurzgeschlossen) werden
	 * verworfen. Ohne passenden offenen Block passiert nichts.
	 *
	 * @param string $name Blockname.
	 */
	public function end_block( string $name ): void {
		$index = null;
		for ( $i = \count( $this->stack ) - 1; $i >= 0; $i-- ) {
			if ( $this->stack[ $i ]['name'] === $name ) {
				$index = $i;
				break;
			}
		}
		if ( null === $index ) {
			return;
		}

		$frame       = $this->stack[ $index ];
		$this->stack = \array_slice( $this->stack, 0, $index );
		$ms          = ( ( $this->clock )() - $frame['start'] ) / 1e6;
		$queries     = ( $this->query_counter )() - $frame['queries'];
		$depth       = $index;

		$entry                 = $this->blocks[ $name ] ?? array(
			'count'    => 0,
			'total_ms' => 0.0,
			'max_ms'   => 0.0,
			'queries'  => 0,
		);
		$entry['count']       += 1;
		$entry['total_ms']    += $ms;
		$entry['max_ms']       = \max( $entry['max_ms'], $ms );
		$entry['queries']     += $queries;
		$this->blocks[ $name ] = $entry;

		if ( 0 === $depth ) {
			$this->total_ms += $ms;
			$this->queries  += $queries;
		}
		++$this->count;

		if ( \count( $this->instances ) < self::MAX_INSTANCES ) {
			$this->instances[] = array(
				'name'  => $name,
				'ms'    => $ms,
				'depth' => $depth,
			);
		}
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param string $metric Kennzahl.
	 * @param float  $ms     Dauer in Millisekunden.
	 * @param int    $bytes  Bytes.
	 */
	public function record( string $metric, float $ms, int $bytes = 0 ): void {
		$entry                    = $this->metrics[ $metric ] ?? array(
			'count' => 0,
			'ms'    => 0.0,
			'bytes' => 0,
		);
		$entry['count']          += 1;
		$entry['ms']             += $ms;
		$entry['bytes']          += $bytes;
		$this->metrics[ $metric ] = $entry;
	}

	/**
	 * {@inheritDoc}
	 */
	public function report(): array {
		$slowest = $this->instances;
		\usort( $slowest, static fn ( array $a, array $b ): int => $b['ms'] <=> $a['ms'] );

		$blocks = $this->blocks;
		\uasort( $blocks, static fn ( array $a, array $b ): int => $b['total_ms'] <=> $a['total_ms'] );

		return array(
			'count'       => $this->count,
			'total_ms'    => $this->total_ms,
			'queries'     => $this->queries,
			'blocks'      => $blocks,
			'slowest'     => \array_slice( $slowest, 0, self::SLOWEST ),
			'metrics'     => $this->metrics,
			'memory_peak' => \memory_get_peak_usage(),
		);
	}
}
