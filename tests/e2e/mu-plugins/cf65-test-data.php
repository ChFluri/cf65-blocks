<?php
/**
 * Plugin Name: cf65 Testdaten
 * Description: Felder für Entwicklung und E2E-Tests (nur wp-env, nicht im Release-ZIP).
 *
 * - ACF-Feldgruppe „cf65 Test“ für Beiträge, über REST schreibbar (`acf`)
 * - Post-Meta `cf65_untertitel` (öffentlich) und `_cf65_geheim` (geschützt)
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

add_action(
	'init',
	static function (): void {
		register_post_meta(
			'post',
			'cf65_untertitel',
			array(
				'type'         => 'string',
				'single'       => true,
				'show_in_rest' => true,
				'description'  => 'Untertitel (Test)',
			)
		);
		register_post_meta(
			'post',
			'_cf65_geheim',
			array(
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => static fn (): bool => current_user_can( 'edit_posts' ),
			)
		);
	}
);

add_action(
	'acf/include_fields',
	static function (): void {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}
		$field = static fn ( string $name, string $label, string $type, array $extra = array() ): array => array(
			'key'   => 'field_cf65_' . $name,
			'name'  => $name,
			'label' => $label,
			'type'  => $type,
		) + $extra;

		acf_add_local_field_group(
			array(
				'key'          => 'group_cf65_test',
				'title'        => 'cf65 Test',
				'show_in_rest' => 1,
				'fields'       => array(
					$field( 'cf65_text', 'Text', 'text' ),
					$field( 'cf65_zahl', 'Zahl', 'number' ),
					$field( 'cf65_datum', 'Datum', 'date_picker', array( 'return_format' => 'd.m.Y' ) ),
					$field( 'cf65_webseite', 'Webseite', 'url' ),
					$field(
						'cf65_link',
						'Link',
						'link',
						array( 'return_format' => 'array' )
					),
					$field(
						'cf65_bild',
						'Bild',
						'image',
						array( 'return_format' => 'id' )
					),
					$field(
						'cf65_verwandt',
						'Verwandte Beiträge',
						'relationship',
						array(
							'post_type'     => array( 'post' ),
							'return_format' => 'id',
						)
					),
					$field(
						'cf65_aktiv',
						'Aktiv',
						'true_false'
					),
				),
				'location'     => array(
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'post',
						),
					),
				),
			)
		);
	}
);
