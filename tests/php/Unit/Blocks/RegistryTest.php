<?php
/**
 * Tests für die Block-Registrierung.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Blocks;

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;
use Cf65\Blocks\Blocks\Registry;
use Cf65\Blocks\Tests\Unit\TestCase;

final class RegistryTest extends TestCase {

	public function test_category_is_prepended(): void {
		Functions\when( '__' )->returnArg();

		$categories = ( new Registry( __DIR__ ) )->register_category(
			array( array( 'slug' => 'text', 'title' => 'Text' ) )
		);

		self::assertSame( Registry::CATEGORY, $categories[0]['slug'] );
		self::assertSame( 'text', $categories[1]['slug'] );
	}

	public function test_auto_recovery_is_enabled_by_default(): void {
		Functions\when( 'get_option' )->justReturn( false );

		self::assertSame(
			array(
				'autoRecovery' => true,
				'debug'        => false,
			),
			( new Registry( __DIR__ ) )->editor_config()
		);
	}

	public function test_auto_recovery_can_be_disabled_by_filter(): void {
		Functions\when( 'get_option' )->justReturn( false );
		Filters\expectApplied( 'cf65_blocks/auto_recovery' )->once()->with( true )->andReturn( 0 );

		self::assertSame(
			array(
				'autoRecovery' => false,
				'debug'        => false,
			),
			( new Registry( __DIR__ ) )->editor_config()
		);
	}

	public function test_register_blocks_without_manifest_does_nothing(): void {
		Functions\expect( 'wp_register_block_types_from_metadata_collection' )->never();
		Functions\expect( 'register_block_type' )->never();

		( new Registry( sys_get_temp_dir() . '/cf65-does-not-exist' ) )->register_blocks();

		self::assertTrue( true );
	}
}
