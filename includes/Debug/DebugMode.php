<?php
/**
 * Debug-Modus (UMSETZPLAN Kap. 8): Aktivierung und Ausgabe.
 *
 * Aktiv, wenn `CF65_BLOCKS_DEBUG` true ist oder die Option
 * `cf65_blocks_debug` gesetzt ist (Filter `cf65_blocks/debug_enabled`).
 * Gemessen und ausgegeben wird nur für Benutzer mit `manage_options`;
 * für alle anderen bleibt der No-Op-Profiler aktiv (keine Timer, keine Hooks).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Debug;

/**
 * Schaltet den Profiler für Admins ein und gibt die Ergebnisse aus.
 */
final class DebugMode {

	public const OPTION = 'cf65_blocks_debug';

	public const CAPABILITY = 'manage_options';

	/** Admin-Bar-Knoten. */
	public const NODE = 'cf65-performance';

	/**
	 * Ausgabepuffer-Ebene, die wir geöffnet haben (null: keiner).
	 *
	 * @var int|null
	 */
	private ?int $buffer_level = null;

	/**
	 * Ob der Debug-Modus eingeschaltet ist (unabhängig vom Benutzer).
	 */
	public static function is_enabled(): bool {
		$enabled = ( \defined( 'CF65_BLOCKS_DEBUG' ) && true === \constant( 'CF65_BLOCKS_DEBUG' ) )
			|| true === (bool) \get_option( self::OPTION, false );

		/**
		 * Debug-Modus ein-/ausschalten.
		 *
		 * @param bool $enabled Aus Konstante bzw. Option.
		 */
		return (bool) \apply_filters( 'cf65_blocks/debug_enabled', $enabled );
	}

	/**
	 * Ob für die aktuelle Anfrage gemessen und ausgegeben wird.
	 */
	public static function is_active_for_current_user(): bool {
		return self::is_enabled() && \current_user_can( self::CAPABILITY );
	}

	/**
	 * Hooks registrieren (leichtgewichtig; die eigentlichen Mess-Hooks
	 * kommen erst in {@see self::maybe_start()} dazu).
	 */
	public function register_hooks(): void {
		\add_action( 'init', array( $this, 'maybe_start' ), 1 );
		\add_action( 'admin_notices', array( $this, 'production_notice' ) );
	}

	/**
	 * Startet die Messung, wenn der Modus für den Benutzer aktiv ist.
	 */
	public function maybe_start(): void {
		if ( ! self::is_active_for_current_user() ) {
			return;
		}

		Profiling::set( new Profiler() );
		( new BlockTimer() )->register();

		\add_action( 'template_redirect', array( $this, 'start_buffer' ), \PHP_INT_MAX );
		\add_action( 'shutdown', array( $this, 'flush_buffer' ), 0 );
		\add_action( 'admin_bar_menu', array( $this, 'admin_bar' ), 100 );
	}

	/**
	 * Puffert die Frontend-Ausgabe, damit der Server-Timing-Header nach dem
	 * Rendering noch gesendet werden kann (klassische Themes rendern Inhalte
	 * erst während der Ausgabe).
	 */
	public function start_buffer(): void {
		if ( \headers_sent() ) {
			return;
		}
		\ob_start();
		$this->buffer_level = \ob_get_level();
	}

