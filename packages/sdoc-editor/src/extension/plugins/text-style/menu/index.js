import React, { Fragment, useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { Editor } from '@seafile/slate';
import PropTypes from 'prop-types';
import CommentContextMenu from '../../../../comment/components/comment-context-menu';
import { DOCUMENT_PLUGIN_EDITOR, INTERNAL_EVENT, WIKI_EDITOR } from '../../../../constants';
import context from '../../../../context';
import { useColorContext } from '../../../../hooks/use-color-context';
import EventBus from '../../../../utils/event-bus';
import { eventStopPropagation } from '../../../../utils/mouse-event';
import { MenuItem, ColorMenu, MoreDropdown } from '../../../commons';
import { TEXT_STYLE, TEXT_STYLE_MAP, TEXT_STYLE_MORE, MENUS_CONFIG_MAP, LINK, ELEMENT_TYPE } from '../../../constants';
import { focusEditor, getSelectedNodeByType } from '../../../core';
import { AIContextMenu } from '../../ai/ai-menu';
import { getFontSize, setFontSize } from '../../font/helpers';
import FontSizeScale from '../../font/menu/font-size/font-size-scale';
import { unWrapLinkNode } from '../../link/helpers';
import { getValue, isMenuDisabled, addMark, removeMark } from '../helpers';

const TextStyleMenuList = ({ editor, t, isRichEditor, className, idPrefix, readonly }) => {
  let selectedFontSize = getFontSize(editor);
  let selectedFontSizeValue = selectedFontSize;
  const enableSeafileAI = context.getSetting('enableSeafileAI');
  const { lastUsedFontColor, updateLastUsedFontColor, lastUsedHighlightColor, updateLastUsedHighlightColor } = useColorContext();

  const isActive = useCallback((type) => {
    const isMark = getValue(editor, type);
    return !!isMark;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const isDisabled = useCallback(() => {
    return isMenuDisabled(editor, readonly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, readonly]);

  const isSelectedSeaTableColumn = useCallback(() => {
    // TODO: seatable_column
    const entery = getSelectedNodeByType(editor, 'seatable_column');
    return !!entery;
  }, [editor]);

  const openLinkDialog = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, editor });
  }, [editor]);

  const onMouseDown = useCallback((event, type) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled()) return;
    const active = isActive(type);

    if (type === LINK) {
      if (active) {
        unWrapLinkNode(editor);
      } else {
        openLinkDialog();
      }
      return;
    }

    if (active) {
      removeMark(editor, type);
    } else {
      addMark(editor, type);
    }
    focusEditor(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const setColor = useCallback((type, color) => {
    Editor.addMark(editor, type, color);
    focusEditor(editor);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const increaseFontSize = useCallback((event) => {
    eventStopPropagation(event);
    setFontSize(editor, selectedFontSizeValue + 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, selectedFontSize, selectedFontSizeValue]);

  const reduceFontSize = useCallback((event) => {
    eventStopPropagation(event);
    const nextFontSize = selectedFontSizeValue - 1;
    if (nextFontSize < 1) return;
    setFontSize(editor, nextFontSize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, selectedFontSize, selectedFontSizeValue]);

  const getTextStyleList = useCallback((key) => {
    return MENUS_CONFIG_MAP[key].map(item => {
      let disable = isDisabled();
      const disableTypes = [
        TEXT_STYLE_MAP.CODE,
        TEXT_STYLE_MAP.LINK,
        TEXT_STYLE_MAP.SUPERSCRIPT,
        TEXT_STYLE_MAP.SUBSCRIPT
      ];
      if (disableTypes.includes(item.type)) {
        disable = isSelectedSeaTableColumn() ? true : disable;
      }
      let itemProps = {
        isRichEditor,
        className,
        ariaLabel: item?.ariaLabel,
        disabled: disable,
        isActive: isActive(item.type),
        onMouseDown: item.isColor ? () => { } : onMouseDown,
      };
      if (item.isColor) {
        itemProps['setColor'] = (color) => setColor(item.type, color);
        itemProps['defaultColorTip'] = item.type === TEXT_STYLE_MAP.COLOR ? t('Default') : '';
        itemProps['lastUsedColor'] = item.type === TEXT_STYLE_MAP.COLOR ? lastUsedFontColor : lastUsedHighlightColor;
        itemProps['updateLastUsedColor'] = item.type === TEXT_STYLE_MAP.COLOR ? updateLastUsedFontColor : updateLastUsedHighlightColor;
      }
      return { ...itemProps, ...item, id: idPrefix ? `${idPrefix}_${item.id}` : item.id };
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, lastUsedFontColor, lastUsedHighlightColor, readonly]);

  let list = getTextStyleList(TEXT_STYLE);
  const dropdownList = getTextStyleList(TEXT_STYLE_MORE);

  return (
    <>
      {list.map((itemProps, index) => {
        const Component = itemProps.isColor ? ColorMenu : MenuItem;
        return (
          <Component key={index} {...itemProps} />
        );
      })}
      <MoreDropdown>
        {dropdownList.map((itemProps, index) => <MenuItem key={index} {...itemProps} />)}
        <FontSizeScale disabled={isDisabled()} onClick={increaseFontSize} id="sdoc-increase-font-size" tipMessage={t('Increase_font_size')}>
          <i className="sdocfont sdoc-increase-font-size"></i>
        </FontSizeScale>
        <FontSizeScale disabled={isDisabled()} onClick={reduceFontSize} id="sdoc-reduce-font-size" tipMessage={t('Reduce_font_size')}>
          <i className="sdocfont sdoc-reduce-font-size"></i>
        </FontSizeScale>
      </MoreDropdown>
      {idPrefix && ![DOCUMENT_PLUGIN_EDITOR].includes(editor.editorType) && <CommentContextMenu />}
      {idPrefix && enableSeafileAI && <AIContextMenu isRichEditor={isRichEditor} />}
    </>
  );

};

TextStyleMenuList.propTypes = {
  readonly: PropTypes.bool,
  idPrefix: PropTypes.string, // Distinguish the target attribute of multiple tooltips
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
  isCommentEditor: PropTypes.bool, // Apply for comment editor
};

export default withTranslation('sdoc-editor')(TextStyleMenuList);
