import { Transforms, Editor, Element, Path } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import slugid from 'slugid';
import { WIKI_EDITOR } from '../../../constants';
import { replacePastedDataId } from '../../../node-id/helpers';
import { normalizeCopyNodes } from '../../../utils/document-utils';
import {
  ORDERED_LIST, UNORDERED_LIST, PARAGRAPH, CHECK_LIST_ITEM, TABLE, CODE_BLOCK, BLOCKQUOTE,
  LIST_ITEM_CORRELATION_TYPE, ADD_POSITION_OFFSET_TYPE, INSERT_POSITION, ELEMENT_TYPE, CALL_OUT,
  SIDE_TRANSFORM_MENUS_CONFIG, LIST_ITEM_SUPPORTED_TRANSFORMATION, HEADERS, VIDEO,
  MULTI_COLUMN, MULTI_COLUMN_TYPE, IMAGE_BLOCK, WHITEBOARD, TWO_COLUMN
} from '../../constants';
import { generateEmptyElement, findPath, isMultiLevelList, isTopLevelListItem, getNode, focusEditor, getAboveNode, getTopLevelBlockNode } from '../../core';
import { setBlockQuoteType } from '../../plugins/blockquote/helpers';
import { unwrapCallout, wrapCallout } from '../../plugins/callout/helper';
import { convertToCheck } from '../../plugins/check-list/helpers';
import { setClipboardCodeBlockData } from '../../plugins/code-block/helpers';
import { setHeaderType } from '../../plugins/header/helpers';
import { generateEmptyList, generateListItem } from '../../plugins/list/model';
import { toggleList } from '../../plugins/list/transforms';
import { generateEmptyMultiColumn } from '../../plugins/multi-column/helper';
import { EMPTY_SELECTED_RANGE } from '../../plugins/table/constants';

