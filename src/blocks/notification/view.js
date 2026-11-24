/**
 * Frontend: Schliessen-Button blendet den Hinweis aus (nur für diesen
 * Seitenaufruf). Ein Listener für alle Hinweise der Seite.
 */
document.addEventListener( 'click', ( event ) => {
	const button =
		event.target instanceof window.Element
			? event.target.closest( '.cf65-notification__close' )
			: null;
	const note = button?.closest( '.cf65-notification' );
	if ( note ) {
		note.hidden = true;
	}
} );
