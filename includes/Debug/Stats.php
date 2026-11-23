<?php
/**
 * Kleine Statistik-Helfer für Berichte und Benchmark.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

/**
 * Mittelwert, Perzentil, Formatierung.
 */
final class Stats {

	/**
	 * Arithmetisches Mittel.
	 *
	 * @param array<int, float|int> $values Werte.
	 */
	public static function mean( array $values ): float {
		return array() === $values ? 0.0 : \array_sum( $values ) / \count( $values );
	}

	/**
	 * Perzentil nach Nearest-Rank-Methode.
	 *
	 * @param array<int, float|int> $values     Werte.
	 * @param float                 $percentile 0–100.
	 */
	public static function percentile( array $values, float $percentile ): float {
		if ( array() === $values ) {
			return 0.0;
		}
		\sort( $values );
		$rank = (int) \ceil( \max( 0.0, \min( 100.0, $percentile ) ) / 100 * \count( $values ) );
		return (float) $values[ \max( 0, $rank - 1 ) ];
	}

	/**
	 * Millisekunden mit zwei Nachkommastellen (Punkt als Trenner).
	 *
	 * @param float $ms Millisekunden.
	 */
	public static function ms( float $ms ): string {
		return \sprintf( '%.2F', $ms );
	}

	/**
	 * Bytes lesbar (B, KB, MB).
	 *
	 * @param int $bytes Bytes.
	 */
	public static function bytes( int $bytes ): string {
		if ( $bytes < 1024 ) {
			return $bytes . ' B';
		}
		if ( $bytes < 1048576 ) {
			return \sprintf( '%.1F KB', $bytes / 1024 );
		}
		return \sprintf( '%.1F MB', $bytes / 1048576 );
	}
}
