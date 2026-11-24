<?php
/**
 * Minimale ACF-Stubs für PHPStan (nur die genutzten Funktionen).
 *
 * @package Cf65\Blocks\Tests
 */

// phpcs:ignoreFile -- Stubs.

/**
 * @param array<string, mixed> $filter Filter (z. B. post_type).
 * @return list<array<string, mixed>>
 */
function acf_get_field_groups( $filter = array() ) {
	return array();
}

/**
 * @param array<string, mixed>|string|int $parent Feldgruppe.
 * @return list<array<string, mixed>>|false
 */
function acf_get_fields( $parent ) {
	return array();
}

/**
 * @param string          $selector     Feldname oder -key.
 * @param int|string|bool $post_id      Objekt.
 * @param bool            $format_value Formatieren.
 * @param bool            $escape_html  Escapen.
 * @return mixed
 */
function get_field( $selector, $post_id = false, $format_value = true, $escape_html = false ) {
	return null;
}
