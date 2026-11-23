<?php
/**
 * Rechteprüfung für einzelne Block-Attribute (UMSETZPLAN Kap. 7.2).
 *
 * Blöcke deklarieren in `supports.cf65.capabilities` Attribute, die nur
 * Benutzer mit einer bestimmten Berechtigung setzen dürfen, z. B.
 * `{ "customCss": "unfiltered_html" }`. Fehlt die Berechtigung, wird das
 * Attribut beim Speichern entfernt – serverseitig, unabhängig vom Editor.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Security;

/**
 * Entfernt Attribute, für die dem aktuellen Benutzer die Berechtigung fehlt.
 */
final class CapabilityGuard {

	/**
	 * Konstruktor.
	 *
	 * @param \Closure|null $can Prüft eine Berechtigung (Standard: current_user_can).
	 */
	public function __construct( private readonly ?\Closure $can = null ) {}

	/**
	 * Filtert Attribute nach `supports.cf65.capabilities`.
	 *
	 * @param array<string, mixed> $attributes   Attribute.
	 * @param array<mixed>         $capabilities Map Attribut → Berechtigung.
	 * @return array<string, mixed> Gefilterte Attribute.
	 */
	public function filter( array $attributes, array $capabilities ): array {
		foreach ( $capabilities as $attr => $capability ) {
			if ( ! \is_string( $attr ) || ! \array_key_exists( $attr, $attributes ) ) {
				continue;
			}
			// Ungültige Deklaration → sicherheitshalber entfernen.
			if ( ! \is_string( $capability ) || '' === $capability || ! $this->can( $capability ) ) {
				unset( $attributes[ $attr ] );
			}
		}
		return $attributes;
	}

	/**
	 * Berechtigung des aktuellen Benutzers.
	 *
	 * @param string $capability Berechtigung.
	 */
	private function can( string $capability ): bool {
		return null !== $this->can ? (bool) ( $this->can )( $capability ) : \current_user_can( $capability );
	}
}
