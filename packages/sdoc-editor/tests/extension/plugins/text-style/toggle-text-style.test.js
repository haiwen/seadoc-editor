/** @jsx jsx */
import { Editor } from '@seafile/slate';
import { addMark, removeMark } from '../../../../src/extension/plugins/text-style/helpers';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('toggle text-style test', () => {
  it('add bold mark test', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext BOLD={true}>bbb</htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    addMark(editor, 'BOLD');
    Editor.insertText(editor, 'bbb');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('add italic mark test', () => {
    const input = (
      <editor>
        <hp><htext>aaa<cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext>aaa</htext>
          <htext ITALIC={true}>bbb</htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    addMark(editor, 'ITALIC');
    Editor.insertText(editor, 'bbb');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('add bold and italic mark test', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext BOLD={true} ITALIC={true}>bbb</htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    addMark(editor, 'BOLD');
    addMark(editor, 'ITALIC');
    Editor.insertText(editor, 'bbb');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('remove bold mark test', () => {
    const input = (
      <editor>
        <hp>
          <htext BOLD={true}>aaa<cursor /></htext>
        </hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext BOLD={true}>aaa</htext>
          <htext>bbb</htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    removeMark(editor, 'BOLD');
    Editor.insertText(editor, 'bbb');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('remove italic mark test', () => {
    const input = (
      <editor>
        <hp>
          <htext ITALIC={true}>aaa<cursor /></htext>
        </hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext ITALIC={true}>aaa</htext>
          <htext>bbb</htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    removeMark(editor, 'ITALIC');
    Editor.insertText(editor, 'bbb');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('remove bold and italic mark test', () => {
    const input = (
      <editor>
        <hp><htext BOLD={true} ITALIC={true}>aaa<cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext BOLD={true} ITALIC={true}>aaa</htext>
          <htext>bbb</htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    removeMark(editor, 'BOLD');
    removeMark(editor, 'ITALIC');
    Editor.insertText(editor, 'bbb');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