export const onSetNodeType = (editor, element, type) => {
  const { selection } = editor;
  if (!type) return;

  if (type === CALL_OUT) {
    if (IMAGE_BLOCK === element.type) {
      Transforms.setNodes(editor, { type: PARAGRAPH });
    }
    wrapCallout(editor);
    return;
  }

  if ([ORDERED_LIST, UNORDERED_LIST].includes(type)) {
    if ([IMAGE_BLOCK].includes(element.type)) return;

    toggleList(editor, type);
    const path = findPath(editor, element);
    const [targetNode,] = Editor.node(editor, [path[0]]) || [];
    if ([MULTI_COLUMN, BLOCKQUOTE].includes(targetNode.type)) {
      if (targetNode.type === BLOCKQUOTE) {
        setBlockQuoteType(editor, true);
      } else {
        const currentNodeInColumn = getNode(editor, selection.anchor.path.slice(0, 3));
        if ([BLOCKQUOTE].includes(currentNodeInColumn.type)) {
          setBlockQuoteType(editor, true);
        }
      }
    }
    return;
  }

  if ([PARAGRAPH, ...HEADERS].includes(type)) {
    // Transform list-item, blockquote, callout to paragraph or header
    const topNodeType = getTopLevelBlockNode(editor)[0]?.type;
    if (topNodeType === MULTI_COLUMN) {
      const currentNodeInColumn = getNode(editor, selection.anchor.path.slice(0, 3));
      // Callout, List-item, Blockquote in multi_column
      if ([CALL_OUT].includes(currentNodeInColumn.type)) {
        unwrapCallout(editor);
        return;
      }

      if ([ORDERED_LIST, UNORDERED_LIST].includes(currentNodeInColumn.type)) {
        toggleList(editor, currentNodeInColumn.type);
        if ([...HEADERS].includes(type)) {
          setHeaderType(editor, type);
        }
        return;
      }

      if ([BLOCKQUOTE].includes(currentNodeInColumn.type)) {
        if ([...HEADERS].includes(type)) {
          setHeaderType(editor, type);
        }
        setBlockQuoteType(editor, true);
        return;
      }
    } else {
      // List-item, blockquote, callout is top node
      if ([ORDERED_LIST, UNORDERED_LIST].includes(topNodeType)) {
        toggleList(editor, topNodeType);
        if ([...HEADERS].includes(type)) {
          setHeaderType(editor, type);
        }
        return;
      }

      if ([BLOCKQUOTE].includes(topNodeType)){
        if ([...HEADERS].includes(type)) {
          setHeaderType(editor, type);
        }
        setBlockQuoteType(editor, true);
        return;
      }

      if ([CALL_OUT].includes(topNodeType)){
        unwrapCallout(editor);
        return;
      }
    }
  }

  if (type === CHECK_LIST_ITEM) {
    const path = findPath(editor, element);
    const [targetNode, targetPath] = Editor.node(editor, [path[0]]) || [];
    if (targetNode && [ORDERED_LIST, UNORDERED_LIST].includes(targetNode?.type) && !isMultiLevelList(targetNode)) {
      convertToCheck(editor, targetNode, targetPath);
      return;
    }
    const newType = element.type === CHECK_LIST_ITEM ? PARAGRAPH : CHECK_LIST_ITEM;
    Transforms.setNodes(editor, { type: newType });

    if ([MULTI_COLUMN, BLOCKQUOTE].includes(targetNode.type)) {
      if (targetNode.type === BLOCKQUOTE) {
        setBlockQuoteType(editor, true);
      } else {
        const currentNodeInColumn = getNode(editor, selection.anchor.path.slice(0, 3));
        if ([BLOCKQUOTE].includes(currentNodeInColumn.type)) {
          setBlockQuoteType(editor, true);
        }
      }
    }
    return;
  }

  if (type === BLOCKQUOTE && !LIST_ITEM_CORRELATION_TYPE.includes(element.type)) {
    if (element.type === BLOCKQUOTE) return;
    const isBlockQuoteParent = getAboveNode(editor, { match: { type: BLOCKQUOTE } });
    if (isBlockQuoteParent) return;

    if (!isBlockQuoteParent && ![BLOCKQUOTE].includes(element.type)) {
      setBlockQuoteType(editor, false);
      return;
    }
  }

  if (type === BLOCKQUOTE && LIST_ITEM_CORRELATION_TYPE.includes(element.type)) {
    Transforms.wrapNodes(editor, { id: slugid.nice(), type: BLOCKQUOTE }, {
      mode: 'highest',
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    });
    return;
  }

  // Transform to multi_column and put content into first column
  if (MULTI_COLUMN_TYPE.includes(type)) {
    const path = findPath(editor, element);

    const multiColumnNode = generateEmptyMultiColumn(editor, type);
    Transforms.insertNodes(editor, multiColumnNode, { at: [path[0] + 1] });

    const nodeIndex = path[0];
    const highestNode = editor.children[nodeIndex];
    if (path.length > 1 && [BLOCKQUOTE, ORDERED_LIST, UNORDERED_LIST, CODE_BLOCK].includes(highestNode.type)) {
      Transforms.moveNodes(editor, { at: [path[0]], to: [path[0] + 1, 0, 0] });
    } else {
      Transforms.moveNodes(editor, { at: path, to: [path[0] + 1, 0, 0] });
    }
    Transforms.removeNodes(editor, { at: [path[0], 0, 1] });
    return;
  }

  Transforms.setNodes(editor, { type: type });
};

export const setSelection = (editor, element) => {
  if (element) {
    const path = ReactEditor.findPath(editor, element);
    Transforms.select(editor, path);
  }
};

export const onCopyNode = (editor, element) => {
  if (element.type === ELEMENT_TYPE.CODE_BLOCK) {
    setClipboardCodeBlockData(element);
    return;
  }

  if (element.type === ELEMENT_TYPE.TABLE) {
    const tableSize = [element.children.length, element.children[0].children.length];
    const tableSelectedRange = {
      minRowIndex: 0,
      maxRowIndex: tableSize[0] - 1,
      minColIndex: 0,
      maxColIndex: tableSize[1] - 1,
    };
    editor.tableSelectedRange = tableSelectedRange;
  }

  const newData = editor.setFragmentData(new DataTransfer());
  copy('copy', {
    onCopy: (clipboardData) => {
      newData.types.forEach((type) => {
        const data = newData.getData(type);
        clipboardData.setData(type, data);
      });
    }
  });

  if (element.type === ELEMENT_TYPE.TABLE) {
    editor.tableSelectedRange = EMPTY_SELECTED_RANGE;
  }
};

