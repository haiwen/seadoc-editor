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
            <hp><htext>aa<cursor /></htext></hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><htext>aa</htext></hp>
          </hli>
          <hli>
            <hp><htext></htext></hp>
          </hli>
        </hol>
      </editor>
    );


    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertBreak();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('toggle empty list item test', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><htext>aa</htext></hp>
          </hli>
          <hli>
            <hp><htext><cursor /></htext></hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><htext>aa</htext></hp>
          </hli>
        </hol>
        <hp><htext></htext></hp>
      </editor>
    );


    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertBreak();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});

