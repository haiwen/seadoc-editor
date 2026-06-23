/** @jsx jsx */
import { Editor, Transforms } from '@seafile/slate';
import HeaderPlugin from '../../../../src/extension/plugins/header';
import { getSkippedHiddenHeaderMovePoint } from '../../../../src/extension/plugins/header/helpers';
import { jsx, createSdocEditor } from '../../../core';

describe('collapsed header navigation', () => {
  it('jumps to next visible block when moving right out of a collapsed header', () => {
    const input = (
      <editor>
        <hh1 collapsed>aa<cursor /></hh1>
        <hp>hidden paragraph</hp>
        <hh1>bb</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);

    Transforms.move(editor, { unit: 'offset' });
    const hiddenMovePoint = getSkippedHiddenHeaderMovePoint(editor, editor.selection.focus);

    expect(hiddenMovePoint).toEqual(Editor.start(editor, [2]));
  });

  it('jumps to previous visible block when moving left into a collapsed section', () => {
    const input = (
      <editor>
        <hh1 collapsed>aa</hh1>
        <hp>hidden paragraph</hp>
        <hh1><cursor />bb</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);

    Transforms.move(editor, { unit: 'offset', reverse: true });
    const hiddenMovePoint = getSkippedHiddenHeaderMovePoint(editor, editor.selection.focus, true);

    expect(hiddenMovePoint).toEqual(Editor.end(editor, [0]));
  });

  it('does not jump when next block is already visible', () => {
    const input = (
      <editor>
        <hh1>aa<cursor /></hh1>
        <hp>visible paragraph</hp>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);

    Transforms.move(editor, { unit: 'offset' });
    const hiddenMovePoint = getSkippedHiddenHeaderMovePoint(editor, editor.selection.focus);

    expect(hiddenMovePoint).toBeNull();
  });

  it('keeps collapsed header visibility detection scoped by header level', () => {
    const input = (
      <editor>
        <hh1 collapsed>aa</hh1>
        <hh2>hidden child</hh2>
        <hh1>visible sibling</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);

    expect(getSkippedHiddenHeaderMovePoint(editor, Editor.end(editor, [0]))).toEqual(Editor.start(editor, [2]));
  });
});
