/** @jsx jsx */
import { changeToCodeBlock, changeToPlainText } from '../../../../src/extension/plugins/code-block/helpers';
import withCodeBlock from '../../../../src/extension/plugins/code-block/plugin';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('toggle code-block test', () => {
  it('add code-block test', () => {
    const input = (
      <editor>
        <hp><htext><cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hcodeblock language='text' style={{ white_space: 'nowrap' }}>
          <hcodeline><cursor /></hcodeline>
        </hcodeblock>
      </editor>
    );

    const editor = createSdocEditor(input);
    changeToCodeBlock(editor, 'text', 'current');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('change paragraph to code-block test', () => {
    const input = (
      <editor>
        <hp><htext>aaa<cursor /></htext></hp>
      </editor>
    );

    const output = (
      <editor>
        <hcodeblock language='text' style={{ white_space: 'nowrap' }}>
          <hcodeline>aaa<cursor /></hcodeline>
        </hcodeblock>
      </editor>
    );

    const editor = createSdocEditor(input);
    changeToCodeBlock(editor, 'text', 'current');

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('change code-block to paragraph test', () => {
    const input = (
      <editor>
        <hcodeblock language='text'>
          <hcodeline>aaa<cursor /></hcodeline>
        </hcodeblock>
      </editor>
    );

    const output = (
      <editor>
        <hp><htext>aaa<cursor /></htext></hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    changeToPlainText(editor);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('split code-line on enter in the middle of text', () => {
    const input = (
      <editor>
        <hcodeblock language='text'>
          <hcodeline>aaa<cursor />bbb</hcodeline>
        </hcodeblock>
        <hp><htext /></hp>
      </editor>
    );

    const output = (
      <editor>
        <hcodeblock language='text'>
          <hcodeline>aaa</hcodeline>
          <hcodeline><cursor />bbb</hcodeline>
        </hcodeblock>
        <hp><htext /></hp>
      </editor>
    );

    const editor = createSdocEditor(input, [withCodeBlock]);
    const event = {
      key: 'Enter',
      keyCode: 13,
      which: 13,
      preventDefault: jest.fn(),
    };

    editor.codeBlockOnKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('insert empty code-line after current line on enter at the end', () => {
    const input = (
      <editor>
        <hcodeblock language='text'>
          <hcodeline>aaa<cursor /></hcodeline>
          <hcodeline>bbb</hcodeline>
        </hcodeblock>
        <hp><htext /></hp>
      </editor>
    );

    const output = (
      <editor>
        <hcodeblock language='text'>
          <hcodeline>aaa</hcodeline>
          <hcodeline><cursor /></hcodeline>
          <hcodeline>bbb</hcodeline>
        </hcodeblock>
        <hp><htext /></hp>
      </editor>
    );

    const editor = createSdocEditor(input, [withCodeBlock]);

    editor.insertBreak();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
