import { Editor, Node, Path, Transforms, Range } from '@seafile/slate';
import { CALL_OUT, PARAGRAPH, ORDERED_LIST, UNORDERED_LIST, LIST_ITEM, MULTI_COLUMN } from '../../constants/element-type';
import { focusEditor, generateEmptyElement, getSelectedElems, isRangeAcrossBlocks, getTopLevelBlockNode, isTopLevelListItem, getSelectedNodeEntryByType } from '../../core';
import { CALLOUT_ALLOWED_INSIDE_TYPES, CALLOUT_COLOR_MAP } from './constant';

export const isMenuActive = (editor) => {
  const { selection } = editor;
  if (!selection) return false;
  const isInsideCallout = !!getCalloutEntry(editor);
  if (isInsideCallout) return true;
  return false;
};

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  const { selection } = editor;
  if (!selection) return true;
  const selectedElements = getSelectedElems(editor);
  // If it's not the top list item, disable callout menu
  const [node] = getTopLevelBlockNode(editor) || [];
  if (node && [ORDERED_LIST, UNORDERED_LIST].includes(node?.type)) {
    if (!isTopLevelListItem(editor)) return true;
  }
  const isRangeAcrossBlock = isRangeAcrossBlocks(editor);
  // If selected multiple block element contains callout, disable callout menu
  const isAllSelectedElementsInAllowTypes = selectedElements.length && selectedElements.every(element => {
    if (element.type === CALL_OUT && isRangeAcrossBlock) return false;
    return CALLOUT_ALLOWED_INSIDE_TYPES.includes(element.type);
  });
  if (isAllSelectedElementsInAllowTypes) return false;
  // If selection is in multi_column, able callout menu
  const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, MULTI_COLUMN);
  if (currentMultiColumnEntry) return false;
  return true;
};

/**
 * @param {keyof CALLOUT_COLOR_MAP} [background_color] fill color
 */
export const generateCallout = (background_color = Object.keys(CALLOUT_COLOR_MAP)[5]) => {
  const props = {
    style: { background_color }
  };
  const callout = generateEmptyElement(CALL_OUT, props);
  callout.children = [];
  return callout;
};

export const wrapCallout = (editor) => {
  const { selection } = editor;
  if (!selection) return;
  const callout = generateCallout();
  // Handle inserting callout into inside multi_column
  const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, MULTI_COLUMN);
  if (currentMultiColumnEntry) {
    Transforms.wrapNodes(editor, callout, {
      at: editor.selection.anchor.path.slice(0, 3),
    });
    focusEditor(editor);
    return;
  }
  const [node, path] = getTopLevelBlockNode(editor);
  if (node && [ORDERED_LIST, UNORDERED_LIST].includes(node?.type)) {
    if (Range.isCollapsed(selection)) {
      Transforms.collapse(editor);
    }
    const { path: startPath } = Editor.start(editor, path) || {};
    const { offset: endOffset, path: endPath } = Editor.end(editor, path) || {};
    const [, paragraphPath] = Editor.parent(editor, selection) || [];
    const [listItemNode, listItemPath] = Editor.parent(editor, paragraphPath) || [];
    let focusPoint = null;
    // Highlight only the top listItem
    if (listItemNode?.type === LIST_ITEM && listItemPath.length === 2) {
      const listNode = generateEmptyElement(node.type);
      listNode.children = [listItemNode];
      callout.children = [listNode];
      const { path: curPath } = Editor.point(editor, listItemPath) || {};

      if (Path.equals(startPath, curPath)) { // start
        Transforms.removeNodes(editor, { at: listItemPath });
        Transforms.insertNodes(editor, callout, { at: [path[0]] });
        focusPoint = Editor.end(editor, [path[0]]);
      } else if (Path.equals(endPath, curPath)) { // end
        Transforms.removeNodes(editor, { at: listItemPath });
        Transforms.insertNodes(editor, callout, { at: Path.next(path) });
        focusPoint = Editor.end(editor, Path.next(path));
      } else { // center
        // Get rest list node
        const restItemNode = Editor.nodes(editor, {
          at: {
            anchor: { offset: 0, path: curPath },
            focus: { offset: endOffset, path: endPath }
          },
          match: (node, path) => {
            // Matches the list type is LIST_ITEM
            // Matches the list after the current path
            // Matches top-level list-item
            return node?.type === LIST_ITEM && Path.compare(path, curPath) === 1 && path.length === 2;
          },
        });
        const restListNode = generateEmptyElement(node.type);
        restListNode.children = [];
        for (const [n] of restItemNode) {
          restListNode.children.push(n);
        }

        // Delete rest list node
        Transforms.removeNodes(editor, {
          at: {
            anchor: { offset: 0, path: curPath },
            focus: { offset: endOffset, path: endPath }
          },
          match: (node, path) => node?.type === LIST_ITEM && Path.compare(path, curPath) === 1 && path.length === 2
        });

        const insertCalloutPath = Path.next(path);
        const insertListPath = Path.next(insertCalloutPath);
        // Delete current list node
        Transforms.removeNodes(editor, { at: listItemPath });
        // Insert callout node and list node
        Transforms.insertNodes(editor, callout, { at: insertCalloutPath });
        Transforms.insertNodes(editor, restListNode, { at: insertListPath });
        focusPoint = Editor.end(editor, insertCalloutPath);
      }
    }
    focusEditor(editor, focusPoint);
    return;
  }

  Transforms.wrapNodes(editor, callout, {
    mode: 'highest',
  });
  focusEditor(editor);
};

