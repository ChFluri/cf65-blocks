// @vitest-environment jsdom

/**
 * Payload-Testsuite (UMSETZPLAN Kap. 7.5), generiert aus allen block.json:
 * Kein Stil-Attribut eines Blocks darf mit Injection-Payloads CSS erzeugen.
 * Gegenstück zu tests/php/Unit/Security/PayloadTest.php.
 */
import { describe, expect, it } from 'vitest';

import { BLOCK_DEFINITIONS } from '../../blocks/definitions';
import { generateCss } from '../generator';

const PAYLOADS = [
	'red;}</style><script>alert(1)</script>',
	'</style><img src=x onerror=alert(1)>',
	'"><svg onload=alert(1)>',
	'expression(alert(1))',
	'url(javascript:alert(1))',
	'1px;background:url(//evil.example/x)',
	'10px}body{display:none',
	'#fff\n}',
	'#fff\0',
	'var(--x);}',
	'var(--x)}</style>',
	'calc(1px + 1px)',
	'@import url(x)',
	'left;color:red',
	'CENTER',
	'',
	' 10px',
	'10px ',
	'１０px',
	42,
	1.5,
	true,
	null,
	[ '#fff' ],
];

const cases = BLOCK_DEFINITIONS.flatMap( ( { metadata } ) =>
	metadata.supports.cf65.styles.flatMap( ( entry ) =>
		PAYLOADS.map( ( payload, i ) => [
			`${ metadata.name } ${ entry.attr } #${ i }`,
			metadata.supports.cf65.styles,
			entry,
			payload,
		] )
	)
);

describe( 'Payloads erzeugen kein CSS', () => {
	it( 'deckt alle Blöcke ab', () => {
		const names = new Set(
			cases.map( ( [ label ] ) => label.split( ' ' )[ 0 ] )
		);
		expect( [ ...names ].sort() ).toEqual(
			BLOCK_DEFINITIONS.map( ( { metadata } ) => metadata.name ).sort()
		);
	} );

	it.each( cases )( '%s', ( _label, map, entry, payload ) => {
		const value = entry.responsive
			? { desktop: payload, tablet: payload, mobile: payload }
			: payload;
		expect(
			generateCss( 'abcd1234', map, { [ entry.attr ]: value } )
		).toBe( '' );
	} );
} );
