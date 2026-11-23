/**
 * Playwright-Konfiguration auf Basis der WordPress-Standardkonfiguration.
 * Erwartet eine laufende wp-env-Testinstanz (Port 8889).
 */
const { defineConfig } = require( '@playwright/test' );
const baseConfig = require( '@wordpress/scripts/config/playwright.config.js' );

module.exports = defineConfig( {
	...baseConfig,
	testDir: './specs',
} );
