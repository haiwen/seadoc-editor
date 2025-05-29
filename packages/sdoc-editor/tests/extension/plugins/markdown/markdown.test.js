/** @jsx jsx */
import { MarkDownPlugin } from '../../../../src/extension/plugins';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('toggle code-block test', () => {
  it('header', () => {
    const input = (
      <editor>
        <hp><htext><cursor />aaa</htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hh2><htext>aaa</htext></hh2>
      </editor>
    );

    const plugins = [MarkDownPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertText('##');
    editor.insertText(' ');
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('blockquote', () => {
    const input = (
      <editor>
        <hp><htext><cursor />aaaa</htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote>
          <hp>
            <htext>aaaa</htext>
          </hp>
        </hblockquote>
      </editor>
    );

    const plugins = [MarkDownPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);

    editor.insertText('>');
    editor.insertText(' ');
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('bold', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext bold={true}>bbb</htext>
        </hp>
      </editor>
    );

    const plugins = [MarkDownPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);

    editor.insertText('**bbb**');
    editor.insertText(' ');
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('italic', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext italic={true}>bbb</htext>
        </hp>
      </editor>
    );

    const plugins = [MarkDownPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);

    editor.insertText('*bbb*');
    editor.insertText(' ');
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('bold and italic', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext italic={true} bold={true}>bbb</htext>
        </hp>
      </editor>
    );

    const plugins = [MarkDownPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);

    editor.insertText('***bbb***');
    editor.insertText(' ');
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('unordered_list', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hul>
          <hli>
            <hp>bbb</hp>
          </hli>
        </hul>
      </editor>
    );

    const plugins = [MarkDownPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);

    editor.insertText('*');
    editor.insertText(' ');
    editor.insertText('bbb');
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