export const onDeleteNode = (editor, element) => {
  const path = ReactEditor.findPath(editor, element);
  Transforms.removeNodes(editor, { at: path });
};

export const getTopValue = (editor, dom, containerDom, slateNode) => {
  if (!dom) return 0;
  if (!containerDom) return 0;

  const currentRect = dom.getBoundingClientRect();
  let containerRect = containerDom.getBoundingClientRect();

  let headerHeight = 0;
  if (editor.editorType === WIKI_EDITOR) {
    const titleDom = document.getElementById('wiki-page-title');
    const coverDom = document.getElementById('wiki-page-cover');
    const titleHeight = titleDom?.getBoundingClientRect().height || 0;
    const coverHeight = coverDom?.getBoundingClientRect().height || 0;
    headerHeight = titleHeight + coverHeight;
  }

  const top = currentRect.y - containerRect.y + containerDom.scrollTop;
  let offsetY = 0;
  let paddingTop = parseFloat(window.getComputedStyle(dom).getPropertyValue('padding-top'));
  const lineHeight = parseFloat(window.getComputedStyle(dom).getPropertyValue('line-height'));
  const disToolBarHeight = 21;// side toolbar icon line-height is 21
  if (ADD_POSITION_OFFSET_TYPE.includes(slateNode.type)) {
    paddingTop = slateNode.type === CHECK_LIST_ITEM ? 5 : paddingTop;
    offsetY = (lineHeight / 2) + paddingTop - (disToolBarHeight / 2);
  }

  return top + offsetY - headerHeight;
};

export const isNotSupportTransform = (node) => {
  if (node.type && [CODE_BLOCK, TABLE, VIDEO, WHITEBOARD].includes(node.type)) {
    return true;
  }
  return false;
};

export const insertElement = (editor, type, insertPosition) => {
  if (insertPosition === INSERT_POSITION.AFTER) {
    const p = generateEmptyElement(PARAGRAPH);
    const path = Editor.path(editor, editor.selection);
    Transforms.insertNodes(editor, p, { at: [path[0] + 1] });
    Transforms.select(editor, [path[0] + 1]);
  }
  // Insertion position is current or after
  Transforms.setNodes(editor, { type });
  if (HEADERS.includes(type)) {
    focusEditor(editor, editor.selection);
  }
};

export const getNodeEntry = (editor, el) => {
  if (!el) return [];
  const node = ReactEditor.toSlateNode(editor, el);
  let path = ReactEditor.findPath(editor, node);

  if (isList(editor, path)) {
    path = path.slice(0, path.length - 1);
  }

  if (node && path) return [node, path];
  return [];
};

export const isBlockquote = (editor, path) => {
  const nodeEntry = Editor.node(editor, path);
  if (nodeEntry && nodeEntry[0]?.type === BLOCKQUOTE) {
    return true;
  }
  return false;
};

export const isMultiColumn = (editor, path) => {
  const nodeEntry = Editor.node(editor, path);
  if (nodeEntry && nodeEntry[0]?.type === MULTI_COLUMN) {
    return true;
  }
  return false;
};

export const isInMultiColumnNode = (editor, node) => {
  const topNodePath = [findPath(editor, node)[0]];
  return isMultiColumn(editor, topNodePath);
};

export const isList = (editor, path) => {
  const nodeEntry = Editor.node(editor, [path[0]]);
  if (nodeEntry && [ORDERED_LIST, UNORDERED_LIST].includes(nodeEntry[0]?.type)) {
    return true;
  }
  if (path.length > 1 && isBlockquote(editor, [path[0]])) {
    const nodeEntry = Editor.node(editor, [path[0], path[1]]);
    if ([ORDERED_LIST, UNORDERED_LIST].includes(nodeEntry[0]?.type)) {
      return true;
    }
  }
  return false;
};