export const unwrapCallout = (editor) => {
  const { selection } = editor;
  if (!selection) return;
  const aboveNodeEntry = Editor.above(editor, { match: n => n.type === CALL_OUT });
  if (!aboveNodeEntry) return;
  const [, calloutPath] = aboveNodeEntry;
  Transforms.unwrapNodes(editor, {
    at: calloutPath,
    match: n => n.type === CALL_OUT
  });
  const point = Editor.point(editor, editor.selection);
  focusEditor(editor, point);
};

export const changeFillBackgroundColor = (editor, background_color) => {
  Transforms.setNodes(editor,
    { style: { background_color } },
    { match: (n) => n.type === CALL_OUT }
  );

  Transforms.select(editor, Editor.start(editor, editor.selection));
};

export const setCalloutIcon = (editor, icon_name) => {
  Transforms.setNodes(editor,
    { callout_icon: icon_name },
    { match: (n) => n.type === CALL_OUT }
  );

  Transforms.select(editor, Editor.start(editor, editor.selection));
};

export const deleteCalloutIcon = (editor) => {
  Transforms.setNodes(editor,
    { callout_icon: '' },
    { match: (n) => n.type === CALL_OUT }
  );
  Transforms.select(editor, Editor.start(editor, editor.selection));
};

// Check is cursor in callout
export const getCalloutEntry = (editor, at = editor.selection) => {
  const aboveNodeEntry = Editor.above(editor, {
    match: (n) => n.type === CALL_OUT,
    mode: 'highest',
    at
  });
  return aboveNodeEntry;
};

export const isCalloutContentEmpty = (calloutEntry) => {
  const [calloutNode] = calloutEntry;
  const contentString = Node.string(calloutNode);
  const calloutChildren = calloutNode.children;
  const isSingleParagraph = calloutChildren.length === 1 && calloutChildren[0].type === PARAGRAPH;
  const isEmptyContent = contentString.length === 0;
  return isSingleParagraph && isEmptyContent;
};

// Insert a new element at new line in callout after current path
export const insertElementAtNewLineInCallout = (editor, type, currentPath) => {
  const element = generateEmptyElement(type);
  const insertPath = Path.next(currentPath);
  Transforms.insertNodes(editor, element, { at: insertPath });
  Transforms.select(editor, insertPath);
};
