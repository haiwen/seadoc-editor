import { Editor, Path, Range, Transforms } from '@seafile/slate';
import { ORDERED_LIST, PARAGRAPH } from '../../../constants';
import { focusEditor, getLastChild, getPreviousPath } from '../../../core';
import { getBeforeText, setListType } from '../helpers';
import { generateEmptyListItem } from '../model';
import { toggleList } from '../transforms';

/**
 * @param {Editor} editor
 * @param {String} text
 * @returns {Boolean} isPreventInsert
 */
export const handleShortcut = (editor, text) => {
  if (text !== ' ') return false;

  const { selection } = editor;

  if (!Range.isCollapsed(selection)) return false;

  let [aboveNode, aboveNodePath] = Editor.above(editor);
  const aboveNodeRef = Editor.pathRef(editor, aboveNodePath);

  if (aboveNode.type !== PARAGRAPH) return false;
  // Match ordered list shortcut
  const regShortcut = /^\s*[1-9]+\.\s*$/;
  const { beforeText, range } = getBeforeText(editor);
  const matchResult = beforeText.match(regShortcut);
  const matchedText = matchResult && matchResult[0];
  // If the match fails or the match is not at the beginning of the line, it is not a shortcut
  if (!matchResult || matchResult.index !== 0) return false;
  const previousNodePath = getPreviousPath(aboveNodePath);

  // No previous node means that the current paragraph is the first paragraph in the container
  if (!previousNodePath) {
    if (matchedText !== '1.') return false;
    // Delete shortcut key text
    Transforms.delete(editor, { at: range });
    toggleList(editor, ORDERED_LIST);
    return true;
  }

  const [previousNode, previousPath] = Editor.node(editor, previousNodePath);
  // If the previous node is not an ordered list and is not start with `1.`,it is not a shortcut
  if (previousNode.type !== ORDERED_LIST && matchedText !== '1.') return false;
  // If the previous node is not an ordered list and is start with `1.`,transforms to ordered list
  if (previousNode.type !== ORDERED_LIST && matchedText === '1.') {
    // Delete shortcut key text
    Transforms.delete(editor, { at: range });
    setListType(editor, ORDERED_LIST);
    focusEditor(editor);
    return true;
  }
  // Record the order number of the shortcut that will be inserted as a list item
  const shortcutOrderNum = parseInt(matchResult[0].slice(0, -1));

  // Check If order number is continuous
  if (previousNode.children.length + 1 !== shortcutOrderNum) return false;

  // Delete shortcut key text
  Transforms.delete(editor, { at: range });
  // Update aboveNode after delete shortcut text
  [aboveNode] = Editor.above(editor);
  const [, lastListItemPath] = getLastChild([previousNode, previousPath]);
  const targetInsertPath = Path.next(lastListItemPath);
  // Wrap the paragraph in a list item
  const insertedListItem = generateEmptyListItem();
  insertedListItem.children.push(aboveNode);
  Transforms.insertNodes(editor, insertedListItem, { at: targetInsertPath });
  Transforms.removeNodes(editor, { at: aboveNodeRef.unref() });
  // Set the selection to the end of the inserted list item
  Transforms.select(editor, Editor.end(editor, targetInsertPath));
  return true;
};