export const getListNode = (editor, path) => {
  let listType = Editor.node(editor, [path[0]])[0].type;
  if (listType === BLOCKQUOTE) {
    listType = Editor.node(editor, [path[0], path[1]])[0].type;
  }
  const listItem = Editor.node(editor, path)[0];
  const listNode = generateEmptyList(listType);
  listNode.children[0] = listItem;
  return listNode;
};

export const getListNodeFromMultiColumn = (editor, path) => {
  let listType = Editor.node(editor, path.slice(0, 3))[0].type;
  const listItem = Editor.node(editor, path)[0];
  const listNode = generateEmptyList(listType);
  listNode.children[0] = listItem;
  return listNode;
};

export const onWrapListItemFromMultiColumn = (editor, targetPath, sourcePath) => {
  const nextPath = Path.next(targetPath);
  const listNode = getListNodeFromMultiColumn(editor, sourcePath.slice(0, 4));
  Transforms.removeNodes(editor, { at: sourcePath.slice(0, 4) });
  Transforms.insertNodes(editor, listNode, { at: nextPath });
};

export const onWrapListItem = (editor, targetPath, sourcePath) => {
  const nextPath = Path.next(targetPath);
  const listNode = getListNode(editor, sourcePath);
  Transforms.removeNodes(editor, { at: sourcePath });
  Transforms.insertNodes(editor, listNode, { at: nextPath });
  return;
};

export const insertEmptyListNodeAtTarget = (editor, targetPath, listType) => {
  const currentTargetPath = Path.next(targetPath);
  const emptyListNode = generateEmptyList(listType);
  emptyListNode.children[0] = generateListItem();
  Transforms.insertNodes(editor, emptyListNode, { at: currentTargetPath });
};

export const onWrapMultiListItem = (editor, currentTargetPath, sourceNodes) => {
  sourceNodes && sourceNodes.slice().reverse().forEach((nodes) => {
    Transforms.insertNodes(editor, nodes[0], { at: currentTargetPath });
  });
};

export const onWrapMultiListItemToNonListTypeTarget = (editor, targetPath, sourceNodes, listType) => {
  insertEmptyListNodeAtTarget(editor, targetPath, listType);

  let currentTargetPath = Path.next(targetPath);
  currentTargetPath.splice(currentTargetPath.length, 0, 0);
  const emptyListPath = [...currentTargetPath];
  currentTargetPath = Path.next(currentTargetPath);

  onWrapMultiListItem(editor, currentTargetPath, sourceNodes);
  Transforms.removeNodes(editor, { at: emptyListPath });
};

export const getTransformMenusConfig = (editor, slateNode) => {
  let newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG;
  if ([CALL_OUT].includes(slateNode.type)) {
    return newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter((item) => [PARAGRAPH].includes(item.type));
  }
  if (LIST_ITEM_CORRELATION_TYPE.includes(slateNode.type)) {
    newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter((item) => LIST_ITEM_SUPPORTED_TRANSFORMATION.includes(item.type));
  }
  const path = ReactEditor.findPath(editor, slateNode);

  if (path) {
    const nodeIndex = path[0];
    const highestNode = editor.children[nodeIndex];
    if (path.length > 1) {
      if (highestNode.type === BLOCKQUOTE) {
        newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter(item => item.type !== CALL_OUT);
      }
      // Element in Multi_column can not be converted to multi_column type
      if (highestNode.type === MULTI_COLUMN) {
        newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter(item => !MULTI_COLUMN_TYPE.includes(item.type));
      }
    }

    // Image-block can't be nested by ordered-list, ordered-list and check-list
    if (IMAGE_BLOCK.includes(highestNode.type)) {
      newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter(item => ![ORDERED_LIST, UNORDERED_LIST, CHECK_LIST_ITEM].includes(item.type));
    }

    // headers can't be nested by quote block
    if (HEADERS.includes(highestNode.type)) {
      newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter(item => item.type !== BLOCKQUOTE);
    }

    if ([ORDERED_LIST, UNORDERED_LIST].includes(highestNode.type)) {
      // If it's not the top list item, cannot be converted to checks
      if (!isTopLevelListItem(editor)) {
        newSideMenusConfig = SIDE_TRANSFORM_MENUS_CONFIG.filter(item => item.type !== CALL_OUT);
      }
      // Multi-level list items cannot be converted to checks
      if (isMultiLevelList(highestNode)) {
        newSideMenusConfig = newSideMenusConfig.filter(item => item.type !== CHECK_LIST_ITEM);
      }
    }
  }
  return newSideMenusConfig;
};

