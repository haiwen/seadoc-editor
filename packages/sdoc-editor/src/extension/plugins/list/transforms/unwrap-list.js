import { Editor, Transforms, Element, Node } from '@seafile/slate';
import { LIST_ITEM } from '../../../constants';
import { getAboveNode, getNodeType } from '../../../core';
import { getListTypes } from '../queries';

export const unwrapList = (editor, { at } = {}) => {
  const ancestorListTypeCheck = () => {
    if (getAboveNode(editor, { match: { type: getListTypes() } })) {
      return true;
    }

    // The selection's common node might be a list type
    if (!at && editor.selection) {
      const commonNode = Node.common(
        editor,
        editor.selection.anchor.path,
        editor.selection.focus.path
      );
      if (Element.isElement(commonNode[0]) && getListTypes().includes(commonNode[0].type)) {
        return true;
      }
    }

    return false;
  };

  Editor.withoutNormalizing(editor, () => {
    do {
      // unwrap list_item
      Transforms.unwrapNodes(editor, {
        at,
        match: (n) => getNodeType(n) === LIST_ITEM,
        split: true,
      });

      // unwrap list
      Transforms.unwrapNodes(editor, {
        at,
        match: (n) => getListTypes().includes(getNodeType(n)),
        split: true,
      });

    } while (ancestorListTypeCheck());
  });
};

