import { Editor, Path, Transforms } from '@seafile/slate';
import { LIST_ITEM, PARAGRAPH } from '../../../constants';
import { focusEditor, getNodeEntries, getPreviousPath, isFirstChild, isSelectionAtBlockStart } from '../../../core';
import { deleteMerge } from '../../../core/transforms/delete-merge';
import { getListItemEntry, isListNested } from '../queries';
import { removeFirstListItem, unwrapList } from '../transforms';
import { isAcrossListItems } from '../transforms/is-across-list-items';
import { removeListItem } from '../transforms/remove-list-item';
import { insertBreakList } from './insert-break-list';
import { insertFragmentList } from './insert-fragment-list';
import { normalizeList } from './normalize-list';
import { onTabHandle } from './on-tab-handle';
import { handleShortcut } from './shortcut';

const withList = (editor) => {
  const { insertBreak, handleTab, insertText, deleteBackward } = editor;
  const newEditor = editor;

  newEditor.insertBreak = () => {
    if (insertBreakList(editor)) return;

    insertBreak();
    return;
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (selection === null) {
      deleteBackward(unit);
      return;
    }


    const deleteBackwardList = () => {
      const res = getListItemEntry(editor, {});
      let moved = false;
      if (res) {
        const { list, listItem } = res;
        if (isSelectionAtBlockStart(editor, { match: node => node.type === LIST_ITEM })) {
          Editor.withoutNormalizing(editor, () => {
            moved = removeFirstListItem(editor, { list, listItem });
            if (moved) return true;

            moved = removeListItem(editor, { list, listItem });

            if (moved) {
              setTimeout(() => {
                const previousLiPath = getPreviousPath(listItem[1]);
                focusEditor(editor, Editor.end(editor, [...previousLiPath, 0]));
              }, 0);
              return;
            }

            if (isFirstChild(listItem[1]) && !isListNested(editor, list[1])) {
              unwrapList(newEditor, { at: listItem[1] });
              const focusPoint = Editor.start(newEditor, listItem[1]);
              focusEditor(newEditor, focusPoint);
              moved = true;
              return;
            }

            const pointBeforeListItem = Editor.before(editor, editor.selection.focus);
            let currentLic = null;
            let hasMultipleChildren = false;

            const editorOptions = {
              ...editor,
              selection: {
                anchor: editor.selection.anchor,
                focus: pointBeforeListItem,
              },
            };
            if (pointBeforeListItem && isAcrossListItems(editorOptions)) {
              // get closest lic ancestor of current selectable
              const _licNodes = getNodeEntries(editor, {
                at: listItem[1],
                match: (node) => node.type === PARAGRAPH,
                mode: 'lowest',
              });
              currentLic = [..._licNodes][0];
              hasMultipleChildren = currentLic[0].children.length > 1;
            }

            deleteMerge(editor, {
              reverse: true,
              unit,
            });
            moved = true;

            if (!currentLic || !hasMultipleChildren) return;

            const leftoverListItem = Editor.node(editor, { at: Path.parent(currentLic[1]) });
            if (leftoverListItem && leftoverListItem[0].children.length === 0) {
              // remove the leftover empty list item
              Transforms.removeNodes(editor, { at: leftoverListItem[1] });
            }
          });
        }
      }

      return moved;
    };

    if (deleteBackwardList()) return;

    // nothing todo
    deleteBackward(unit);
  };

  newEditor.handleTab = (event) => {
    if (!newEditor.selection) {
      handleTab && handleTab();
      return;
    }

    if (onTabHandle(newEditor, event)) return;

    handleTab && handleTab();
  };

  newEditor.insertFragment = insertFragmentList(newEditor);

  newEditor.normalizeNode = normalizeList(editor);

  newEditor.insertText = (text) => {
    const isPreventInsert = handleShortcut(newEditor, text);
    if (isPreventInsert) return;
    return insertText(text);
  };

  return newEditor;
};

export default withList;