export const getSearchedOperations = (sourceMenuSearchMap, isNodeEmpty, event, t, editor) => {
  let menuSearchMap = {};
  if (event.target.value.trim()) {
    Object.keys(sourceMenuSearchMap).forEach((key) => {
      const value = sourceMenuSearchMap[key];
      const sourceStr = t(value).toUpperCase();
      const targetStr = event.target.value.trim().toUpperCase();
      if (sourceStr.includes(targetStr)) {
        menuSearchMap[key] = value;
      }
    });

    if (!isNodeEmpty) {
      menuSearchMap['searching'] = true; // Used to identify the search for Transform menu list
    }
  } else {
    menuSearchMap = sourceMenuSearchMap;
    if (!isNodeEmpty) {
      menuSearchMap['searching'] = false;
    }
  }
  return menuSearchMap;
};

export const createDragPreviewContainer = () => {
  const previewContainer = document.createElement('div');
  previewContainer.style.position = 'absolute';
  previewContainer.style.width = '654px';
  previewContainer.style.pointerEvents = 'none';
  previewContainer.style.background = 'rgba(255, 255, 255, 0.9)';
  previewContainer.style.padding = '3px 0px';
  previewContainer.style.zIndex = '103';
  document.body.appendChild(previewContainer);
  return previewContainer;
};

export const deleteNodesFromBack = (editor, sortedPaths) => {
  sortedPaths.slice().reverse().forEach((path) => {
    Transforms.removeNodes(editor, { at: path });
  });
};

export const isListItem = (editor) => {
  if (!editor.selection) return false;

  const anchorPath = editor.selection.anchor.path;
  const focusPath = editor.selection.focus.path;
  if (isMultiColumn(editor, [anchorPath[0]])) return false;

  const start = Math.min(anchorPath[0], focusPath[0]);
  const end = Math.max(anchorPath[0], focusPath[0]);

  let isListItem = true;
  for (let i = start; i <= end; i++) {
    const topNode = getNode(editor, [i]);
    if (topNode?.type !== ORDERED_LIST && topNode?.type !== UNORDERED_LIST) {
      return isListItem = false;
    }
  }

  return isListItem;
};

export const normalizeCopyData = (editor, fragment) => {
  const decoded = decodeURIComponent(window.atob(fragment));
  const parsed = JSON.parse(decoded);
  const newData = replacePastedDataId(parsed);
  const normalizeNewData = normalizeCopyNodes(editor, newData);
  return normalizeNewData;
};

export const clearDragClass = (el) => {
  if (!el) return;
  el.classList.remove(
    'sdoc-dragging-right',
    'sdoc-dragging-left',
    'sdoc-dragging'
  );
};

export const wrapIntoMultiColumn = (editor, leftNode, rightNode, targetPath) => {
  const emptyMultiColumnNode = generateEmptyMultiColumn(editor, TWO_COLUMN);
  Transforms.insertNodes(editor, emptyMultiColumnNode, { at: [targetPath[0]] });
  Transforms.insertNodes(editor, leftNode, { at: [targetPath[0], 0, 0] });
  Transforms.insertNodes(editor, rightNode, { at: [targetPath[0], 1, 0] });
  Transforms.removeNodes(editor, { at: [targetPath[0], 0, 1] });
  Transforms.removeNodes(editor, { at: [targetPath[0], 1, 1] });
};
