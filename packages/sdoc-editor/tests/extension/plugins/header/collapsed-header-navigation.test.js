/** @jsx jsx */
import { Editor, Transforms } from '@seafile/slate';
import HeaderPlugin from '../../../../src/extension/plugins/header';
import { expandCollapsedHeaderAncestors, getSkippedHiddenHeaderMovePoint, isElementHiddenByCollapsedHeader, isHeaderCollapsed, setHeaderCollapsed } from '../../../../src/extension/plugins/header/helpers';
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
    setHeaderCollapsed(editor, editor.children[0], true, [0]);
    expect(isElementHiddenByCollapsedHeader(editor, editor.children[1], [1])).toBe(true);

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
    setHeaderCollapsed(editor, editor.children[0], true, [0]);
    expect(isElementHiddenByCollapsedHeader(editor, editor.children[1], [1])).toBe(true);

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
    setHeaderCollapsed(editor, editor.children[0], true, [0]);
    expect(isElementHiddenByCollapsedHeader(editor, editor.children[1], [1])).toBe(true);

    expect(getSkippedHiddenHeaderMovePoint(editor, Editor.end(editor, [0]))).toEqual(Editor.start(editor, [2]));
  });

  it('expands collapsed ancestor headers before navigating to a hidden heading', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hh2>bb</hh2>
        <hp>hidden paragraph</hp>
        <hh3>target</hh3>
        <hh1>visible sibling</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);
    const collapseStateChanges = jest.fn();
    editor.onHeaderCollapseStateChange = collapseStateChanges;

    setHeaderCollapsed(editor, editor.children[0], true, [0]);
    setHeaderCollapsed(editor, editor.children[1], true, [1]);

    expect(isElementHiddenByCollapsedHeader(editor, editor.children[3], [3])).toBe(true);

    const isExpanded = expandCollapsedHeaderAncestors(editor, editor.children[3], [3]);

    expect(isExpanded).toBe(true);
    expect(isHeaderCollapsed(editor, editor.children[0], [0])).toBe(false);
    expect(isHeaderCollapsed(editor, editor.children[1], [1])).toBe(false);
    expect(collapseStateChanges).toHaveBeenCalledTimes(3);
  });
});