	/**
	 * Sendet den Server-Timing-Header und gibt den Puffer aus. Hat ein
	 * anderes Plugin danach eigene Puffer geöffnet, bleibt alles unverändert
	 * (WordPress leert die Puffer selbst).
	 */
	public function flush_buffer(): void {
		if ( null === $this->buffer_level || \ob_get_level() !== $this->buffer_level ) {
			return;
		}
		$this->buffer_level = null;

		$html = (string) \ob_get_clean();
		if ( ! \headers_sent() ) {
			\header( 'Server-Timing: ' . self::server_timing( Profiling::get()->report() ) );
		}
		// Die eigene, bereits erzeugte Seitenausgabe – unverändert weitergeben.
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Wert für den `Server-Timing`-Header.
	 *
	 * @param array<mixed> $report Bericht des Profilers.
	 */
	public static function server_timing( array $report ): string {
		$count   = (int) ( $report['count'] ?? 0 );
		$total   = (float) ( $report['total_ms'] ?? 0.0 );
		$queries = (int) ( $report['queries'] ?? 0 );
		$css     = \is_array( $report['metrics']['css'] ?? null ) ? $report['metrics']['css'] : array();

		$parts = array(
			\sprintf( 'cf65-render;dur=%s;desc="cf65 blocks: %d"', Stats::ms( $total ), $count ),
			\sprintf(
				'cf65-css;dur=%s;desc="css: %d B"',
				Stats::ms( (float) ( $css['ms'] ?? 0.0 ) ),
				(int) ( $css['bytes'] ?? 0 )
			),
			\sprintf( 'cf65-queries;desc="queries: %d"', $queries ),
		);
		return \implode( ', ', $parts );
	}

	/**
	 * Admin-Bar-Menü „cf65 Performance“.
	 *
	 * @param \WP_Admin_Bar $admin_bar Admin-Bar.
	 */
	public function admin_bar( \WP_Admin_Bar $admin_bar ): void {
		foreach ( self::admin_bar_nodes( Profiling::get()->report() ) as $node ) {
			$admin_bar->add_node( $node );
		}
	}

	/**
	 * Knoten der Admin-Bar (Titel bereits escaped).
	 *
	 * @param array<mixed> $report Bericht des Profilers.
	 * @return list<array{id: string, title: string, parent?: string}>
	 */
	public static function admin_bar_nodes( array $report ): array {
		$css   = \is_array( $report['metrics']['css'] ?? null ) ? $report['metrics']['css'] : array();
		$total = (float) ( $report['total_ms'] ?? 0.0 );

		$nodes = array(
			array(
				'id'    => self::NODE,
				'title' => \esc_html(
					\sprintf(
						/* translators: %s: milliseconds */
						\__( 'cf65 Performance: %s ms', 'cf65-blocks' ),
						Stats::ms( $total )
					)
				),
			),
		);

		$lines = array(
			'blocks'  => \sprintf(
				/* translators: 1: number of blocks, 2: milliseconds */
				\__( 'Blöcke: %1$d (%2$s ms)', 'cf65-blocks' ),
				(int) ( $report['count'] ?? 0 ),
				Stats::ms( $total )
			),
			'css'     => \sprintf(
				/* translators: 1: milliseconds, 2: size */
				\__( 'CSS: %1$s ms, %2$s', 'cf65-blocks' ),
				Stats::ms( (float) ( $css['ms'] ?? 0.0 ) ),
				Stats::bytes( (int) ( $css['bytes'] ?? 0 ) )
			),
			'queries' => \sprintf(
				/* translators: %d: number of database queries */
				\__( 'DB-Queries in cf65-Blöcken: %d', 'cf65-blocks' ),
				(int) ( $report['queries'] ?? 0 )
			),
			'memory'  => \sprintf(
				/* translators: %s: memory size */
				\__( 'Speicher (Spitze): %s', 'cf65-blocks' ),
				Stats::bytes( (int) ( $report['memory_peak'] ?? 0 ) )
			),
		);
		foreach ( $lines as $id => $title ) {
			$nodes[] = array(
				'id'     => self::NODE . '-' . $id,
				'parent' => self::NODE,
				'title'  => \esc_html( $title ),
			);
		}

		$slowest = \is_array( $report['slowest'] ?? null ) ? \array_slice( $report['slowest'], 0, 5 ) : array();
		foreach ( $slowest as $i => $instance ) {
			if ( ! \is_array( $instance ) ) {
				continue;
			}
			$nodes[] = array(
				'id'     => self::NODE . '-slow-' . $i,
				'parent' => self::NODE,
				'title'  => \esc_html(
					\sprintf(
						/* translators: 1: block name, 2: milliseconds */
						\__( 'Langsam: %1$s – %2$s ms', 'cf65-blocks' ),
						(string) ( $instance['name'] ?? '' ),
						Stats::ms( (float) ( $instance['ms'] ?? 0.0 ) )
					)
				),
			);
		}

		return $nodes;
	}

	/**
	 * Warnung, solange der Debug-Modus auf einer Produktivumgebung aktiv ist.
	 */
	public function production_notice(): void {
		if ( 'production' !== \wp_get_environment_type() || ! self::is_active_for_current_user() ) {
			return;
		}
		\printf(
			'<div class="notice notice-warning"><p>%s</p></div>',
			\esc_html__( 'cf65 Blocks: Der Debug-Modus ist auf einer Produktivumgebung aktiv. Messwerte sind nur für Administratoren sichtbar, verursachen aber zusätzliche Last.', 'cf65-blocks' )
		);
	}
}
