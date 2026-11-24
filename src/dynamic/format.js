/**
 * RichText-Format „Dynamischer Wert“ für Blöcke mit
 * `supports.cf65.inlineDynamic` (Text, Überschrift, Button).
 *
 * - Werkzeugleiste: fügt einen Platzhalter mit dem Feldnamen ein.
 * - Cursor im Platzhalter: Popover mit Feld, Vorschau (aktueller Beitrag)
 *   und „Entfernen“.
 */
import {
	RichTextToolbarButton,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { Button, Popover } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerFormatType, useAnchor } from '@wordpress/rich-text';

import { normalizeBinding } from './binding';
import DynamicControl from './dynamic-control';
import { useDynamicFields, useDynamicPreview } from './hooks';
import {
	FORMAT_ATTRIBUTES,
	FORMAT_CLASS,
	FORMAT_NAME,
	insertDynamic,
	removeToken,
	supportsInlineDynamic,
} from './inline';

const settings = {
	name: FORMAT_NAME,
	title: __( 'Dynamischer Wert', 'cf65-blocks' ),
	tagName: 'span',
	className: FORMAT_CLASS,
	attributes: FORMAT_ATTRIBUTES,
};

/**
 * Feldname zu einer Bindung aus der Feldliste.
 *
 * @param {Object|null} binding Bindung.
 * @param {Object}      fields  Zustand aus useDynamicFields.
 * @return {string} Anzeigename oder Feldkennung.
 */
function fieldLabel( binding, fields ) {
	if ( ! binding ) {
		return '';
	}
	const provider = fields.value?.providers?.find(
		( group ) => group.id === binding.provider
	);
	const field = provider?.fields?.find(
		( entry ) => entry.name === binding.field
	);
	return field?.label ?? binding.field;
}

/**
 * Infos zum Platzhalter unter dem Cursor.
 *
 * @param {Object}     props
 * @param {Object}     props.binding  Bindung.
 * @param {Object}     props.post     `{ postId, postType }` des Editors.
 * @param {() => void} props.onRemove Platzhalter entfernen.
 * @return {Element} Inhalt.
 */
function TokenInfo( { binding, post, onRemove } ) {
	const fields = useDynamicFields( 'text', post.postType );
	const preview = useDynamicPreview( binding, 'text', post );

	let previewText = __( 'Kein Wert im aktuellen Beitrag', 'cf65-blocks' );
	if ( preview.status === 'loading' ) {
		previewText = __( 'Wird geladen …', 'cf65-blocks' );
	} else if ( typeof preview.value === 'string' ) {
		previewText = preview.value;
	}

	return (
		<div className="cf65-dynamic-popover">
			<p className="cf65-dynamic-popover__title">
				{ fieldLabel( binding, fields ) }
			</p>
			<p className="cf65-dynamic-popover__preview">
				{ __( 'Vorschau:', 'cf65-blocks' ) } { previewText }
			</p>
			<p className="cf65-dynamic-popover__help">
				{ __(
					'Im Frontend steht der Wert des jeweiligen Beitrags, im Query Loop pro Eintrag.',
					'cf65-blocks'
				) }
			</p>
			<Button variant="secondary" size="small" onClick={ onRemove }>
				{ __( 'Entfernen', 'cf65-blocks' ) }
			</Button>
		</div>
	);
}

function FormatEdit( {
	isActive,
	activeAttributes,
	value,
	onChange,
	contentRef,
} ) {
	const enabled = useSelect(
		( select ) =>
			supportsInlineDynamic(
				getBlockType(
					select( blockEditorStore ).getSelectedBlock()?.name ?? ''
				)
			),
		[]
	);
	const post = useSelect( ( select ) => {
		const editor = select( editorStore );
		const postId = editor?.getCurrentPostId?.();
		return {
			postId: Number.isInteger( postId ) ? postId : 0,
			postType: editor?.getCurrentPostType?.() ?? '',
		};
	}, [] );
	const [ adding, setAdding ] = useState( false );
	const anchor = useAnchor( {
		editableContentElement: contentRef?.current,
		settings,
	} );

	if ( ! enabled ) {
		return null;
	}

	const binding = isActive ? normalizeBinding( activeAttributes ) : null;

	return (
		<>
			<RichTextToolbarButton
				icon="database"
				title={ settings.title }
				onClick={ () => setAdding( true ) }
				isActive={ isActive }
			/>
			{ adding && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					onClose={ () => setAdding( false ) }
				>
					<div className="cf65-dynamic-popover">
						<DynamicControl
							kind="text"
							postType={ post.postType }
							emptyLabel={ __( 'Feld wählen …', 'cf65-blocks' ) }
							help={ __(
								'Fügt einen Platzhalter ein. Im Frontend steht dort der Wert des Beitrags.',
								'cf65-blocks'
							) }
							onChange={ ( next, label ) => {
								if ( next ) {
									onChange(
										insertDynamic( value, next, label )
									);
								}
								setAdding( false );
							} }
						/>
					</div>
				</Popover>
			) }
			{ binding && ! adding && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					focusOnMount={ false }
				>
					<TokenInfo
						binding={ binding }
						post={ post }
						onRemove={ () => onChange( removeToken( value ) ) }
					/>
				</Popover>
			) }
		</>
	);
}

/**
 * Registriert das Format (einmal, im Editor-Skript).
 */
export function registerDynamicFormat() {
	registerFormatType( FORMAT_NAME, { ...settings, edit: FormatEdit } );
}
