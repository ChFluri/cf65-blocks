#!/usr/bin/env node
/**
 * Erzeugt includes/Icons/icons.json aus Lucide (ISC), Simple Icons (CC0)
 * und – für Marken, die Simple Icons nicht führt – Font Awesome Free
 * (Icons CC BY 4.0, Namensnennung in LICENSES.md).
 *
 * Nur die kuratierte Auswahl unten wird übernommen. Elemente und Attribute
 * werden gegen eine Whitelist geprüft und strukturiert gespeichert
 * (`[tag, { attr: value }]`), damit PHP und JS das SVG selbst – escaped –
 * zusammensetzen. Ausführen nach Änderungen an der Auswahl oder einem
 * Update der Pakete: `node bin/icons.mjs` (im node-Container).
 */
/* eslint-disable no-console -- CLI-Skript, Ausgabe auf der Konsole ist gewollt. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire( import.meta.url );
const OUT = join( 'includes', 'Icons' );
const MODULES = 'node_modules';

/** Allgemeine Icons (Lucide-Namen). */
const GENERAL = [
	'activity',
	'alarm-clock',
	'archive',
	'arrow-down',
	'arrow-left',
	'arrow-right',
	'arrow-up',
	'arrow-up-right',
	'award',
	'badge-check',
	'banknote',
	'chart-column',
	'battery-charging',
	'bell',
	'bike',
	'book',
	'book-open',
	'bookmark',
	'briefcase',
	'building',
	'cake',
	'calendar',
	'calendar-check',
	'camera',
	'car',
	'chart-pie',
	'check',
	'circle-check',
	'circle-x',
	'chevron-down',
	'chevron-left',
	'chevron-right',
	'chevron-up',
	'circle',
	'clipboard',
	'clipboard-check',
	'clock',
	'cloud',
	'code',
	'coffee',
	'cog',
	'compass',
	'copy',
	'credit-card',
	'crown',
	'database',
	'download',
	'droplet',
	'earth',
	'euro',
	'external-link',
	'eye',
	'file',
	'file-text',
	'film',
	'funnel',
	'flag',
	'flame',
	'flower',
	'folder',
	'gift',
	'glasses',
	'globe',
	'graduation-cap',
	'hammer',
	'hand-heart',
	'handshake',
	'hash',
	'headphones',
	'heart',
	'heart-pulse',
	'circle-question-mark',
	'house',
	'hourglass',
	'image',
	'inbox',
	'info',
	'key',
	'laptop',
	'layers',
	'layout-grid',
	'leaf',
	'life-buoy',
	'lightbulb',
	'link',
	'list',
	'list-checks',
	'lock',
	'log-in',
	'mail',
	'map',
	'map-pin',
	'medal',
	'megaphone',
	'menu',
	'message-circle',
	'message-square',
	'mic',
	'minus',
	'monitor',
	'moon',
	'mountain',
	'mouse-pointer-click',
	'eighth-notes',
	'navigation',
	'newspaper',
	'package',
	'paintbrush',
	'palette',
	'paperclip',
	'pen',
	'pencil',
	'percent',
	'phone',
	'piggy-bank',
	'pin',
	'plane',
	'play',
	'plus',
	'printer',
	'puzzle',
	'quote',
	'receipt',
	'recycle',
	'refresh-cw',
	'rocket',
	'ruler',
	'save',
	'scale',
	'school',
	'search',
	'send',
	'server',
	'settings',
	'share-2',
	'shield',
	'shield-check',
	'shopping-bag',
	'shopping-cart',
	'smartphone',
	'face-slightly-smiling',
	'sparkles',
	'star',
	'store',
	'sun',
	'tag',
	'target',
	'thumbs-up',
	'timer',
	'tool-case',
	'trash',
	'trending-up',
	'triangle-exclamation-point',
	'trophy',
	'truck',
	'tv',
	'umbrella',
	'upload',
	'user',
	'user-check',
	'users',
	'utensils',
	'video',
	'wallet',
	'wifi',
	'wrench',
	'x',
	'zap',
];

