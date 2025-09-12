import { Editor, Element, Transforms, Node, Path } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { isMac } from '../../../utils/common-utils';
import { PARAGRAPH, HEADERS, TITLE, SUBTITLE, HEADER, MULTI_COLUMN } from '../../constants';
import { MAC_HOTKEYS_EVENT, WIN_HOTKEYS } from '../../constants/keyboard';
import { generateEmptyElement, getSelectedNodeByTypes, isSelectionAtBlockStart, isCursorAtBlockStart, getNodeType, generateDefaultParagraph } from '../../core';
import { isSingleListItem } from '../list/helpers';
import { isHasImage, isMenuDisabled, setHeaderType } from './helpers';

const isSelectionAtLineEnd = (editor, path) => {
  const { selection } = editor;

  if (!selection) return false;

  const isAtLineEnd = Editor.isEnd(editor, selection.anchor, path) || Editor.isEnd(editor, selection.focus, path);

  return isAtLineEnd;
};

const withHeader = (editor) => {
  const { insertBreak, insertFragment, insertText, deleteBackward, normalizeNode } = editor;
  const newEditor = editor;

  // Utility function to check if selection is inside multi-column node
  const isSelectionInMultiColumn = (editor) => {
    if (!editor.selection) return false;
    const topParentNode = Node.get(editor, [editor.selection.anchor.path[0]]);
    return topParentNode.type === MULTI_COLUMN;
  };

  // Rewrite insertBreak - insert paragraph when carriage return at the end of header
  newEditor.insertBreak = () => {
    const [match] = Editor.nodes(newEditor, {
      match: n => {
        if (!Element.isElement(n)) return false;
        if (!n.type) return false;
        if (n.type.startsWith(HEADER)) return true;
        if (n.type === TITLE) return true;
        if (n.type === SUBTITLE) return true;
        return false;
      }, // Matches nodes whose node.type starts with header
      universal: true,
    });

    if (!match) {
      insertBreak();
      return;
    }

    if (isCursorAtBlockStart(newEditor)) {
      const [currentNode, path] = match;
      const newNode = generateEmptyElement(currentNode.type);
      Transforms.insertNodes(editor, newNode, { at: path });
      return;
    }

    const isAtLineEnd = isSelectionAtLineEnd(editor, match[1]);

    const nextNode = Editor.next(editor, { at: match[1] });

    if (isAtLineEnd && nextNode && editor.children.length === 2) {
      const [node, path] = nextNode;
      if (node && node.children[0].text === '') {
        Transforms.select(editor, path);
        return;
      }
    }

    // If an empty p is inserted at the end of the line and not in the multi_column node, otherwise wrap normally
    if (isAtLineEnd && !isSelectionInMultiColumn(newEditor)) {
      const p = generateEmptyElement(PARAGRAPH);
      Transforms.insertNodes(newEditor, p, { mode: 'highest' });
    } else {
      insertBreak();
    }
  };

  newEditor.insertFragment = (data) => {
    const headerNode = getSelectedNodeByTypes(editor, HEADERS);
    const headerText = Node.string(headerNode || { children: [] });
    const onlyOneListItem = data.length === 1 && isSingleListItem(data[0]);
    // Insert a list item when the header is empty, insert only the text
    if ((headerNode && headerText.length === 0) && onlyOneListItem) {
      const text = Node.string(data[0]);
      insertText(text);
      return;
    }
    return insertFragment(data);
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (selection === null) {
      deleteBackward(unit);
      return;
    }

    const headerNode = getSelectedNodeByTypes(editor, HEADERS);
    if (headerNode && isSelectionAtBlockStart(editor) && Node.string(headerNode).length > 0) {
      Transforms.setNodes(editor, { type: PARAGRAPH });
      return;
    }

    deleteBackward(unit);
  };

  newEditor.onHotKeyDown = (event) => {
    const HOT_KEYS = isMac() ? MAC_HOTKEYS_EVENT : WIN_HOTKEYS;
    const hotEntries = Object.entries(HOT_KEYS);

    let isHeaderEvent = false;
    let headerType = '';
    for (let index = 0; index < hotEntries.length; index++) {
      const [key, value] = hotEntries[index];
      isHeaderEvent = isHotkey(value, event);
      if (isHeaderEvent) {
        headerType = key;
        break;
      }
    }
    if (!isHeaderEvent) return false;

    event.preventDefault();
    if (isMenuDisabled(newEditor)) return true;

    setHeaderType(newEditor, headerType);
    return true;
  };

  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);

    if (HEADERS.includes(type) && isHasImage(node)) {
      let imagePaths = [];
      let imageNodes = [];
      node.children.forEach((item, index) => {
        if (item.type === 'image') {
          const imgPath = [...path, index];
          imagePaths.push(imgPath);
          imageNodes.push(item);
        }
      });

      if (imagePaths.length > 0) {
        Editor.withoutNormalizing(editor, () => {
          imagePaths.reverse().forEach(path => {
            Transforms.removeNodes(editor, { at: path });
          });
          const p = generateDefaultParagraph();
          p.children = imageNodes;
          const newPath = Path.next(path);
          Transforms.insertNodes(editor, p, { at: newPath });
        });
        return;
      }
    }

    return normalizeNode([node, path]);

  };

  return newEditor;
};

export default withHeader;
