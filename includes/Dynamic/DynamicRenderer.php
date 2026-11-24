<?php
/**
 * Laufzeit-Anreicherung: dynamische Werte ins gespeicherte Markup einsetzen
 * (UMSETZPLAN Kap. 2.2 Schicht 1 und Kap. 3).
 *
 * - Attribut-Bindungen: Blöcke deklarieren bindbare Attribute in
 *   `supports.cf65.dynamic`, z. B. `{"url":{"kind":"image","tag":"img"}}`.
 *   Der statische Wert dient als Fallback.
 * - Inline-Platzhalter (`<span class="cf65-dynamic" …>`) im RichText von
 *   Blöcken mit `supports.cf65.inlineDynamic: true` ({@see InlineScanner}).
 *
 * Das gespeicherte HTML bleibt unverändert.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

use Cf65\Blocks\Blocks\Registry;
use Cf65\Blocks\Debug\Profiling;

/**
 * `render_block`-Filter für cf65-Blöcke mit Attribut `dynamic`.
 */
final class DynamicRenderer {

	private const TAG_PATTERN   = '/^[a-z][a-z0-9]{0,15}$/D';
	private const CLASS_PATTERN = '/^[a-z][a-z0-9_-]{0,63}$/D';

	/**
	 * Konstruktor.
	 *
	 * @param Resolver      $resolver          Auflösung.
	 * @param \Closure|null $supports_resolver Liefert `supports.cf65` zu einem
	 *                                         Blocknamen (Standard: Block-Registry).
	 */
	public function __construct(
		private readonly Resolver $resolver = new Resolver(),
		private readonly ?\Closure $supports_resolver = null
	) {}

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_filter( 'render_block', array( $this, 'render' ), 9, 3 );
	}

	/**
	 * `render_block`-Filter.
	 *
	 * @param string         $content  Gerendertes HTML.
	 * @param array<mixed>   $block    Geparster Block.
	 * @param \WP_Block|null $instance Blockinstanz (Kontext).
	 */
	public function render( string $content, array $block, ?\WP_Block $instance = null ): string {
		$name = $block['blockName'] ?? null;
		if ( ! \is_string( $name ) || ! \str_starts_with( $name, Registry::BLOCK_PREFIX ) ) {
			return $content;
		}
		$attributes   = \is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
		$has_bindings = \is_array( $attributes['dynamic'] ?? null ) && array() !== $attributes['dynamic'];
		$has_tokens   = InlineReplacer::has_tokens( $content ) && true === ( $this->supports( $name )['inlineDynamic'] ?? null );
		if ( ! $has_bindings && ! $has_tokens ) {
			return $content;
		}

		$profiler = Profiling::get();
		$start    = $profiler->enabled() ? \hrtime( true ) : 0;

		/** @var array<string, mixed> $attributes */
		$context = null !== $instance && \is_array( $instance->context ) ? $instance->context : array();
		$result  = $content;
		$count   = 0;

		if ( $has_bindings ) {
			$patches = $this->plan( $name, $attributes, $context );
			$count  += \count( $patches );
			$result  = array() === $patches ? $result : HtmlPatcher::apply( $result, $patches );
		}

		if ( $has_tokens && '' !== $result ) {
			$tokens = ( new InlineScanner( $result ) )->scan();
			$count += \count( $tokens );
			$result = InlineReplacer::replace( $result, $tokens, $this->text_resolver( $context ) );
		}

		if ( $profiler->enabled() ) {
			$profiler->record( 'dynamic', ( \hrtime( true ) - $start ) / 1e6, $count );
		}
		return $result;
	}

	/**
	 * Liefert Texte für Inline-Platzhalter im Block-Kontext.
	 *
	 * @param array<string, mixed> $context Block-Kontext.
	 * @return \Closure(Binding): ?string
	 */
	public function text_resolver( array $context ): \Closure {
		return function ( Binding $binding ) use ( $context ): ?string {
			$value = $this->resolver->resolve( $binding, $context, Formatter::KIND_TEXT );
			return \is_string( $value ) ? $value : null;
		};
	}

	/**
	 * Änderungen am HTML für eine Blockinstanz (ohne HTML anzufassen).
	 *
	 * @param string               $name       Blockname.
	 * @param array<string, mixed> $attributes Attribute.
	 * @param array<string, mixed> $context    Block-Kontext.
	 * @return list<array{tag: string, class: string|null, set: array<string, string|null>, add_class: list<string>, remove_class: string|null, drop_without: string|null}>
	 */
	public function plan( string $name, array $attributes, array $context ): array {
		$specs    = $this->specs( $name );
		$bindings = \is_array( $attributes['dynamic'] ?? null ) ? $attributes['dynamic'] : array();
		$patches  = array();

		foreach ( $specs as $attr => $spec ) {
			if ( ! \is_string( $attr ) || ! \is_array( $spec ) || ! \array_key_exists( $attr, $bindings ) ) {
				continue;
			}
			$binding    = Binding::from_array( $bindings[ $attr ] );
			$kind       = $spec['kind'] ?? null;
			$tag        = $spec['tag'] ?? null;
			$class_name = $spec['class'] ?? null;
			if ( null === $binding || ! \is_string( $kind ) || ! self::valid( self::TAG_PATTERN, $tag ) || ( null !== $class_name && ! self::valid( self::CLASS_PATTERN, $class_name ) ) ) {
				continue;
			}
			/** @var string $tag */
			/** @var string|null $class_name */

			$value = $this->resolver->resolve( $binding, $context, $kind );
			$patch = match ( $kind ) {
				Formatter::KIND_IMAGE => self::image_patch( $tag, $class_name, $value ),
				Formatter::KIND_LINK  => self::link_patch( $tag, $class_name, $value, $spec, $attributes ),
				default               => null,
			};
			if ( null !== $patch ) {
				$patches[] = $patch;
			}
		}
		return $patches;
	}

	/**
	 * Bild: src, Masse, Alternativtext und `wp-image-<id>` (für srcset/lazy).
	 * Ohne Wert und ohne statisches Bild wird der Block nicht ausgegeben.
	 *
	 * @param string      $tag   Tag.
	 * @param string|null $class_name Klasse.
	 * @param mixed       $value Formatierter Wert.
	 * @return array{tag: string, class: string|null, set: array<string, string|null>, add_class: list<string>, remove_class: string|null, drop_without: string|null}
	 */
	private static function image_patch( string $tag, ?string $class_name, mixed $value ): array {
		$patch = array(
			'tag'          => $tag,
			'class'        => $class_name,
			'set'          => array(),
			'add_class'    => array(),
			'remove_class' => null,
			'drop_without' => 'src',
		);
		if ( ! \is_array( $value ) || ! \is_string( $value['url'] ?? null ) ) {
			return $patch;
		}

		$id     = \is_int( $value['id'] ?? null ) ? $value['id'] : 0;
		$width  = \is_int( $value['width'] ?? null ) ? $value['width'] : 0;
		$height = \is_int( $value['height'] ?? null ) ? $value['height'] : 0;
		$alt    = \is_string( $value['alt'] ?? null ) ? $value['alt'] : '';

		$patch['set'] = array(
			'src'    => $value['url'],
			'width'  => $width > 0 && $height > 0 ? (string) $width : null,
			'height' => $width > 0 && $height > 0 ? (string) $height : null,
		);
		if ( '' !== $alt ) {
			$patch['set']['alt'] = $alt;
		}
		$patch['remove_class'] = '/^wp-image-[0-9]+$/D';
		if ( $id > 0 ) {
			$patch['add_class'] = array( 'wp-image-' . $id );
		}
		return $patch;
	}

	/**
	 * Link: href (+ target/rel, wenn der Block „neuer Tab“ gesetzt hat).
	 *
	 * @param string               $tag        Tag.
	 * @param string|null          $class_name      Klasse.
	 * @param mixed                $value      Formatierter Wert.
	 * @param array<mixed>         $spec       Deklaration.
	 * @param array<string, mixed> $attributes Attribute.
	 * @return array{tag: string, class: string|null, set: array<string, string|null>, add_class: list<string>, remove_class: string|null, drop_without: string|null}|null
	 */
	private static function link_patch( string $tag, ?string $class_name, mixed $value, array $spec, array $attributes ): ?array {
		if ( ! \is_string( $value ) ) {
			return null;
		}
		$set     = array( 'href' => $value );
		$new_tab = $spec['newTab'] ?? null;
		if ( \is_string( $new_tab ) && true === ( $attributes[ $new_tab ] ?? null ) ) {
			$set['target'] = '_blank';
			$set['rel']    = 'noopener';
		}
		return array(
			'tag'          => $tag,
			'class'        => $class_name,
			'set'          => $set,
			'add_class'    => array(),
			'remove_class' => null,
			'drop_without' => null,
		);
	}

	/**
	 * Deklaration `supports.cf65.dynamic` eines Blocktyps.
	 *
	 * @param string $name Blockname.
	 * @return array<mixed>
	 */
	private function specs( string $name ): array {
		$specs = $this->supports( $name )['dynamic'] ?? null;
		return \is_array( $specs ) ? $specs : array();
	}

	/**
	 * `supports.cf65` eines Blocktyps.
	 *
	 * @param string $name Blockname.
	 * @return array<mixed>
	 */
	private function supports( string $name ): array {
		if ( null !== $this->supports_resolver ) {
			$supports = ( $this->supports_resolver )( $name );
			return \is_array( $supports ) ? $supports : array();
		}
		$type = \WP_Block_Type_Registry::get_instance()->get_registered( $name );
		if ( null === $type || ! \is_array( $type->supports ) ) {
			return array();
		}
		$cf65 = $type->supports['cf65'] ?? null;
		return \is_array( $cf65 ) ? $cf65 : array();
	}

	/**
	 * @param string $pattern Regex.
	 * @param mixed  $value   Wert.
	 */
	private static function valid( string $pattern, mixed $value ): bool {
		return \is_string( $value ) && 1 === \preg_match( $pattern, $value );
	}
}