/** Marken (Simple-Icons-Slug → Anzeigename). */
const BRANDS = {
	facebook: 'Facebook',
	instagram: 'Instagram',
	x: 'X',
	threads: 'Threads',
	bluesky: 'Bluesky',
	mastodon: 'Mastodon',
	youtube: 'YouTube',
	vimeo: 'Vimeo',
	tiktok: 'TikTok',
	pinterest: 'Pinterest',
	snapchat: 'Snapchat',
	whatsapp: 'WhatsApp',
	telegram: 'Telegram',
	discord: 'Discord',
	reddit: 'Reddit',
	twitch: 'Twitch',
	spotify: 'Spotify',
	github: 'GitHub',
	xing: 'XING',
};

/**
 * Marken aus Font Awesome Free (Slug → Anzeigename, Export, Markenfarbe),
 * nur wenn Simple Icons sie nicht führt (z. B. LinkedIn, auf Wunsch des
 * Inhabers dort entfernt).
 */
const FA_BRANDS = {
	linkedin: { label: 'LinkedIn', icon: 'faLinkedinIn', hex: '0A66C2' },
};

const ALLOWED = {
	path: [ 'd' ],
	circle: [ 'cx', 'cy', 'r' ],
	ellipse: [ 'cx', 'cy', 'rx', 'ry' ],
	rect: [ 'x', 'y', 'width', 'height', 'rx', 'ry' ],
	line: [ 'x1', 'y1', 'x2', 'y2' ],
	polyline: [ 'points' ],
	polygon: [ 'points' ],
};
const VALUE = /^[0-9a-zA-Z .,\-]{1,8000}$/;

/**
 * @param {string} name     Icon.
 * @param {Array}  elements Knoten `[tag, attrs]`.
 * @return {Array} Geprüfte Knoten.
 */
function clean( name, elements ) {
	return elements.map( ( [ tag, attrs ] ) => {
		if ( ! ALLOWED[ tag ] ) {
			throw new Error( `${ name }: Element <${ tag }> nicht erlaubt` );
		}
		const out = {};
		for ( const key of ALLOWED[ tag ] ) {
			if ( attrs[ key ] === undefined ) {
				continue;
			}
			const value = String( attrs[ key ] );
			if ( ! VALUE.test( value ) ) {
				throw new Error( `${ name }: Wert von ${ key } ungültig` );
			}
			out[ key ] = value;
		}
		return [ tag, out ];
	} );
}

const nodes = require( 'lucide-static/icon-nodes.json' );
const icons = {};
const missing = [];

for ( const name of GENERAL ) {
	if ( ! nodes[ name ] ) {
		missing.push( name );
		continue;
	}
	icons[ name ] = { g: 'general', t: 's', e: clean( name, nodes[ name ] ) };
}

const simpleDir = join( MODULES, 'simple-icons', 'icons' );
const simpleData = JSON.parse(
	readFileSync(
		join( MODULES, 'simple-icons', 'data', 'simple-icons.json' ),
		'utf8'
	)
);
const brandColors = Object.fromEntries(
	( Array.isArray( simpleData ) ? simpleData : simpleData.icons ).map(
		( entry ) => [ entry.slug, entry.hex ]
	)
);
for ( const [ slug, label ] of Object.entries( BRANDS ) ) {
	let svg;
	try {
		svg = readFileSync( join( simpleDir, `${ slug }.svg` ), 'utf8' );
	} catch {
		missing.push( `brand:${ slug }` );
		continue;
	}
	const d = /<path d="([^"]+)"/.exec( svg )?.[ 1 ];
	if ( ! d ) {
		throw new Error( `${ slug }: kein Pfad gefunden` );
	}
	const hex = brandColors[ slug ];
	if ( ! /^[0-9A-Fa-f]{6}$/.test( hex ?? '' ) ) {
		throw new Error( `${ slug }: keine Markenfarbe` );
	}
	icons[ `brand-${ slug }` ] = {
		g: 'brands',
		t: 'f',
		l: label,
		c: `#${ hex.toLowerCase() }`,
		e: clean( slug, [ [ 'path', { d } ] ] ),
	};
}

