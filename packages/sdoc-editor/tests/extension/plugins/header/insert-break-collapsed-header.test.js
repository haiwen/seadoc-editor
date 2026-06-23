/** @jsx jsx */
import HeaderPlugin from '../../../../src/extension/plugins/header';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('collapsed header insert break', () => {
  it('inserts a new header before collapsed header when pressing enter at start', () => {
    const input = (
      <editor>
        <hh1 collapsed><cursor />hello</hh1>
        <hp>hidden body</hp>
        <hh1>next</hh1>
      </editor>
    );

    const output = (
      <editor>
        <hh1><htext></htext></hh1>
        <hh1 collapsed>hello</hh1>
        <hp>hidden body</hp>
        <hh1>next</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);
    editor.insertBreak();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('keeps collapsed header and inserts new header after hidden content when pressing enter in the middle', () => {
    const input = (
      <editor>
        <hh1 collapsed>he<cursor />llo</hh1>
        <hp>hidden body</hp>
        <hh1>next</hh1>
      </editor>
    );

    const output = (
      <editor>
        <hh1 collapsed>he</hh1>
        <hp>hidden body</hp>
        <hh1>llo</hh1>
        <hh1>next</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);
    editor.insertBreak();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
    expect(editor.selection).toEqual({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
  });

  it('keeps collapsed header and inserts same header type after hidden content when pressing enter at end', () => {
    const input = (
      <editor>
        <hh1 collapsed>hello<cursor /></hh1>
        <hp>hidden body</hp>
        <hh1>next</hh1>
      </editor>
    );

    const output = (
      <editor>
        <hh1 collapsed>hello</hh1>
        <hp>hidden body</hp>
        <hh1><htext></htext></hh1>
        <hh1>next</hh1>
      </editor>
    );

    const editor = createSdocEditor(input, [HeaderPlugin.editorPlugin]);
    editor.insertBreak();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
    expect(editor.selection).toEqual({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
  });
});
