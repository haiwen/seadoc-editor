import { Editor, Transforms, Text } from '@seafile/slate';
import { CODE_BLOCK, CODE_LINE } from '../../constants';
import { getNodeType } from '../../core';

export const isMenuDisabled = (editor, readonly = false) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      const type = getNodeType(n);

      if ([CODE_BLOCK, CODE_LINE].includes(type)) return true; // code-block
      if (Editor.isVoid(editor, n)) return true; // void node

      return false;
    },
    universal: true,
  });

  if (match) return true;
  return false;
};

const removeMarks = (editor, textNode) => {
  // Iterate text node properties, clearing styles
  const keys = Object.keys(textNode);
  keys.forEach(key => {
    if (key === 'text') {
      // Keep only the text attribute （Text attributes are necessary）
      return;
    }
    // All other attributes are deleted
    Editor.removeMark(editor, key);
  });
};

export const clearStyles = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: n => getNodeType(n) === 'link',
  });
  const nodeEntries = Editor.nodes(editor, {
    match: n => Text.isText(n),
    universal: true,
  });
  for (const nodeEntry of nodeEntries) {
    // single text node
    const n = nodeEntry[0];
    removeMarks(editor, n);
  }
};
