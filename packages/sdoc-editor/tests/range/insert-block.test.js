/** @jsx jsx */
import { jsx, createSdocEditor, formatChildren } from '../core';
import Plugins from '../plugins';

describe('toggle delete test', () => {
  it.only('toggle paragraph to order list', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <anchor />
        <hol>
          <hli>
            <hp>a<cursor />a</hp>
          </hli>
        </hol>
        <htodoli >
          aaaa
        </htodoli>
        <hp>
          <htext></htext>
          <ha href='http://localhost:7003/simple-editor' title='测试链接'>
            测试链接
          </ha>
          <htext></htext>
        </hp>
        <focus />
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
      </editor>
    );


    const pluginFuncs = Plugins.map(item => item.editorPlugin).filter(Boolean);
    const editor = createSdocEditor(input, pluginFuncs);
    editor.deleteFragment(editor);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});
