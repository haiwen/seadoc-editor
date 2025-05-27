import React from 'react';
import { Node, Range } from '@seafile/slate';
import { ReactEditor, useSelected, useSlateStatic } from '@seafile/slate-react';
import { COMMENT_EDITOR } from '../../../constants';
import { ELEMENT_TYPE } from '../../constants';
import { getTopLevelBlockNode } from '../../core';
import Placeholder from '../header/placeholder';
import { isEmptyNode } from './helper';

const PLACEHOLDER = 'Enter_text_or_press_forward_slash_to_insert_element';

const Paragraph = ({ isComposing, element, attributes, children, className, placeholder = PLACEHOLDER }) => {
  const { indent } = element;
  const editor = useSlateStatic();
  const isSelected = useSelected();
  let isShowPlaceHolder = false;

  if (editor.children.length === 1) {
    const node = editor.children[0];
    const isChildEmpty = isEmptyNode(node);
    const isParagraphEmpty = Node.string(element) === '';
    isShowPlaceHolder = isChildEmpty && isParagraphEmpty && !isComposing;
  }

  if (editor.children.length === 2 && editor.children[0].type.startsWith('header')) {
    const node = editor.children[1];
    isShowPlaceHolder = Node.string(element) === '' && node?.id === element?.id && !isComposing;
  }

  const isCommentEditor = editor.editorType === COMMENT_EDITOR;
  if (
    !isCommentEditor &&
    isSelected &&
    Range.isCollapsed(editor.selection) &&
    isEmptyNode(element) &&
    ReactEditor.findPath(editor, element).length === 1 &&
    !isComposing
  ) {
    isShowPlaceHolder = true;
  }

  // Distinguish whether paragraph node is in multi_column node
  const aboveNodeEntry = isSelected && getTopLevelBlockNode(editor);
  if (
    !isComposing &&
    (aboveNodeEntry && aboveNodeEntry[0].type === ELEMENT_TYPE.MULTI_COLUMN) &&
    isSelected &&
    isEmptyNode(element) &&
    Range.isCollapsed(editor.selection)
  ) {
    isShowPlaceHolder = true;
  }

  const style = {
    textAlign: element.align,
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: indent ? '28px' : '',
  };

  let customAttributes = attributes;
  if (element.id === 'document-render-complete') {
    customAttributes['id'] = element.id;
  }

  return (
    <div
      data-id={element.id}
      {...customAttributes}
      style={{ position: isShowPlaceHolder ? 'relative' : '', ...style }}
      className={className}
    >
      {children}
      {isShowPlaceHolder && <Placeholder title={placeholder} top={isCommentEditor ? 0 : 5} />}
    </div>
  );
};

export const renderParagraph = (props) => {
  return <Paragraph {...props} />;
};
