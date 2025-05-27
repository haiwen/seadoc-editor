import { Element } from '@seafile/slate';
import { CODE_LINE } from '../extension/constants';
import { SetNodeToDecorations } from './setNodeToDecorations';

export const highlightDecorate = (editor) => ([node, path]) => {
  let ranges = [];
  if (Element.isElement(node) && node.type === CODE_LINE) {
    ranges = editor?.nodeToDecorations?.get(node) || [];
    return ranges;
  }
  return ranges;
};

export {
  SetNodeToDecorations,
};
