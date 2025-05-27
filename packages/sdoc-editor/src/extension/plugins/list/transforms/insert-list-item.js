import { Transforms, Editor, Path, Range } from '@seafile/slate';
import { LIST_ITEM, PARAGRAPH } from '../../../constants';
import { getAboveNode, isBlockTextEmptyAfterSelection, isStartPoint } from '../../../core';
import { generateEmptyListContent, generateEmptyListItem } from '../model';

// list > list_item > paragraph
export const insertListItem = (editor) => {
  const paragraphEntry = getAboveNode(editor, { match: { type: PARAGRAPH } });
  if (!paragraphEntry) return false;

  const [, paragraphPath] = paragraphEntry;
  const listItemEntry = Editor.parent(editor, paragraphPath);
  if (!listItemEntry) return false;

  const [listItemNode, listItemPath] = listItemEntry;

  if (listItemNode.type !== LIST_ITEM) return false;

  let success = false;
  Editor.withoutNormalizing(editor, () => {
    if (!Range.isCollapsed(editor.selection)) {
      // 删除选中的内容
      Transforms.delete(editor, { at: editor.selection });
    }

    const _isStartPoint = isStartPoint(editor, editor.selection?.focus, paragraphPath);
    const isEndPoint = isBlockTextEmptyAfterSelection(editor);
    const nextParagraphPath = Path.next(paragraphPath);
    const nextListItemPath = Path.next(listItemPath);

    if (_isStartPoint) { // listItem 有内容，光标在开始
      const itemContent = generateEmptyListContent();
      Transforms.insertNodes(editor, itemContent, { at: listItemPath });

      const listItem = generateEmptyListItem();
      Transforms.wrapNodes(editor, listItem, { at: listItemPath });
      success = true;
      return;
    }

    if (!isEndPoint) { // listItem 有内容，光标在中间
      Transforms.splitNodes(editor);

      const listItem = generateEmptyListItem();
      Transforms.wrapNodes(editor, listItem, { at: nextParagraphPath });
      Transforms.moveNodes(editor, {
        at: nextParagraphPath,
        to: nextListItemPath,
      });
      Transforms.select(editor, nextListItemPath);
      Transforms.collapse(editor, { edge: 'start' });
      success = true;
    } else { // listItem 有内容，光标在结尾
      const marks = Editor.marks(editor)?.key;
      const itemContent = generateEmptyListContent();
      Transforms.insertNodes(editor, { ...itemContent, ...marks }, { at: nextListItemPath });

      const listItem = generateEmptyListItem();
      Transforms.wrapNodes(editor, listItem, { at: nextListItemPath });
      Transforms.select(editor, nextListItemPath);
      success = true;
    }

    if (listItemNode.children.length > 1) {
      Transforms.moveNodes(editor, { at: nextParagraphPath, to: nextListItemPath.concat(1) });
      success = true;
    }
  });

  return success;

};