const faBrands = require( '@fortawesome/free-brands-svg-icons' );
for ( const [ slug, { label, icon, hex } ] of Object.entries( FA_BRANDS ) ) {
	const definition = faBrands[ icon ]?.icon;
	if ( ! definition ) {
		missing.push( `brand:${ slug }` );
		continue;
	}
	const [ width, height, , , path ] = definition;
	const paths = Array.isArray( path ) ? path : [ path ];
	brandColors[ slug ] = hex;
	icons[ `brand-${ slug }` ] = {
		g: 'brands',
		t: 'f',
		l: label,
		c: `#${ hex.toLowerCase() }`,
		v: `0 0 ${ width } ${ height }`,
		e: clean(
			slug,
			paths.map( ( d ) => [ 'path', { d } ] )
		),
	};
}

/**
 * Hex-Farbe in Kurzform, wenn möglich (Stylelint: color-hex-length).
 *
 * @param {string} hex Sechsstellig ohne `#`.
 * @return {string} `#rgb` oder `#rrggbb`.
 */
const cssHex = ( hex ) => {
	const value = hex.toLowerCase();
	const short = /^(.)\1(.)\2(.)\3$/.exec( value );
	return short
		? `#${ short[ 1 ] }${ short[ 2 ] }${ short[ 3 ] }`
		: `#${ value }`;
};

// Markenfarben für cf65/social-buttons (Option „Markenfarben“).
writeFileSync(
	join( 'src', 'blocks', 'social-buttons', '_brands.scss' ),
	`// Erzeugt von bin/icons.mjs – nicht von Hand bearbeiten.\n${ [
		...Object.keys( BRANDS ),
		...Object.keys( FA_BRANDS ),
	]
		.map(
			( slug ) =>
				`:where(.cf65-social-buttons__link--${ slug }) {\n\t--cf65-brand: ${ cssHex(
					brandColors[ slug ]
				) };\n}\n`
		)
		.join( '\n' ) }`
);

if ( missing.length ) {
	console.error( `[cf65-blocks] Fehlende Icons: ${ missing.join( ', ' ) }` );
	process.exit( 1 );
}

const version = ( pkg ) =>
	JSON.parse( readFileSync( join( MODULES, pkg, 'package.json' ), 'utf8' ) )
		.version;
const lucideVersion = version( 'lucide-static' );
const simpleVersion = version( 'simple-icons' );
const faVersion = version( '@fortawesome/free-brands-svg-icons' );

writeFileSync(
	join( OUT, 'icons.json' ),
	`${ JSON.stringify( {
		$comment: `Erzeugt von bin/icons.mjs aus lucide-static ${ lucideVersion } (ISC), simple-icons ${ simpleVersion } (CC0-1.0) und @fortawesome/free-brands-svg-icons ${ faVersion } (CC BY 4.0). Nicht von Hand bearbeiten. Lizenzen: LICENSES.md.`,
		icons,
	} ) }\n`
);

const lucideLicense = readFileSync(
	join( MODULES, 'lucide-static', 'LICENSE' ),
	'utf8'
);
writeFileSync(
	join( OUT, 'LICENSES.md' ),
	`# Lizenzen der mitgelieferten Icons

## Lucide ${ lucideVersion } (allgemeine Icons)

https://lucide.dev – ISC-Lizenz:

\`\`\`
${ lucideLicense.trim() }
\`\`\`

## Simple Icons ${ simpleVersion } (Marken-Icons, Präfix \`brand-\`)

https://simpleicons.org – CC0 1.0 Universal (gemeinfrei).

Die Marken-Icons sind Markenzeichen ihrer jeweiligen Inhaber. Ihre Verwendung
unterliegt deren Markenrichtlinien; sie sind hier nur zur Verlinkung auf die
jeweiligen Profile gedacht.

## Font Awesome Free ${ faVersion } (Marken: ${ Object.values( FA_BRANDS )
		.map( ( brand ) => brand.label )
		.join( ', ' ) })

Font Awesome Free by @fontawesome – https://fontawesome.com
Icons: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/),
siehe https://fontawesome.com/license/free. Übernommen wurden nur die
Pfaddaten der genannten Icons, unverändert.
`
);

console.log(
	`[cf65-blocks] ${ Object.keys( icons ).length } Icons nach ${ OUT } geschrieben.`
);
