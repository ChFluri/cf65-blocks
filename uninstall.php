<?php
/**
 * Aufräumen bei Deinstallation.
 *
 * Entfernt nur Plugin-Optionen und Transients mit dem Präfix `cf65_blocks_`.
 * Block-Inhalte in Beiträgen bleiben erhalten (siehe Umsetzplan Kap. 2.2).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

$cf65_blocks_like = $wpdb->esc_like( 'cf65_blocks_' ) . '%';

// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- Einmalige Bereinigung, kein Cache nötig.
$cf65_blocks_options = $wpdb->get_col(
	$wpdb->prepare( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s", $cf65_blocks_like )
);

foreach ( $cf65_blocks_options as $cf65_blocks_option ) {
	delete_option( $cf65_blocks_option );
}

// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- Einmalige Bereinigung, kein Cache nötig.
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_cf65_blocks_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_cf65_blocks_' ) . '%'
	)
);
