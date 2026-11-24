<?php
/**
 * Provider „ACF“ (Advanced Custom Fields, UMSETZPLAN Kap. 3.4).
 *
 * Feldliste aus den Feldgruppen, deren Location-Regeln zum Post-Typ passen.
 * Die Bindung speichert den Feldnamen; beim Lesen wird nur ein Feld aus
 * dieser Liste akzeptiert. Repeater, Flexible Content und Gruppen folgen
 * mit dem Repeater-Loop-Block.
 *
 * Relationen (Beitrag, Relation, Seitenlink) geben nur Beiträge aus, die
 * der Betrachter sehen darf ({@see ObjectPolicy}).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Providers;

use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectPolicy;
use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * ACF-Felder an Beiträgen.
 */
final class AcfProvider implements ProviderInterface {

	public const ID = 'acf';

	/** ACF-Feldtyp → eigener Feldtyp. */
	private const TYPES = array(
		'text'             => Field::TYPE_TEXT,
		'textarea'         => Field::TYPE_TEXT,
		'number'           => Field::TYPE_TEXT,
		'range'            => Field::TYPE_TEXT,
		'email'            => Field::TYPE_TEXT,
		'wysiwyg'          => Field::TYPE_TEXT,
		'select'           => Field::TYPE_TEXT,
		'checkbox'         => Field::TYPE_TEXT,
		'radio'            => Field::TYPE_TEXT,
		'button_group'     => Field::TYPE_TEXT,
		'true_false'       => Field::TYPE_TEXT,
		'date_picker'      => Field::TYPE_TEXT,
		'date_time_picker' => Field::TYPE_TEXT,
		'time_picker'      => Field::TYPE_TEXT,
		'color_picker'     => Field::TYPE_TEXT,
		'post_object'      => Field::TYPE_TEXT,
		'relationship'     => Field::TYPE_TEXT,
		'url'              => Field::TYPE_URL,
		'link'             => Field::TYPE_URL,
		'page_link'        => Field::TYPE_URL,
		'image'            => Field::TYPE_IMAGE,
	);

	private const RELATION_TYPES = array( 'post_object', 'relationship' );

	/** Maximale Anzahl Einträge, die aus Mehrfachwerten ausgegeben werden. */
	private const MAX_ITEMS = 50;

	/**
	 * Felder je Post-Typ (Request-Cache).
	 *
	 * @var array<string, list<Field>>
	 */
	private array $fields = array();

	/**
	 * ACF-Feldtyp je Feldname und Post-Typ.
	 *
	 * @var array<string, array<string, string>>
	 */
	private array $acf_types = array();

	/**
	 * Konstruktor.
	 *
	 * @param ObjectPolicy $policy Sichtbarkeit verknüpfter Beiträge.
	 */
	public function __construct( private readonly ObjectPolicy $policy = new ObjectPolicy() ) {}

	/**
	 * {@inheritDoc}
	 */
	public function id(): string {
		return self::ID;
	}

	/**
	 * {@inheritDoc}
	 */
	public function label(): string {
		return \__( 'ACF', 'cf65-blocks' );
	}

