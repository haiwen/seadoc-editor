import { Editor, Element, Text, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { WIKI_EDITOR } from '../constants';
import context from '../context';
import { findPath } from '../extension/core';
import { useScrollContext } from '../hooks/use-scroll-context';

export const getSelectionRange = () => {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange();
  }

  return null;
};

export const getCursorPosition = () => {
  let x = 0;
  let y = 0;
  let range = getSelectionRange();
  if (range) {
    const rect = range.getBoundingClientRect();
    const headerHeight = 100;
    x = rect.x || 0;
    y = rect.y - headerHeight + (rect.height - 24) / 2 || 0;
  }
  return { x: x, y: y };
};

export const useCursorPosition = () => {
  const scrollRef = useScrollContext();
  const { scrollTop = 0 } = scrollRef.current || {};
  let position = getCursorPosition();
  if (position.y !== 0) {
    position.y = position.y + scrollTop;
  }
  return position;
};

export const getAvatarUrl = () => {
  const server = context.getSetting('serviceUrl');
  const avatarUrl = `${server}/media/avatars/default.png`;
  return avatarUrl;
};

export const commentContainerWikiTransfer = (result, value) => {
  let newResult;
  const isWikiTitleIcon = document.querySelector('.wiki-page-icon-wrapper');
  const isWikiTitleCover = document.getElementById('wiki-page-cover');

  if (isWikiTitleIcon && !isWikiTitleCover) {
    // 90 is icon height in wiki
    newResult = result - value - 90;
  } else if (!isWikiTitleIcon && isWikiTitleCover) {
    // 203 is icon height in wiki
    newResult = result - value - 203;
  } else if (isWikiTitleIcon && isWikiTitleCover) {
    // 205 is icon and cover height in wiki
    newResult = result - value - 205;
  } else {
    newResult = result - value;
  }

  return newResult;
};

export const getElementCommentCountTop = (editor, element, scrollTop) => {
  let minY;
  const children = element.children || [];
  children.forEach(child => {
    const childDom = ReactEditor.toDOMNode(editor, child);

    // use child real dom
    const childRealDom = childDom.childNodes[0];
    const { y } = childRealDom ? childRealDom.getBoundingClientRect() : { y: 0 };
    if (!minY) minY = y;
    minY = Math.min(minY, y);
  });
  let resultY;
  resultY = minY - 100 + scrollTop; // 100: header height(56) + toolbar height(37)
  if (editor.editorType === WIKI_EDITOR) {
    // 55 is basic top title height in wiki
    resultY = commentContainerWikiTransfer(resultY, 55);
  }
  return resultY;
};

export const getSelectedElemIds = (editor) => {
  const { selection } = editor;
  if (!selection) return;
  const selectedElemId = [];

  const nodeEntries = Array.from(Editor.nodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest'
  }));

  for (const [node,] of nodeEntries) {
    selectedElemId.push(node.id);
  }

  return selectedElemId;
};

export const getCommentedTextsByElementId = (elementId, textCommentId) => {
  const container = document.querySelector(`[data-id='${elementId}']`);
  if (!container) return [];

  let targetDoms = container.querySelectorAll(`.sdoc_comment_${textCommentId}`);
  if (targetDoms.length === 0) {
    targetDoms = container.querySelectorAll(`.removed_sdoc_comment_${textCommentId}`);
  }
  const texts = [];

  targetDoms.forEach(dom => {
    texts.push(dom.textContent?.trim() || '');
  });
  return texts;
};

export const getDomById = (elementId) => {
  const container = document.querySelector(`[data-id='${elementId}']`);
  if (!container) return [];

  const lastCommentedDomWithMarks = container.querySelector('.comment');
  return lastCommentedDomWithMarks;
};

export const updateElementsAttrs = (activeElementIds, editor, text_comment_id) => {
  if (Array.isArray(activeElementIds)) {
    for (const elemId of activeElementIds) {
      const dom = document.querySelectorAll(`[data-id="${elemId}"]`)[0];
      if (!dom) continue;

      const domNode = ReactEditor.toSlateNode(editor, dom);
      const nodePath = findPath(editor, domNode);
      domNode.children.forEach((textNode, index) => {
        if (textNode.comment) {
          const textNodePath = [...nodePath, index];
          Transforms.setNodes(
            editor,
            { [`sdoc_comment_${text_comment_id}`]: true },
            {
              at: textNodePath,
              match: Text.isText,
              split: true,
            }
          );
        }
      });
    }
  }
};

export const updateCommentedElementsAttrs = (activeElementIds, editor, text_comment_id, resolved = false, isDeleteComment = false) => {
  if (Array.isArray(activeElementIds)) {
    Editor.withoutNormalizing(editor, () => {
      for (const elemId of activeElementIds) {
        // const { element } = elem;
        const dom = document.querySelector(`[data-id="${elemId}"]`);
        if (!dom) continue;

        const domNode = ReactEditor.toSlateNode(editor, dom);
        const domNodePath = findPath(editor, domNode);
        domNode.children.forEach((child, index) => {
          const childPath = [...domNodePath, index];
          if (Text.isText(child) && (`sdoc_comment_${text_comment_id}` in child)) {
            Transforms.unsetNodes(editor, [`sdoc_comment_${text_comment_id}`], {
              at: childPath,
              match: Text.isText,
            });

            !isDeleteComment && Transforms.setNodes(editor,
              { [`sdoc_comment_${text_comment_id}`]: resolved },
              {
                at: childPath,
                match: Text.isText,
              }
            );
          }
        });
      }
    });
  }
};

export const getPrimaryElementId = (detail) => {
  if (!detail) return null;
  let elementId;
  const { element_id, element_id_list = [] } = detail;
  if (element_id_list.length > 0) {
    elementId = element_id_list[0];
  } else {
    elementId = element_id;
  }
  return elementId;
};
