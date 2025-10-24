import { Editor, Transforms, Element } from '@seafile/slate';
import slugid from 'slugid';
import { BLOCKQUOTE, CHECK_LIST_ITEM, IMAGE, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST, CODE_BLOCK, TABLE, CALL_OUT, MULTI_COLUMN } from '../../constants';
import { focusEditor, getNodeType, getSelectedNodeEntryByType } from '../../core';
import { isEmptyNode } from '../paragraph/helper';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  const [nodeEntry] = Editor.nodes(editor, {
    match: n => {
      const type = getNodeType(n);

      // Only available for p and blockquote
      if (type === PARAGRAPH) return true;
      if (type === BLOCKQUOTE) return true;
      if (type === UNORDERED_LIST) return true;
      if (type === ORDERED_LIST) return true;
      if (type === CHECK_LIST_ITEM) return true;
      if (type && type.startWith && type.startWith('header')) return true;
      if (type === IMAGE) return true;

      return false;
    },
    universal: true,
    mode: 'highest', // Match top level
  });

  // Match to p blockquote, do not disable
  if (nodeEntry) {
    return false;
  }
  // 未匹配到，则禁用
  return true;
};

export const getBlockQuoteType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => getNodeType(n) === BLOCKQUOTE,
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  return getNodeType(n);
};

// If cursor is in callout, insert block quote in callout, otherwise wrap block quote directly
export const setBlockQuoteType = (editor, active) => {
  if (!active) {
    const blockquoteNode = {
      id: slugid.nice(),
      type: BLOCKQUOTE,
    };
    // Insert block quote into column node if in multi_column node
    const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, MULTI_COLUMN);
    if (currentMultiColumnEntry) {
      Transforms.wrapNodes(editor, blockquoteNode, {
        mode: 'lowest',
        match: n => {
          if (n.type === CALL_OUT) return false;
          return Element.isElement(n) && Editor.isBlock(editor, n);
        }
      });
      return;
    }

    Transforms.wrapNodes(editor, blockquoteNode, {
      mode: 'highest',
      match: n => {
        if (n.type === CALL_OUT) return false;
        return Element.isElement(n) && Editor.isBlock(editor, n);
      },
    });
  } else {
    const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, MULTI_COLUMN);
    if (currentMultiColumnEntry) {
      const blockquoteEntry = Editor.above(editor, {
        at: editor.selection.anchor.path,
        match: (n) => n.type === BLOCKQUOTE,
      });
      blockquoteEntry && Transforms.unwrapNodes(editor, {
        mode: 'highest',
        at: blockquoteEntry[1],
        match: (n) => n.type === BLOCKQUOTE,
      });
      return;
    }

    Transforms.unwrapNodes(editor, {
      mode: 'highest',
      match: (n) => {
        if (n.type === CALL_OUT) return false;
        return Element.isElement(n) && Editor.isBlock(editor, n);
      },
    });
  }
};

export const getFormattedElements = (data) => {
  const elements = [];
  let arr = [];
  data.forEach((item) => {
    if ([CODE_BLOCK, TABLE, BLOCKQUOTE].includes(item?.type)) {
      // Insert quote block
      if (arr.length !== 0) {
        const blockquoteNode = { id: slugid.nice(), type: BLOCKQUOTE };
        blockquoteNode['children'] = arr;
        elements.push(blockquoteNode);
        arr = [];
      }
      // Merge quote block
      let preElement = elements[elements.length - 1];
      if (preElement?.type === BLOCKQUOTE && item?.type === BLOCKQUOTE) {
        elements[elements.length - 1] = { ...preElement, children: [...preElement.children, ...item.children] };
      } else {
        elements.push(item);
      }
    } else {
      arr.push(item);
    }
  });
  return elements;
};

export const getFormattedRestElements = (data) => {
  const restElements = data.slice(0);
  data.forEach((item, index) => {
    if (isEmptyNode(item)) {
      restElements.splice(index, 1);
    }

    // Split quote block
    if (item?.type === BLOCKQUOTE) {
      restElements.splice(index, 1, ...item.children);
    }
  });
  return restElements;
};

export const insertBlockQuote = (editor, active) => {
  setBlockQuoteType(editor, active);
  focusEditor(editor);
};
