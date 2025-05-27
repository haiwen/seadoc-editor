import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { MenuItem } from '../../../commons';
import { TEXT_STYLE, MENUS_CONFIG_MAP } from '../../../constants';
import { BOLD, ITALIC } from '../../../constants/menus-config';
import { focusEditor } from '../../../core';
import { getValue, isMenuDisabled, addMark, removeMark } from '../helpers';

const CommentEditorTextStyleMenuList = ({ editor, isRichEditor, className, idPrefix, readonly }) => {
  const isActive = useCallback((type) => {
    const isMark = getValue(editor, type);
    return !!isMark;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const isDisabled = useCallback(() => {
    return isMenuDisabled(editor, readonly);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, readonly]);

  const onMouseDown = useCallback((event, type) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled()) return;
    const active = isActive(type);
    if (active) {
      removeMark(editor, type);
    } else {
      addMark(editor, type);
    }
    focusEditor(editor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const getTextStyleList = useCallback(() => {
    const styleMenus = MENUS_CONFIG_MAP[TEXT_STYLE];
    const commentMenus = styleMenus.filter(item => [BOLD, ITALIC].includes(item.id));
    return commentMenus.map(item => {
      let itemProps = {
        isRichEditor,
        className,
        disabled: isDisabled(),
        isActive: isActive(item.type),
        onMouseDown: onMouseDown,
      };
      return { ...itemProps, ...item, id: idPrefix ? `${idPrefix}_${item.id}` : item.id };
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, readonly]);

  const list = getTextStyleList();

  return (
    <>
      {list.map((itemProps, index) => <MenuItem key={index} {...itemProps} />)}
    </>
  );

};

CommentEditorTextStyleMenuList.propTypes = {
  readonly: PropTypes.bool,
  idPrefix: PropTypes.string, // Distinguish the target attribute of multiple tooltips
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
  isCommentEditor: PropTypes.bool, // Apply for comment editor
};

export default withTranslation('sdoc-editor')(CommentEditorTextStyleMenuList);
