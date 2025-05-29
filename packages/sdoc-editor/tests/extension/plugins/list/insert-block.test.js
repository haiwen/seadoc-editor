/** @jsx jsx */
import ListPlugin from '../../../../src/extension/plugins/list';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('toggle list test', () => {
  it('toggle paragraph to order list', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>a<cursor />a</hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>a</hp>
          </hli>
          <hli>
            <hp>a</hp>
          </hli>
        </hol>
      </editor>
    );


    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertBreak(editor);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});
