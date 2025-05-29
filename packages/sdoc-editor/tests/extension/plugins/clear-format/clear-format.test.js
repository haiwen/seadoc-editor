/** @jsx jsx */
import { clearStyles } from '../../../../src/extension/plugins/clear-format/helpers';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('toggle clear format test', () => {

  it('clear format', () => {
    const input = (
      <editor>
        <hp>
          <htext BOLD={true} ITALIC={true}>bbb</htext>
        </hp>
      </editor>
    );

    const output = (
      <editor>
        <hp><htext>bbb</htext></hp>
      </editor>
    );


    const editor = createSdocEditor(input);
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    };

    clearStyles(editor);
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});
