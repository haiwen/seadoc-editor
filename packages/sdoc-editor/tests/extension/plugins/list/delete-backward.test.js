/** @jsx jsx */
import ListPlugin from '../../../../src/extension/plugins/list';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('delete at list start position', () => {
  it('delete at list start position', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><cursor />aa</hp>
          </hli>
          <hli>
            <hp>bb</hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hp>aa</hp>
        <hol>
          <hli>
            <hp>bb</hp>
          </hli>
        </hol>
      </editor>
    );


    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.deleteBackward(editor);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});

describe('delete at list start position', () => {
  it('delete at list start position', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aa</hp>
            <hol>
              <hli>
                <hp><cursor /></hp>
              </hli>
            </hol>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aa</hp>
          </hli>
        </hol>
      </editor>
    );


    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.deleteBackward(editor);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});
