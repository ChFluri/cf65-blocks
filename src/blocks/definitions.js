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
import iconMetadata from './icon/block.json';
import iconDeprecated from './icon/deprecated';
import iconSave from './icon/save';
import iconLabelMetadata from './icon-label/block.json';
import iconLabelDeprecated from './icon-label/deprecated';
import iconLabelSave from './icon-label/save';
import iconListMetadata from './icon-list/block.json';
import iconListDeprecated from './icon-list/deprecated';
import iconListSave from './icon-list/save';
import iconListItemMetadata from './icon-list-item/block.json';
import iconListItemDeprecated from './icon-list-item/deprecated';
import iconListItemSave from './icon-list-item/save';
import iconButtonMetadata from './icon-button/block.json';
import iconButtonDeprecated from './icon-button/deprecated';
import iconButtonSave from './icon-button/save';
import socialButtonsMetadata from './social-buttons/block.json';
import socialButtonsDeprecated from './social-buttons/deprecated';
import socialButtonsSave from './social-buttons/save';
import cardMetadata from './card/block.json';
import cardDeprecated from './card/deprecated';
import cardSave from './card/save';
import heroMetadata from './hero/block.json';
import heroDeprecated from './hero/deprecated';
import heroSave from './hero/save';
import featureMetadata from './feature/block.json';
import featureDeprecated from './feature/deprecated';
import featureSave from './feature/save';
import featureGridMetadata from './feature-grid/block.json';
import featureGridDeprecated from './feature-grid/deprecated';
import featureGridSave from './feature-grid/save';
import callToActionMetadata from './call-to-action/block.json';
import callToActionDeprecated from './call-to-action/deprecated';
import callToActionSave from './call-to-action/save';
import notificationMetadata from './notification/block.json';
import notificationDeprecated from './notification/deprecated';
import notificationSave from './notification/save';
import iconBoxMetadata from './icon-box/block.json';
import iconBoxDeprecated from './icon-box/deprecated';
import iconBoxSave from './icon-box/save';
import imageBoxMetadata from './image-box/block.json';
import imageBoxDeprecated from './image-box/deprecated';
import imageBoxSave from './image-box/save';
import numberBoxMetadata from './number-box/block.json';
import numberBoxDeprecated from './number-box/deprecated';
import numberBoxSave from './number-box/save';
import priceMetadata from './price/block.json';
import priceDeprecated from './price/deprecated';
import priceSave from './price/save';
import pricingBoxMetadata from './pricing-box/block.json';
import pricingBoxDeprecated from './pricing-box/deprecated';
import pricingBoxSave from './pricing-box/save';
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
	{
		metadata: iconMetadata,
		save: iconSave,
		deprecated: iconDeprecated,
	},
	{
		metadata: iconLabelMetadata,
		save: iconLabelSave,
		deprecated: iconLabelDeprecated,
	},
	{
		metadata: iconListMetadata,
		save: iconListSave,
		deprecated: iconListDeprecated,
	},
	{
		metadata: iconListItemMetadata,
		save: iconListItemSave,
		deprecated: iconListItemDeprecated,
	},
	{
		metadata: iconButtonMetadata,
		save: iconButtonSave,
		deprecated: iconButtonDeprecated,
	},
	{
		metadata: socialButtonsMetadata,
		save: socialButtonsSave,
		deprecated: socialButtonsDeprecated,
	},
	{
		metadata: cardMetadata,
		save: cardSave,
		deprecated: cardDeprecated,
	},
	{
		metadata: heroMetadata,
		save: heroSave,
		deprecated: heroDeprecated,
	},
	{
		metadata: featureMetadata,
		save: featureSave,
		deprecated: featureDeprecated,
	},
	{
		metadata: featureGridMetadata,
		save: featureGridSave,
		deprecated: featureGridDeprecated,
	},
	{
		metadata: callToActionMetadata,
		save: callToActionSave,
		deprecated: callToActionDeprecated,
	},
	{
		metadata: notificationMetadata,
		save: notificationSave,
		deprecated: notificationDeprecated,
	},
	{
		metadata: iconBoxMetadata,
		save: iconBoxSave,
		deprecated: iconBoxDeprecated,
	},
	{
		metadata: imageBoxMetadata,
		save: imageBoxSave,
		deprecated: imageBoxDeprecated,
	},
	{
		metadata: numberBoxMetadata,
		save: numberBoxSave,
		deprecated: numberBoxDeprecated,
	},
	{
		metadata: priceMetadata,
		save: priceSave,
		deprecated: priceDeprecated,
	},
	{
		metadata: pricingBoxMetadata,
		save: pricingBoxSave,
		deprecated: pricingBoxDeprecated,
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
