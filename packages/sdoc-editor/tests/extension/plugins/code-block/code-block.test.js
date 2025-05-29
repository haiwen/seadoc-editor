/** @jsx jsx */
import { changeToCodeBlock, changeToPlainText } from '../../../../src/extension/plugins/code-block/helpers';
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
});
