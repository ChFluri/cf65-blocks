<?php
/**
 * Tests für die Provider Post-Meta und ACF.
 *
 * @package Cf65\Blocks\Tests
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Tests\Unit\Dynamic;

use Brain\Monkey\Functions;
use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectRef;
use Cf65\Blocks\Dynamic\Providers\AcfProvider;
use Cf65\Blocks\Dynamic\Providers\PostMetaProvider;
use Cf65\Blocks\Tests\Unit\TestCase;

final class ProvidersTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		Functions\when( '__' )->returnArg();
		Functions\when( 'get_post_type' )->justReturn( 'post' );
	}

	private static function post( int $id = 10 ): ObjectRef {
		return new ObjectRef( ObjectRef::TYPE_POST, $id, 'post' );
	}

	/**
	 * @param list<Field> $fields Felder.
	 * @return array<string, string> Name → Typ.
	 */
	private static function types( array $fields ): array {
		$types = array();
		foreach ( $fields as $field ) {
			$types[ $field->name ] = $field->type;
		}
		return $types;
	}

	public function test_post_meta_lists_only_public_scalar_meta(): void {
		Functions\when( 'get_registered_meta_keys' )->alias(
			static fn ( string $type, string $subtype = '' ): array => '' === $subtype
				? array(
					'global_note' => array(
						'type'         => 'string',
						'single'       => true,
						'show_in_rest' => true,
					),
				)
				: array(
					'cf65_untertitel' => array(
						'type'         => 'string',
						'single'       => true,
						'show_in_rest' => true,
						'description'  => 'Untertitel',
					),
					'_geheim'         => array(
						'type'         => 'string',
						'single'       => true,
						'show_in_rest' => true,
					),
					'intern'          => array(
						'type'         => 'string',
						'single'       => true,
						'show_in_rest' => false,
					),
					'liste'           => array(
						'type'         => 'array',
						'single'       => true,
						'show_in_rest' => true,
					),
					'mehrfach'        => array(
						'type'         => 'string',
						'single'       => false,
						'show_in_rest' => true,
					),
					'preis'           => array(
						'type'         => 'number',
						'single'       => true,
						'show_in_rest' => true,
					),
				)
		);
		Functions\when( 'is_protected_meta' )->alias( static fn ( string $key ): bool => \str_starts_with( $key, '_' ) );

		$fields = ( new PostMetaProvider() )->fields( self::post() );

		self::assertSame(
			array(
				'global_note'     => 'text',
				'preis'           => 'text',
				'cf65_untertitel' => 'text',
			),
			self::types( $fields )
		);
		self::assertSame( 'Untertitel', $fields[2]->label );
	}

	public function test_post_meta_values_are_scalar(): void {
		Functions\when( 'get_post_meta' )->alias( static fn ( int $id, string $key ): mixed => 'liste' === $key ? array( 'a' ) : 'Wert ' . $id );
		$provider = new PostMetaProvider();

		self::assertSame( 'Wert 10', $provider->value( self::post(), new Field( 'cf65_untertitel', 'U', Field::TYPE_TEXT ), array() ) );
		self::assertNull( $provider->value( self::post(), new Field( 'liste', 'L', Field::TYPE_TEXT ), array() ) );
	}

	/**
	 * ACF-Stubs: eine Gruppe mit allen unterstützten und einigen ungültigen Feldern.
	 */
	private function acf(): void {
		Functions\when( 'acf_get_field_groups' )->justReturn(
			array(
				array(
					'key'   => 'group_1',
					'title' => 'Projekt',
				),
			)
		);
		Functions\when( 'acf_get_fields' )->justReturn(
			array(
				array(
					'name'  => 'untertitel',
					'label' => 'Untertitel',
					'type'  => 'text',
				),
				array(
					'name'  => 'auswahl',
					'label' => 'Auswahl',
					'type'  => 'checkbox',
				),
				array(
					'name'  => 'aktiv',
					'label' => 'Aktiv',
					'type'  => 'true_false',
				),
				array(
					'name'  => 'webseite',
					'label' => 'Webseite',
					'type'  => 'url',
				),
				array(
					'name'  => 'cta',
					'label' => 'CTA',
					'type'  => 'link',
				),
				array(
					'name'  => 'seite',
					'label' => 'Seite',
					'type'  => 'page_link',
				),
				array(
					'name'  => 'portrait',
					'label' => '',
					'type'  => 'image',
				),
				array(
					'name'  => 'verwandt',
					'label' => 'Verwandt',
					'type'  => 'relationship',
				),
				array(
					'name'  => 'zeilen',
					'label' => 'Zeilen',
					'type'  => 'repeater',
				),
				array(
					'name'  => '_versteckt',
					'label' => 'X',
					'type'  => 'text',
				),
				array(
					'name'  => 'untertitel',
					'label' => 'Doppelt',
					'type'  => 'image',
				),
			)
		);
		Functions\when( 'get_field' )->alias(
			static fn ( string $name, int $id, bool $format = true ): mixed => match ( $name ) {
				'untertitel' => 'Sub ' . $id,
				'auswahl'    => array(
					array(
						'value' => 'r',
						'label' => 'Rot',
					),
					'Blau',
				),
				'aktiv'      => '1',
				'webseite'   => 'https://example.org/',
				'cta'        => array(
					'url'   => '/kontakt/',
					'title' => 'Kontakt',
				),
				'seite'      => array( '20', '30' ),
				'portrait'   => '5',
				'verwandt'   => array( 20, '30', 'x' ),
				default      => null,
			}
		);
		// 20 privat, 30 öffentlich.
		Functions\when( 'get_post' )->alias(
			static function ( int $id ): \WP_Post {
				$post     = \Mockery::mock( \WP_Post::class );
				$post->ID = $id;
				return $post;
			}
		);
		Functions\when( 'current_user_can' )->justReturn( false );
		Functions\when( 'post_password_required' )->justReturn( false );
		Functions\when( 'is_post_publicly_viewable' )->alias( static fn ( \WP_Post $post ): bool => 30 === $post->ID );
		Functions\when( 'get_the_title' )->alias( static fn ( int $id ): string => 'Beitrag ' . $id );
		Functions\when( 'get_permalink' )->alias( static fn ( int $id ): string => '/?p=' . $id );
	}

	public function test_acf_fields_are_mapped_and_filtered(): void {
		$this->acf();
		$fields = ( new AcfProvider() )->fields( self::post() );

		self::assertSame(
			array(
				'untertitel' => 'text',
				'auswahl'    => 'text',
				'aktiv'      => 'text',
				'webseite'   => 'url',
				'cta'        => 'url',
				'seite'      => 'url',
				'portrait'   => 'image',
				'verwandt'   => 'text',
			),
			self::types( $fields )
		);
		self::assertSame( 'Projekt: Untertitel', $fields[0]->label );
		self::assertSame( 'Projekt: portrait', $fields[6]->label );
	}

	public function test_acf_values_per_type(): void {
		$this->acf();
		$provider = new AcfProvider();
		$value    = static fn ( string $name, string $type ): mixed => $provider->value( self::post(), new Field( $name, $name, $type ), array() );

		self::assertSame( 'Sub 10', $value( 'untertitel', Field::TYPE_TEXT ) );
		self::assertSame( 'Rot, Blau', $value( 'auswahl', Field::TYPE_TEXT ) );
		self::assertSame( 'Ja', $value( 'aktiv', Field::TYPE_TEXT ) );
		self::assertSame( 'https://example.org/', $value( 'webseite', Field::TYPE_URL ) );
		self::assertSame( '/kontakt/', $value( 'cta', Field::TYPE_URL ) );
		self::assertSame( '5', $value( 'portrait', Field::TYPE_IMAGE ) );
		self::assertNull( $value( 'zeilen', Field::TYPE_TEXT ) );
		self::assertNull( $value( 'unbekannt', Field::TYPE_TEXT ) );
	}

	public function test_acf_relations_only_show_readable_posts(): void {
		$this->acf();
		$provider = new AcfProvider();

		self::assertSame( 'Beitrag 30', $provider->value( self::post(), new Field( 'verwandt', 'V', Field::TYPE_TEXT ), array() ) );
		self::assertSame( '/?p=30', $provider->value( self::post(), new Field( 'seite', 'S', Field::TYPE_URL ), array() ) );
	}

	public function test_acf_is_available_when_functions_exist(): void {
		$this->acf();
		self::assertTrue( ( new AcfProvider() )->is_available() );
	}
}
