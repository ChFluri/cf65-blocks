import { describe, expect, it } from 'vitest';

import { isOwnBlock } from '../constants';

describe( 'isOwnBlock', () => {
	it( 'erkennt cf65-Blöcke', () => {
		expect( isOwnBlock( 'cf65/heading' ) ).toBe( true );
	} );

	it( 'lehnt fremde und ungültige Namen ab', () => {
		expect( isOwnBlock( 'core/heading' ) ).toBe( false );
		expect( isOwnBlock( undefined ) ).toBe( false );
		expect( isOwnBlock( 42 ) ).toBe( false );
	} );
} );
