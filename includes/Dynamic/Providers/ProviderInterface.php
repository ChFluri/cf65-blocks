<?php
/**
 * Provider: liest Felder eines Objekts (UMSETZPLAN Kap. 3.1).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Providers;

use Cf65\Blocks\Dynamic\Field;
use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * Registrierbar über den Filter `cf65_blocks/dynamic/providers`.
 *
 * Werte je Feldtyp: `text` und `url` als String, `image` als Attachment-ID
 * (int) oder URL (string).
 */
interface ProviderInterface {

	/**
	 * Kennung wie in der Bindung, z. B. `core`.
	 */
	public function id(): string;

	/**
	 * Anzeigename (Gruppe im Feld-Picker).
	 */
	public function label(): string;

	/**
	 * Ob der Provider nutzbar ist (z. B. Plugin aktiv).
	 */
	public function is_available(): bool;

	/**
	 * Felder für ein Objekt. Nur diese Felder werden je ausgegeben.
	 *
	 * @param ObjectRef $ref Objekt (ID 0 = nur Typ bekannt).
	 * @return list<Field>
	 */
	public function fields( ObjectRef $ref ): array;

	/**
	 * Rohwert eines Feldes.
	 *
	 * @param ObjectRef                            $ref Objekt.
	 * @param Field                                $field  Feld aus {@see self::fields()}.
	 * @param array<string, string|int|float|bool> $args   Optionen der Bindung.
	 */
	public function value( ObjectRef $ref, Field $field, array $args ): mixed;
}
