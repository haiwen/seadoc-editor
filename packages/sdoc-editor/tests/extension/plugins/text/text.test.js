/** @jsx jsx */
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('toggle list test', () => {
  it('toggle paragraph to order list', () => {
    const input = (
      <editor>
        <hp>
          <htext>aa<cursor /></htext>
        </hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext>aa</htext>
        </hp>
        <hp>
          <htext></htext>
        </hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    editor.insertBreak();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });


});
