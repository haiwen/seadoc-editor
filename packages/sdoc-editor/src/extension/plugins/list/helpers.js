import { Editor, Element, Node, Range, Text } from '@seafile/slate';
import { CHECK_LIST_ITEM, CODE_BLOCK, CODE_LINE, LIST_ITEM, ORDERED_LIST, PARAGRAPH, TABLE, UNORDERED_LIST } from '../../constants';
import { getListTypes } from './queries';
import { toggleList } from './transforms';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  let selectedElements = [];
  const nodeEntries = Editor.nodes(editor, { universal: true });
  for (let nodeEntry of nodeEntries) {
    const [node] = nodeEntry;
    if (Element.isElement(node)) selectedElements.push(node);
  }

  const notMatch = selectedElements.some(element => {
    if (Editor.isVoid(editor, element) && Editor.isBlock(editor, element)) return true;

    const { type } = element;
    if ([CODE_LINE, CODE_BLOCK, TABLE, CHECK_LIST_ITEM].includes(type)) return true;
    return false;
  });

  if (notMatch) return true;

  return false;
};

export const getListType = (editor, type) => {
  const { selection } = editor;
  if (!selection) return;
  let selectedListNodeEntry;
  if (Range.isCollapsed(selection)) {
    const [nodeEntry] = Editor.nodes(editor, {
      match: node => getListTypes().includes(node.type),
      mode: 'lowest'
    });
    selectedListNodeEntry = nodeEntry;
  } else {
    const { anchor, focus } = selection;
    const commonNodeEntry = Node.common(editor, anchor.path, focus.path);
    //  Select condition:
    // 1. Select in one list
    // 2. Select in one list item
    // 3. Select in one line
    if (getListTypes().includes(commonNodeEntry[0].type)) { // Select in one list
      selectedListNodeEntry = commonNodeEntry;
    } else if (commonNodeEntry[0].type === LIST_ITEM) { // Select in one list item
      selectedListNodeEntry = Editor.parent(editor, commonNodeEntry[1]);
    } else if (Text.isText(commonNodeEntry[0])) { // Select in one line
      const [nodeEntry] = Editor.nodes(editor, { at: commonNodeEntry[1], match: node => getListTypes().includes(node.type), mode: 'lowest' });
      selectedListNodeEntry = nodeEntry;
    }
  }
  return selectedListNodeEntry ? selectedListNodeEntry[0].type : PARAGRAPH;
};

export const setListType = (editor, type) => {
  toggleList(editor, type);
};

export const getBeforeText = (editor) => {
  const { selection } = editor;
  if (selection == null) return { beforeText: '', range: null };
  const { anchor } = selection;
  // Find the near text node above the current text
  const [, aboveNodePath] = Editor.above(editor);
  const aboveNodeStartPoint = Editor.start(editor, aboveNodePath); // The starting position of the text node
  const range = { anchor, focus: aboveNodeStartPoint };
  const beforeText = Editor.string(editor, range) || '';
  return { beforeText, range };
};

export const isSingleListItem = (node) => {
  // ordered_list/unordered_list -> list-item.children -> paragraph
  //                                                   -> ordered_list/unordered_list
  if (![ORDERED_LIST, UNORDERED_LIST].includes(node.type)) return false;
  // list children
  if (node.children.length !== 1) return false;
  // listItem children
  const listItem = node.children[0];
  if (listItem.children.length !== 1) return false;
  return true;
};
