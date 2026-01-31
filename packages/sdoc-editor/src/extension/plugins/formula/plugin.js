import { Transforms } from '@seafile/slate';
import { ELEMENT_TYPE, PARAGRAPH } from '../../constants';
import { generateEmptyElement, getNodeType, isLastNode } from '../../core';


const withFormula = (editor) => {
  const { isVoid, normalizeNode } = editor;
  const newEditor = editor;


  newEditor.isVoid = (element) => {
    const { type } = element;

    if (type === ELEMENT_TYPE.FORMULA) return true;
    return isVoid(element);
  };

  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);

    if (type !== ELEMENT_TYPE.FORMULA) {
      return normalizeNode([node, path]);
    }

    // insert empty node，continue editor
    const isLast = isLastNode(newEditor, node);
    if (isLast) {
      const p = generateEmptyElement(PARAGRAPH);
      Transforms.insertNodes(newEditor, p, { at: [path[0] + 1] });
    }
  };

  return newEditor;
};

export default withFormula;
