<?php
/**
 * Verweis auf das Objekt, aus dem ein dynamischer Wert gelesen wird.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Objekt (Typ + ID), z. B. Beitrag 42. `subtype` ist der Post-Typ und dient
 * der Feldliste, wenn (noch) keine ID bekannt ist (ID 0).
 */
final class ObjectRef {

	public const TYPE_POST = 'post';

	/**
	 * Konstruktor.
	 *
	 * @param string $type    Objekttyp (`post`).
	 * @param int    $id      ID (0 = nur Typ bekannt, z. B. für die Feldliste).
	 * @param string $subtype Post-Typ o. Ä. (optional).
	 */
	public function __construct(
		public readonly string $type,
		public readonly int $id,
		public readonly string $subtype = ''
	) {}

	/**
	 * Stabiler Schlüssel für Caches.
	 */
	public function key(): string {
		return $this->type . ':' . $this->id . ':' . $this->subtype;
	}
}
