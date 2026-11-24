<?php
/**
 * Feld, das ein Provider anbietet (für Feld-Picker und Prüfung).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Felddefinition.
 */
final class Field {

	public const TYPE_TEXT  = 'text';
	public const TYPE_URL   = 'url';
	public const TYPE_IMAGE = 'image';

	/**
	 * Konstruktor.
	 *
	 * @param string $name  Feldname (wie in der Bindung).
	 * @param string $label Anzeigename.
	 * @param string $type  Werttyp (`text`, `url`, `image`).
	 */
	public function __construct(
		public readonly string $name,
		public readonly string $label,
		public readonly string $type
	) {}

	/**
	 * Darstellung für die REST-Antwort.
	 *
	 * @return array{name: string, label: string, type: string}
	 */
	public function to_array(): array {
		return array(
			'name'  => $this->name,
			'label' => $this->label,
			'type'  => $this->type,
		);
	}
}
