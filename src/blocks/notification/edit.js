import {
	InspectorControls,
	PanelColorSettings,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import InspectorTabs from '../../components/inspector-tabs';
import ResponsiveLength from '../../components/responsive-length';
import { withPanels } from '../../extensions/panels/definitions';
import { useUniqueId } from '../../extensions/unique-id';
import IconPicker from '../../icons/icon-picker';
import { IconSlot } from '../../icons/library';
import useBlockCss from '../../styles/use-block-css';
import metadata from './block.json';
import { CLOSE_CLASS, CONTENT_CLASS, notificationClassName } from './save';

const STYLE_MAP = withPanels( metadata ).supports.cf65.styles;

const TEMPLATE = [ [ 'cf65/text' ] ];

/** Standard-Icon je Typ; wird beim Typwechsel übernommen, solange das Icon nicht geändert wurde. */
export const TYPE_ICONS = {
	info: 'info',
	success: 'circle-check',
	warning: 'triangle-exclamation-point',
	error: 'circle-x',
};

const TYPE_OPTIONS = [
	{ label: __( 'Info', 'cf65-blocks' ), value: 'info' },
	{ label: __( 'Erfolg', 'cf65-blocks' ), value: 'success' },
	{ label: __( 'Warnung', 'cf65-blocks' ), value: 'warning' },
	{ label: __( 'Fehler', 'cf65-blocks' ), value: 'error' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { uniqueId, type, icon, showIcon, dismissible } = attributes;

	useUniqueId( clientId, uniqueId, setAttributes );

	const css = useBlockCss( uniqueId, STYLE_MAP, attributes );
	const blockProps = useBlockProps( {
		className: notificationClassName( attributes ),
		role: 'note',
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: CONTENT_CLASS },
		{ template: TEMPLATE, templateLock: false }
	);
	const props = { attributes, setAttributes };

	const setType = ( next ) => {
		const update = { type: next };
		if ( ! icon || icon === TYPE_ICONS[ type ] ) {
			update.icon = TYPE_ICONS[ next ];
		}
		setAttributes( update );
	};

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					layout={
						<PanelBody title={ __( 'Hinweis', 'cf65-blocks' ) }>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Typ', 'cf65-blocks' ) }
								help={ __(
									'Bestimmt Standardfarben und -icon.',
									'cf65-blocks'
								) }
								value={ type }
								options={ TYPE_OPTIONS }
								onChange={ setType }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Icon anzeigen', 'cf65-blocks' ) }
								checked={ showIcon }
								onChange={ ( next ) =>
									setAttributes( { showIcon: next } )
								}
							/>
							{ showIcon && (
								<IconPicker
									label={ __( 'Icon', 'cf65-blocks' ) }
									value={ icon }
									onChange={ ( next ) =>
										setAttributes( { icon: next } )
									}
								/>
							) }
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Schliessen-Button',
									'cf65-blocks'
								) }
								help={ __(
									'Besucher können den Hinweis ausblenden; beim nächsten Seitenaufruf erscheint er wieder.',
									'cf65-blocks'
								) }
								checked={ dismissible }
								onChange={ ( next ) =>
									setAttributes( { dismissible: next } )
								}
							/>
							{ dismissible && (
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __(
										'Beschriftung für Screenreader',
										'cf65-blocks'
									) }
									value={ attributes.closeLabel }
									onChange={ ( next ) =>
										setAttributes( { closeLabel: next } )
									}
								/>
							) }
						</PanelBody>
					}
					style={
						<>
							<PanelBody title={ __( 'Icon', 'cf65-blocks' ) }>
								<ResponsiveLength
									{ ...props }
									attribute="iconSize"
									label={ __( 'Icon-Grösse', 'cf65-blocks' ) }
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Farben', 'cf65-blocks' ) }
								colorSettings={ [
									{
										label: __( 'Akzent', 'cf65-blocks' ),
										value: attributes.accentColor,
										onChange: ( next ) =>
											setAttributes( {
												accentColor: next,
											} ),
									},
									{
										label: __( 'Icon', 'cf65-blocks' ),
										value: attributes.iconColor,
										onChange: ( next ) =>
											setAttributes( {
												iconColor: next,
											} ),
									},
									{
										label: __( 'Text', 'cf65-blocks' ),
										value: attributes.textColor,
										onChange: ( next ) =>
											setAttributes( {
												textColor: next,
											} ),
									},
								] }
							/>
						</>
					}
				/>
			</InspectorControls>

			{ css && <style>{ css }</style> }
			<div { ...blockProps }>
				{ showIcon && <IconSlot name={ icon } edit /> }
				<div { ...innerBlocksProps } />
				{ dismissible && (
					<span className={ CLOSE_CLASS } aria-hidden="true">
						<IconSlot name="x" edit />
					</span>
				) }
			</div>
		</>
	);
}
