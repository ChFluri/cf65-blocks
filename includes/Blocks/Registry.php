<?php
/**
 * Registrierung der Blöcke und Editor-Assets.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Blocks;

/**
 * Registriert alle Blöcke aus `build/` über das Block-Manifest.
 */
final class Registry {

	public const CATEGORY = 'cf65-blocks';

	public const BLOCK_PREFIX = 'cf65/';

	/**
	 * Konstruktor.
	 *
	 * @param string $plugin_dir Absoluter Pfad zum Plugin-Verzeichnis.
	 */
	public function __construct( private readonly string $plugin_dir ) {}

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_action( 'init', array( $this, 'register_blocks' ) );
		\add_filter( 'block_categories_all', array( $this, 'register_category' ), 10, 1 );
		\add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
	}

	/**
	 * Blöcke registrieren (WP 6.7: Metadata-Collection, ab 6.8 Sammelregistrierung).
	 */
	public function register_blocks(): void {
		$build    = $this->plugin_dir . '/build/blocks';
		$manifest = $build . '/blocks-manifest.php';

		if ( ! \is_readable( $manifest ) ) {
			return;
		}

		if ( \function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
			\wp_register_block_types_from_metadata_collection( $build, $manifest );
			return;
		}

		\wp_register_block_metadata_collection( $build, $manifest );

		/** @var array<string, array<string, mixed>> $blocks */
		$blocks = require $manifest;
		foreach ( \array_keys( $blocks ) as $block_dir ) {
			\register_block_type( $build . '/' . $block_dir );
		}
	}

	/**
	 * Eigene Block-Kategorie an erster Stelle.
	 *
	 * @param array<int, array<string, mixed>> $categories Vorhandene Kategorien.
	 * @return array<int, array<string, mixed>>
	 */
	public function register_category( array $categories ): array {
		\array_unshift(
			$categories,
			array(
				'slug'  => self::CATEGORY,
				'title' => \__( 'cf65 Blocks', 'cf65-blocks' ),
				'icon'  => null,
			)
		);
		return $categories;
	}

	/**
	 * Gemeinsames Editor-Skript (Extensions, Stores, Formate).
	 */
	public function enqueue_editor_assets(): void {
		$asset_file = $this->plugin_dir . '/build/editor/index.asset.php';
		if ( ! \is_readable( $asset_file ) ) {
			return;
		}

		/** @var array{dependencies: list<non-empty-string>, version: string} $asset */
		$asset = require $asset_file;

		\wp_enqueue_script(
			'cf65-blocks-editor',
			\plugins_url( 'build/editor/index.js', $this->plugin_dir . '/cf65-blocks.php' ),
			$asset['dependencies'],
			$asset['version'],
			array( 'in_footer' => true )
		);
		\wp_set_script_translations( 'cf65-blocks-editor', 'cf65-blocks', $this->plugin_dir . '/languages' );
		\wp_add_inline_script(
			'cf65-blocks-editor',
			'window.cf65BlocksConfig = ' . \wp_json_encode( $this->editor_config(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES ) . ';',
			'before'
		);
	}

	/**
	 * Konfiguration für das Editor-Skript.
	 *
	 * @return array{autoRecovery: bool}
	 */
	public function editor_config(): array {
		/**
		 * Automatische Reparatur ungültiger cf65-Blöcke im Editor (Kap. 2.2, Schicht 4).
		 *
		 * @param bool $enabled Standard: true.
		 */
		$auto_recovery = \apply_filters( 'cf65_blocks/auto_recovery', true );

		return array(
			'autoRecovery' => (bool) $auto_recovery,
		);
	}
}
