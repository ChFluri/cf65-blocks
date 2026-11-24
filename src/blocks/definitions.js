/**
 * Alle cf65-Blöcke ohne Editor-UI (metadata, save, deprecated) – für Tests,
 * die gespeichertes Markup prüfen (Fixtures, Recovery).
 *
 * Neuer Block → hier eintragen; der Fixture-Test verlangt dann eine Fixture.
 */
import buttonMetadata from './button/block.json';
import buttonDeprecated from './button/deprecated';
import buttonSave from './button/save';
import columnMetadata from './column/block.json';
import columnDeprecated from './column/deprecated';
import columnSave from './column/save';
import columnsMetadata from './columns/block.json';
import columnsDeprecated from './columns/deprecated';
import columnsSave from './columns/save';
import headingMetadata from './heading/block.json';
import headingDeprecated from './heading/deprecated';
import headingSave from './heading/save';
import imageMetadata from './image/block.json';
import imageDeprecated from './image/deprecated';
import imageSave from './image/save';
import textMetadata from './text/block.json';
import textDeprecated from './text/deprecated';
import textSave from './text/save';
import spacerMetadata from './spacer/block.json';
import spacerDeprecated from './spacer/deprecated';
import spacerSave from './spacer/save';
import dividerMetadata from './divider/block.json';
import dividerDeprecated from './divider/deprecated';
import dividerSave from './divider/save';
import separatorMetadata from './separator/block.json';
import separatorDeprecated from './separator/deprecated';
import separatorSave from './separator/save';
import subtitleMetadata from './subtitle/block.json';
import subtitleDeprecated from './subtitle/deprecated';
import subtitleSave from './subtitle/save';
import blockquoteMetadata from './blockquote/block.json';
import blockquoteDeprecated from './blockquote/deprecated';
import blockquoteSave from './blockquote/save';
import { withPanels } from '../extensions/panels/definitions';

const DEFINITIONS = [
	{
		metadata: headingMetadata,
		save: headingSave,
		deprecated: headingDeprecated,
	},
	{ metadata: textMetadata, save: textSave, deprecated: textDeprecated },
	{
		metadata: buttonMetadata,
		save: buttonSave,
		deprecated: buttonDeprecated,
	},
	{ metadata: imageMetadata, save: imageSave, deprecated: imageDeprecated },
	{
		metadata: columnsMetadata,
		save: columnsSave,
		deprecated: columnsDeprecated,
	},
	{
		metadata: columnMetadata,
		save: columnSave,
		deprecated: columnDeprecated,
	},
	{
		metadata: spacerMetadata,
		save: spacerSave,
		deprecated: spacerDeprecated,
	},
	{
		metadata: dividerMetadata,
		save: dividerSave,
		deprecated: dividerDeprecated,
	},
	{
		metadata: separatorMetadata,
		save: separatorSave,
		deprecated: separatorDeprecated,
	},
	{
		metadata: subtitleMetadata,
		save: subtitleSave,
		deprecated: subtitleDeprecated,
	},
	{
		metadata: blockquoteMetadata,
		save: blockquoteSave,
		deprecated: blockquoteDeprecated,
	},
];

/** Mit gemeinsamen Panels ergänzt (wie bei der Registrierung auf dem Server). */
export const BLOCK_DEFINITIONS = DEFINITIONS.map( ( definition ) => ( {
	...definition,
	metadata: withPanels( definition.metadata ),
} ) );

/**
 * Registriert alle Blöcke mit Dummy-Edit (idempotent).
 *
 * @param {Object} blocksApi `@wordpress/blocks` (getBlockType, registerBlockType).
 */
export function registerDefinitions( blocksApi ) {
	for ( const { metadata, save, deprecated } of BLOCK_DEFINITIONS ) {
		if ( ! blocksApi.getBlockType( metadata.name ) ) {
			blocksApi.registerBlockType( metadata, {
				edit: () => null,
				save,
				deprecated,
			} );
		}
	}
}
