import { Editor, Range, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { LIST_ITEM } from '../../../constants';
import { findNode } from '../../../core';
import { moveListItems } from '../transforms';

export const onTabHandle = (editor, event) => {
  const { selection } = editor;
  if (!selection) return;

  const listSelected = findNode(editor, { type: [LIST_ITEM] });
  if (!listSelected) return false;

  let workRange = editor.selection;
  if (!Range.isCollapsed(selection)) {
    let { anchor, focus } = selection;
    if (Range.isBackward(selection)) {
      ({ anchor, focus } = { anchor: { ...selection.focus }, focus: { ...selection.anchor } });
    }

    const unHungRange = Editor.unhangRange(editor, { anchor, focus });
    if (unHungRange) {
      workRange = unHungRange;
      Transforms.select(editor, unHungRange);
    }
  }

  const increase = isHotkey('shift+tab', event) ? false : true;
  if (workRange && listSelected) {
    event.preventDefault();
    moveListItems(editor, {
      at: workRange,
      increase: increase,
      enableResetOnShiftTab: true,
    });
    return true;
  }

};
