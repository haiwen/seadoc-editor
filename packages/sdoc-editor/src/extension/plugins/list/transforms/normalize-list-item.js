import { Transforms, Editor, Path, Element } from '@seafile/slate';
import { PARAGRAPH, GROUP, CODE_BLOCK } from '../../../constants';
import { getChildren, getDeepInlineChildren, match } from '../../../core';
import { generateEmptyListContent } from '../model';
import { getListTypes } from '../queries';
import { movedListItemUp } from './move-list-item-up';

export const normalizeListItem = (editor, { listItem }) => {
  let changed = false;

  const validLiChildrenTypes = [
    ...getListTypes(),
    PARAGRAPH,
    CODE_BLOCK,
    GROUP,
  ];
  const [, liPath] = listItem;
  const liChildren = getChildren(listItem);

  const invalidLiChildrenPathRefs = liChildren.filter(([child]) => {
    return !validLiChildrenTypes.includes(child.type);
  }).map(([, childPath]) => {
    return Editor.pathRef(editor, childPath);
  });

  const firstLiChild = liChildren[0];
  const [firstLiChildNode, firstLiChildPath] = firstLiChild ?? [];

  if (!firstLiChild || !Editor.isBlock(editor, firstLiChildNode)) {
    const itemContent = generateEmptyListContent();
    Transforms.insertNodes(editor, itemContent, { at: liPath.concat([0]) });
    return true;
  }

  if (Editor.isBlock(editor, firstLiChildNode) && !match(firstLiChildNode, [], { type: [PARAGRAPH] })) {
    if (match(firstLiChildNode, [], { type: getListTypes() })) {
      const parent = Editor.parent(editor, listItem[1]);
      const subList = firstLiChild;
      const children = getChildren(firstLiChild).reverse();
      children.forEach(c => {
        movedListItemUp(editor, {
          list: subList,
          listItem: c,
        });
      });

      Transforms.removeNodes(editor, { at: [...parent[1], 0] });
      return true;
    }

    if (validLiChildrenTypes.includes(firstLiChildNode.type)) {
      return true;
    }

    Transforms.setNodes(editor, { type: PARAGRAPH }, { at: firstLiChildPath });
    changed = true;
  }

  const licChildren = getChildren(firstLiChild);

  if (licChildren.length) {
    const blockPathRefs = [];
    const inlineChildren = [];

    for (const licChild of licChildren) {
      if (!(Element.isElement(licChild[0]) && Editor.isBlock(editor, licChild[0]))) {
        break;
      }

      blockPathRefs.push(Editor.pathRef(editor, licChild[1]));
      inlineChildren.push(...getDeepInlineChildren(editor, { children: getChildren(licChild) }));
    }

    const to = Path.next(licChildren[licChildren.length - 1]?.[1]);
    inlineChildren.reverse().forEach(([, path]) => {
      Transforms.moveNodes(editor, { at: path, to });
    });

    blockPathRefs.forEach((pathRef) => {
      const path = pathRef.unref();

      path && Transforms.removeNodes(editor, { at: path });
    });

    if (blockPathRefs.length) {
      changed = true;
    }
  }

  if (changed) return true;

  invalidLiChildrenPathRefs.reverse().forEach(ref => {
    const path = ref.unref();
    path && Transforms.moveNodes(editor, { at: path, to: firstLiChildPath.concat([0]) });
  });

  return !!invalidLiChildrenPathRefs.length;
};
