<?php
/**
 * REST-Routen für den Feld-Picker und die Editor-Vorschau (UMSETZPLAN Kap. 3.6).
 *
 * - GET  cf65-blocks/v1/dynamic/fields  ?kind=image&postType=post
 * - POST cf65-blocks/v1/dynamic/preview { kind, postId, bindings: { key: binding } }
 *
 * Beide nur für Benutzer mit `edit_posts`. Die Vorschau löst jede Bindung
 * über den {@see Resolver} auf und unterliegt damit derselben
 * Objektprüfung wie das Frontend.
 *
 * @package Cf65\Blocks
 */

declare( strict_types = 1 );

namespace Cf65\Blocks\Dynamic;

/**
 * Registriert und beantwortet die Routen.
 */
final class RestController {

	public const NAMESPACE = 'cf65-blocks/v1';

	/** Maximale Anzahl Bindungen pro Vorschau-Anfrage. */
	private const MAX_BINDINGS = 50;

	/**
	 * Konstruktor.
	 *
	 * @param Resolver $resolver Auflösung.
	 */
	public function __construct( private readonly Resolver $resolver = new Resolver() ) {}

	/**
	 * Hooks registrieren.
	 */
	public function register_hooks(): void {
		\add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Routen registrieren.
	 */
	public function register_routes(): void {
		$kind = array(
			'type'     => 'string',
			'enum'     => \array_keys( Formatter::ACCEPTS ),
			'required' => true,
		);

		\register_rest_route(
			self::NAMESPACE,
			'/dynamic/fields',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'fields' ),
				'permission_callback' => array( $this, 'can_use' ),
				'args'                => array(
					'kind'     => $kind,
					'postType' => array(
						'type'    => 'string',
						'pattern' => '^[a-z0-9_-]{1,20}$',
						'default' => '',
					),
				),
			)
		);

		\register_rest_route(
			self::NAMESPACE,
			'/dynamic/preview',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'preview' ),
				'permission_callback' => array( $this, 'can_use' ),
				'args'                => array(
					'kind'     => $kind,
					'postId'   => array(
						'type'    => 'integer',
						'minimum' => 0,
						'default' => 0,
					),
					'postType' => array(
						'type'    => 'string',
						'pattern' => '^[a-z0-9_-]{1,20}$',
						'default' => '',
					),
					'bindings' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);
	}

	/**
	 * Berechtigung: Beiträge bearbeiten dürfen.
	 */
	public function can_use(): bool {
		return \current_user_can( 'edit_posts' );
	}

	/**
	 * Feldliste je Provider.
	 *
	 * @param \WP_REST_Request $request Anfrage.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 */
	public function fields( \WP_REST_Request $request ): \WP_REST_Response {
		$kind      = (string) $request->get_param( 'kind' );
		$post_type = (string) $request->get_param( 'postType' );

		return new \WP_REST_Response(
			array(
				'sources'   => $this->resolver->sources(),
				'providers' => $this->resolver->fields( new ObjectRef( ObjectRef::TYPE_POST, 0, $post_type ), $kind ),
			)
		);
	}

	/**
	 * Aufgelöste Werte für den Editor.
	 *
	 * @param \WP_REST_Request $request Anfrage.
	 * @phpstan-param \WP_REST_Request<array<string, mixed>> $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function preview( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$kind      = (string) $request->get_param( 'kind' );
		$post_id   = (int) $request->get_param( 'postId' );
		$post_type = (string) $request->get_param( 'postType' );
		$bindings  = $request->get_param( 'bindings' );

		if ( ! \is_array( $bindings ) || \count( $bindings ) > self::MAX_BINDINGS ) {
			return new \WP_Error( 'cf65_blocks_invalid_bindings', \__( 'Ungültige Bindungen.', 'cf65-blocks' ), array( 'status' => 400 ) );
		}

		$context = array();
		if ( $post_id > 0 ) {
			$context['postId'] = $post_id;
		}
		if ( '' !== $post_type ) {
			$context['postType'] = $post_type;
		}

		$values = array();
		foreach ( $bindings as $key => $raw ) {
			if ( ! \is_string( $key ) || 1 !== \preg_match( '/^[A-Za-z0-9_-]{1,64}$/D', $key ) ) {
				continue;
			}
			$binding        = Binding::from_array( $raw );
			$values[ $key ] = null === $binding || 0 === $post_id ? null : $this->resolver->resolve( $binding, $context, $kind );
		}

		return new \WP_REST_Response( array( 'values' => (object) $values ) );
	}
}