	/**
	 * {@inheritDoc}
	 */
	public function is_available(): bool {
		return \function_exists( 'acf_get_field_groups' ) && \function_exists( 'acf_get_fields' ) && \function_exists( 'get_field' );
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param ObjectRef $ref Objekt.
	 * @return list<Field>
	 */
	public function fields( ObjectRef $ref ): array {
		if ( ObjectRef::TYPE_POST !== $ref->type ) {
			return array();
		}
		$post_type = PostTypes::of( $ref );
		if ( isset( $this->fields[ $post_type ] ) ) {
			return $this->fields[ $post_type ];
		}

		$groups = \acf_get_field_groups( '' !== $post_type ? array( 'post_type' => $post_type ) : array() );
		$fields = array();
		$types  = array();
		foreach ( \is_array( $groups ) ? $groups : array() as $group ) {
			if ( ! \is_array( $group ) ) {
				continue;
			}
			$group_title = \is_string( $group['title'] ?? null ) ? $group['title'] : '';
			$acf_fields  = \acf_get_fields( $group );
			foreach ( \is_array( $acf_fields ) ? $acf_fields : array() as $acf_field ) {
				$field = self::field( $acf_field, $group_title );
				if ( null === $field || isset( $types[ $field->name ] ) ) {
					continue;
				}
				$fields[]              = $field;
				$types[ $field->name ] = (string) $acf_field['type'];
			}
		}

		$this->fields[ $post_type ]    = $fields;
		$this->acf_types[ $post_type ] = $types;
		return $fields;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @param ObjectRef                            $ref   Objekt.
	 * @param Field                                $field Feld aus {@see self::fields()}.
	 * @param array<string, string|int|float|bool> $args  Optionen.
	 */
	public function value( ObjectRef $ref, Field $field, array $args ): mixed {
		$post_type = PostTypes::of( $ref );
		if ( ! isset( $this->acf_types[ $post_type ] ) ) {
			$this->fields( $ref );
		}
		$acf_type = $this->acf_types[ $post_type ][ $field->name ] ?? null;
		if ( null === $acf_type ) {
			return null;
		}

		return match ( true ) {
			'image' === $acf_type        => \get_field( $field->name, $ref->id, false ),
			'url' === $acf_type          => \get_field( $field->name, $ref->id, false ),
			'link' === $acf_type         => self::link_url( \get_field( $field->name, $ref->id, false ) ),
			'page_link' === $acf_type    => $this->first_permalink( \get_field( $field->name, $ref->id, false ) ),
			\in_array( $acf_type, self::RELATION_TYPES, true ) => $this->titles( \get_field( $field->name, $ref->id, false ) ),
			'true_false' === $acf_type   => \get_field( $field->name, $ref->id, false ) ? \__( 'Ja', 'cf65-blocks' ) : \__( 'Nein', 'cf65-blocks' ),
			default                      => self::scalar_text( \get_field( $field->name, $ref->id, true ) ),
		};
	}

	/**
	 * Felddefinition aus einem ACF-Feld.
	 *
	 * @param mixed  $acf_field   ACF-Feld.
	 * @param string $group_title Titel der Feldgruppe.
	 */
	private static function field( mixed $acf_field, string $group_title ): ?Field {
		if ( ! \is_array( $acf_field ) ) {
			return null;
		}
		$name = $acf_field['name'] ?? null;
		$type = $acf_field['type'] ?? null;
		if ( ! \is_string( $name ) || ! \is_string( $type ) || ! isset( self::TYPES[ $type ] ) ) {
			return null;
		}
		if ( 1 !== \preg_match( '/^[A-Za-z0-9][A-Za-z0-9_\-]{0,63}$/D', $name ) ) {
			return null;
		}
		$label = \is_string( $acf_field['label'] ?? null ) && '' !== $acf_field['label'] ? $acf_field['label'] : $name;
		if ( '' !== $group_title ) {
			$label = $group_title . ': ' . $label;
		}
		return new Field( $name, $label, self::TYPES[ $type ] );
	}

	/**
	 * Text aus formatierten Werten (Mehrfachauswahl → Liste).
	 *
	 * @param mixed $value Formatierter ACF-Wert.
	 */
	private static function scalar_text( mixed $value ): string|int|float|null {
		if ( \is_string( $value ) || \is_int( $value ) || \is_float( $value ) ) {
			return $value;
		}
		if ( \is_array( $value ) ) {
			$parts = array();
			foreach ( \array_slice( $value, 0, self::MAX_ITEMS ) as $item ) {
				if ( \is_array( $item ) ) {
					$item = $item['label'] ?? $item['value'] ?? null;
				}
				if ( \is_string( $item ) || \is_int( $item ) || \is_float( $item ) ) {
					$parts[] = (string) $item;
				}
			}
			return array() === $parts ? null : \implode( ', ', $parts );
		}
		return null;
	}

	/**
	 * URL aus einem Link-Feld (Array oder URL).
	 *
	 * @param mixed $value Rohwert.
	 */
	private static function link_url( mixed $value ): ?string {
		if ( \is_array( $value ) ) {
			$value = $value['url'] ?? null;
		}
		return \is_string( $value ) ? $value : null;
	}

	/**
	 * Permalink des ersten sichtbaren Beitrags (Seitenlink-Feld).
	 *
	 * @param mixed $value Post-ID(s) oder URL (Archive).
	 */
	private function first_permalink( mixed $value ): ?string {
		foreach ( self::ids( $value ) as $id ) {
			if ( $this->policy->can_read( new ObjectRef( ObjectRef::TYPE_POST, $id ) ) ) {
				$link = \get_permalink( $id );
				return \is_string( $link ) ? $link : null;
			}
		}
		return null;
	}

	/**
	 * Titel sichtbarer verknüpfter Beiträge, kommagetrennt.
	 *
	 * @param mixed $value Post-ID(s).
	 */
	private function titles( mixed $value ): ?string {
		$titles = array();
		foreach ( self::ids( $value ) as $id ) {
			if ( $this->policy->can_read( new ObjectRef( ObjectRef::TYPE_POST, $id ) ) ) {
				$titles[] = \get_the_title( $id );
			}
		}
		return array() === $titles ? null : \implode( ', ', $titles );
	}

	/**
	 * Positive Post-IDs aus einem Rohwert.
	 *
	 * @param mixed $value ID, numerischer String oder Liste davon.
	 * @return list<int>
	 */
	private static function ids( mixed $value ): array {
		$ids = array();
		foreach ( \array_slice( \is_array( $value ) ? $value : array( $value ), 0, self::MAX_ITEMS ) as $item ) {
			if ( $item instanceof \WP_Post ) {
				$item = $item->ID;
			}
			if ( \is_string( $item ) && 1 === \preg_match( '/^[1-9][0-9]{0,18}$/D', $item ) ) {
				$item = (int) $item;
			}
			if ( \is_int( $item ) && $item > 0 ) {
				$ids[] = $item;
			}
		}
		return $ids;
	}
}
