import { Transforms, Editor, Element, Node, Path, Range } from '@seafile/slate';
import { DIVIDER, PARAGRAPH } from '../../constants';
import { generateEmptyElement, isFirstNode, isLastNode } from '../../core';


const HR_PATTERNS = ['---', '***', '___'];

const withDivider = (editor) => {
  const { isVoid, insertText, normalizeNode } = editor;
  const newEditor = editor;

  newEditor.isVoid = (element) => {
    const { type } = element;

    if (type === DIVIDER) return true;
    return isVoid(element);
  };

  newEditor.insertText = (text) => {
    const { selection } = newEditor;
    if (!selection || !Range.isCollapsed(selection)) {
      insertText(text);
      return;
    }

    const [blockEntry] = Editor.nodes(newEditor, {
      at: selection,
      match: (n) => Element.isElement(n) && n.type === PARAGRAPH,
    });

    if (!blockEntry) {
      insertText(text);
      return;
    }

    const [blockNode, blockPath] = blockEntry;
    const blockText = Node.string(blockNode);

    const nextText = blockText + text;

    if (HR_PATTERNS.includes(nextText)) {
      Editor.withoutNormalizing(newEditor, () => {
        Transforms.removeNodes(newEditor, { at: blockPath });
        Transforms.insertNodes(newEditor, generateEmptyElement(DIVIDER), { at: blockPath });

        const nextPath = Path.next(blockPath);
        Transforms.insertNodes(newEditor, generateEmptyElement(PARAGRAPH), { at: nextPath });
        Transforms.select(newEditor, Editor.start(newEditor, nextPath));
      });
      return;
    }

    return insertText(text);
  };

  newEditor.normalizeNode = ([node, path]) => {
    if (node.type === DIVIDER) {
      const isLast = isLastNode(newEditor, node);
      if (isLast) {
        const paragraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(newEditor, paragraph, { at: [path[0] + 1] });
        return;
      }
      const isFirst = isFirstNode(newEditor, node);
      if (isFirst) {
        const paragraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(newEditor, paragraph, { at: [path[0]] });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return newEditor;
};

export default withDivider;
