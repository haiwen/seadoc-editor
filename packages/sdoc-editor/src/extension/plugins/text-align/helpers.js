import { Editor, Transforms, Element } from '@seafile/slate';
import { CODE_BLOCK, TABLE } from '../../constants';
import { isRangeAcrossBlocks } from '../../core';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (!editor.selection) return true;

  const [match] = Editor.nodes(editor, {
    match: node => {
      return !Editor.isEditor(node) && Element.isElement(node) && Editor.isBlock(editor, node);
    },
    universal: true,
    mode: 'highest'
  });
  if (!match) return false;

  const elementType = match[0].type;
  // at present, TABLE got its own 'text align'
  if (elementType === CODE_BLOCK || elementType === TABLE) {
    return true;
  }
  return false;
};

export const getAlignType = (editor) => {
  const defaultType = 'left';
  const { selection } = editor;
  if (!selection) {
    return defaultType;
  }

  if (isRangeAcrossBlocks(editor)) return defaultType;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: n =>
      !Editor.isEditor(n) &&
        Element.isElement(n) &&
        n['align']
  });

  if (!match) return defaultType;
  return match[0].align;
};

export const setAlignType = (editor, type) => {
  Transforms.setNodes(editor, { 'align': type });
};
