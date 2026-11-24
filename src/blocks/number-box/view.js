/**
 * Frontend: Zahlen mit `data-cf65-count-up` zählen beim Sichtbarwerden von
 * 0 auf ihren Wert hoch. Ohne IntersectionObserver oder bei „Bewegung
 * reduzieren“ bleibt die Zahl unverändert. Geändert wird nur der erste
 * Textknoten mit einer Ziffer, Formatierung (fett usw.) bleibt erhalten.
 */
import { formatNumber, parseNumber } from './count';

const DURATION = 1500;

/**
 * @param {Element} element Zahl-Element.
 * @return {Text|null} Erster Textknoten mit Ziffer.
 */
function digitNode( element ) {
	const walker = element.ownerDocument.createTreeWalker(
		element,
		window.NodeFilter.SHOW_TEXT
	);
	for ( let node = walker.nextNode(); node; node = walker.nextNode() ) {
		if ( /\d/.test( node.nodeValue ) ) {
			return node;
		}
	}
	return null;
}

/**
 * @param {Element} element Zahl-Element.
 */
function animate( element ) {
	const node = digitNode( element );
	const parts = node ? parseNumber( node.nodeValue ) : null;
	if ( ! parts ) {
		return;
	}
	const render = ( value ) => {
		node.nodeValue =
			parts.before + formatNumber( value, parts ) + parts.after;
	};
	const start = window.performance.now();
	const step = ( now ) => {
		const progress = Math.min( 1, ( now - start ) / DURATION );
		// Ease-out: schnell beginnen, sanft enden.
		render( parts.value * ( 1 - Math.pow( 1 - progress, 3 ) ) );
		if ( progress < 1 ) {
			window.requestAnimationFrame( step );
		}
	};
	render( 0 );
	window.requestAnimationFrame( step );
}

function init() {
	const reduce = window.matchMedia?.( '(prefers-reduced-motion: reduce)' );
	if ( reduce?.matches || ! ( 'IntersectionObserver' in window ) ) {
		return;
	}
	const observer = new window.IntersectionObserver(
		( entries ) => {
			for ( const entry of entries ) {
				if ( entry.isIntersecting ) {
					observer.unobserve( entry.target );
					animate( entry.target );
				}
			}
		},
		{ threshold: 0.5 }
	);
	document
		.querySelectorAll( '.cf65-number-box__number[data-cf65-count-up]' )
		.forEach( ( element ) => observer.observe( element ) );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
