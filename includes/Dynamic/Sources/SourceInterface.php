<?php
/**
 * Quelle: bestimmt, aus welchem Objekt gelesen wird (UMSETZPLAN Kap. 3.1).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic\Sources;

use Cf65\Blocks\Dynamic\Binding;
use Cf65\Blocks\Dynamic\ObjectRef;

/**
 * Registrierbar über den Filter `cf65_blocks/dynamic/sources`.
 */
interface SourceInterface {

	/**
	 * Kennung wie in der Bindung, z. B. `current-post`.
	 */
	public function id(): string;

	/**
	 * Anzeigename.
	 */
	public function label(): string;

	/**
	 * Objekt zur Bindung im gegebenen Block-Kontext.
	 *
	 * @param Binding              $binding Bindung.
	 * @param array<string, mixed> $context Block-Kontext (`postId`, `postType` …).
	 */
	public function resolve( Binding $binding, array $context ): ?ObjectRef;
}
