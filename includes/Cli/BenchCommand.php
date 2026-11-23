<?php
/**
 * WP-CLI: Benchmark für das Rendering eines Beitrags (UMSETZPLAN Kap. 8.4).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Cli;

use Cf65\Blocks\Debug\BlockTimer;
use Cf65\Blocks\Debug\Profiler;
use Cf65\Blocks\Debug\Profiling;
use Cf65\Blocks\Debug\Stats;

/**
 * Misst cf65-Blöcke beim Rendern eines Beitrags.
 */
final class BenchCommand {

	private const MAX_RUNS = 1000;

	/**
	 * Rendert den Inhalt eines Beitrags mehrfach und gibt Mittelwert und p95
	 * pro Blocktyp sowie Queries und Speicher aus.
	 *
	 * ## OPTIONS
	 *
	 * <post-id>
	 * : ID des Beitrags.
	 *
	 * [--runs=<runs>]
	 * : Anzahl Durchläufe.
	 * ---
	 * default: 20
	 * ---
	 *
	 * [--format=<format>]
	 * : Ausgabeformat.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 *   - csv
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp cf65 bench 42 --runs=50
	 *     wp cf65 bench 42 --format=json --user=1
	 *
	 * @param array<int, string>    $args       Positionsargumente.
	 * @param array<string, string> $assoc_args Optionen.
	 */
	public function bench( array $args, array $assoc_args ): void {
		$post_id = \absint( $args[0] ?? 0 );
		$post    = $post_id > 0 ? \get_post( $post_id ) : null;
		if ( ! $post instanceof \WP_Post ) {
			\WP_CLI::error( \sprintf( 'Beitrag %d nicht gefunden.', $post_id ) );
		}

		$runs = \max( 1, \min( self::MAX_RUNS, \absint( $assoc_args['runs'] ?? 20 ) ) );

		$GLOBALS['post'] = $post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Render-Kontext wie im Loop.
		\setup_postdata( $post );

		$timer = new BlockTimer();
		$timer->register();

		/** @var array<string, list<float>> $per_block */
		$per_block = array();
		$totals    = array();
		$queries   = array();
		$memory    = 0;

		try {
			for ( $i = 0; $i < $runs; $i++ ) {
				$profiler = new Profiler();
				Profiling::set( $profiler );

				$start = \hrtime( true );
				\do_blocks( $post->post_content );
				$totals[] = ( \hrtime( true ) - $start ) / 1e6;

				$report    = $profiler->report();
				$queries[] = $report['queries'];
				$memory    = \max( $memory, $report['memory_peak'] );
				foreach ( $report['blocks'] as $name => $entry ) {
					$per_block[ $name ][] = $entry['total_ms'];
				}
			}
		} finally {
			$timer->unregister();
			Profiling::set( null );
			\wp_reset_postdata();
		}

		$rows = self::rows( $per_block, $totals, $queries, $runs );

		\WP_CLI\Utils\format_items(
			$assoc_args['format'] ?? 'table',
			$rows,
			array( 'block', 'runs', 'mean_ms', 'p95_ms', 'queries' )
		);
		if ( 'table' === ( $assoc_args['format'] ?? 'table' ) ) {
			\WP_CLI::log( \sprintf( 'Speicher (Spitze): %s', Stats::bytes( $memory ) ) );
		}
	}

	/**
	 * Ergebniszeilen: pro Blocktyp (inklusive Kinder) plus Gesamtzeile.
	 *
	 * @param array<string, list<float>> $per_block Zeiten pro Blocktyp und Lauf.
	 * @param array<int, float>          $totals    Gesamtzeit do_blocks pro Lauf.
	 * @param array<int, int>            $queries   Queries in cf65-Blöcken pro Lauf.
	 * @param int                        $runs      Anzahl Läufe.
	 * @return list<array{block: string, runs: int, mean_ms: string, p95_ms: string, queries: string}>
	 */
	public static function rows( array $per_block, array $totals, array $queries, int $runs ): array {
		\ksort( $per_block );
		$rows = array();
		foreach ( $per_block as $name => $values ) {
			$rows[] = array(
				'block'   => $name,
				'runs'    => \count( $values ),
				'mean_ms' => Stats::ms( Stats::mean( $values ) ),
				'p95_ms'  => Stats::ms( Stats::percentile( $values, 95 ) ),
				'queries' => '',
			);
		}
		$rows[] = array(
			'block'   => '(gesamt do_blocks)',
			'runs'    => $runs,
			'mean_ms' => Stats::ms( Stats::mean( $totals ) ),
			'p95_ms'  => Stats::ms( Stats::percentile( $totals, 95 ) ),
			'queries' => \sprintf( '%.1F', Stats::mean( $queries ) ),
		);
		return $rows;
	}
}
