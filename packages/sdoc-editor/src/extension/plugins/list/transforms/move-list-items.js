import { Editor, Path } from '@seafile/slate';
import { PARAGRAPH } from '../../../constants';
import { getNodeEntries } from '../../../core';
import { isListNested } from '../queries';
import { movedListItemDown } from './move-list-item-down';
import { movedListItemUp } from './move-list-item-up';
import { removeFirstListItem } from './remove-first-list-item';

export const moveListItems = (editor, { increase = true, at = editor.selection, enableResetOnShiftTab } = {}) => {
  const _nodes = getNodeEntries(editor, {
    at,
    match: {
      type: [PARAGRAPH]
    }
  });

  const lics = Array.from(_nodes);
  if (!lics.length) return;

  const highestLicPaths = [];
  const highestLicPathRefs = [];

  lics.forEach(lic => {
    const licPath = lic[1];
    const liPath = Path.parent(licPath);

    const isAncestor = highestLicPaths.some(path => {
      const highestLiPath = Path.parent(path);

      return Path.isAncestor(highestLiPath, liPath);
    });
    if (!isAncestor) {
      highestLicPaths.push(licPath);
      highestLicPathRefs.push(Editor.pathRef(editor, licPath));
    }
  });

  const licPathRefsToMove = increase ? highestLicPathRefs : highestLicPathRefs.reverse();

  let moved = false;

  licPathRefsToMove.forEach(licPathRef => {
    const licPath = licPathRef.unref();
    if (!licPath) return;

    const listItem = Editor.parent(editor, licPath);
    if (!listItem || listItem[1].length === 0) return;

    const parentList = Editor.parent(editor, listItem[1]);
    if (!parentList) return;

    let _moved = false;

    if (increase) {
      _moved = movedListItemDown(editor, {
        list: parentList,
        listItem: listItem,
      });
    } else if (isListNested(editor, parentList[1])) {
      _moved = movedListItemUp(editor, {
        list: parentList,
        listItem: listItem,
      });
      return _moved;
    } else if (enableResetOnShiftTab) {
      _moved = removeFirstListItem(editor, {
        list: parentList,
        listItem: listItem,
      });
    }

    moved = _moved || moved;
  });

  return moved;
};
