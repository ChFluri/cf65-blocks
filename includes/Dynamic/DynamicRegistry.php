<?php
/**
 * Verzeichnis der Quellen und Provider (erweiterbar über Filter).
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

use Cf65\Blocks\Dynamic\Providers\CoreProvider;
use Cf65\Blocks\Dynamic\Providers\ProviderInterface;
use Cf65\Blocks\Dynamic\Sources\CurrentPostSource;
use Cf65\Blocks\Dynamic\Sources\SourceInterface;

/**
 * Lädt Quellen und Provider einmal pro Request.
 */
final class DynamicRegistry {

	/**
	 * Quellen nach ID.
	 *
	 * @var array<string, SourceInterface>|null
	 */
	private ?array $sources = null;

	/**
	 * Provider nach ID.
	 *
	 * @var array<string, ProviderInterface>|null
	 */
	private ?array $providers = null;

	/**
	 * Konstruktor.
	 *
	 * @param list<SourceInterface>|null   $default_sources   Standard-Quellen (null = eingebaute).
	 * @param list<ProviderInterface>|null $default_providers Standard-Provider (null = eingebaute).
	 */
	public function __construct(
		private readonly ?array $default_sources = null,
		private readonly ?array $default_providers = null
	) {}

	/**
	 * Alle Quellen.
	 *
	 * @return array<string, SourceInterface>
	 */
	public function sources(): array {
		if ( null === $this->sources ) {
			/**
			 * Quellen für Dynamic Content.
			 *
			 * @param list<SourceInterface> $sources Quellen.
			 */
			$list          = \apply_filters( 'cf65_blocks/dynamic/sources', $this->default_sources ?? array( new CurrentPostSource() ) );
			$this->sources = array();
			foreach ( \is_array( $list ) ? $list : array() as $source ) {
				if ( $source instanceof SourceInterface ) {
					$this->sources[ $source->id() ] = $source;
				}
			}
		}
		return $this->sources;
	}

	/**
	 * Alle Provider (auch nicht verfügbare).
	 *
	 * @return array<string, ProviderInterface>
	 */
	public function providers(): array {
		if ( null === $this->providers ) {
			/**
			 * Provider für Dynamic Content.
			 *
			 * @param list<ProviderInterface> $providers Provider.
			 */
			$list            = \apply_filters( 'cf65_blocks/dynamic/providers', $this->default_providers ?? array( new CoreProvider() ) );
			$this->providers = array();
			foreach ( \is_array( $list ) ? $list : array() as $provider ) {
				if ( $provider instanceof ProviderInterface ) {
					$this->providers[ $provider->id() ] = $provider;
				}
			}
		}
		return $this->providers;
	}

	/**
	 * Quelle nach ID.
	 *
	 * @param string $id ID.
	 */
	public function source( string $id ): ?SourceInterface {
		return $this->sources()[ $id ] ?? null;
	}

	/**
	 * Verfügbarer Provider nach ID.
	 *
	 * @param string $id ID.
	 */
	public function provider( string $id ): ?ProviderInterface {
		$provider = $this->providers()[ $id ] ?? null;
		return null !== $provider && $provider->is_available() ? $provider : null;
	}
}
