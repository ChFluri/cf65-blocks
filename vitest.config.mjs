import { transformWithOxc } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * JSX in .js-Dateien unter src/ (wie Babel bei wp-scripts), automatische Runtime.
 * Vite leitet die Sprache sonst aus der Dateiendung ab (.js → kein JSX).
 */
const jsxInJs = {
	name: 'cf65-jsx-in-js',
	enforce: 'pre',
	transform( code, id ) {
		if ( ! /\/src\/.*\.js$/.test( id ) ) {
			return null;
		}
		return transformWithOxc( code, id, {
			lang: 'jsx',
			jsx: { runtime: 'automatic' },
		} );
	},
};

export default defineConfig( {
	plugins: [ jsxInJs ],
	test: {
		include: [ 'src/**/*.test.js' ],
		server: {
			deps: {
				// WordPress-Pakete importieren JSON ohne Import-Attribut → durch Vite transformieren.
				inline: [ /@wordpress\// ],
			},
		},
	},
} );
