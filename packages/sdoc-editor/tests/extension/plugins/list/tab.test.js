/** @jsx jsx */
import { ListPlugin, ParagraphPlugin } from '../../../../src/extension/plugins';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('tab in list', () => {
  it('indents list item with paragraph plugin enabled', () => {
    const input = (
      <editor>
        <hol>
          <hli>
            <hp>aa</hp>
          </hli>
          <hli>
            <hp><cursor />bb</hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hol>
          <hli>
            <hp>aa</hp>
            <hol>
              <hli>
                <hp><cursor />bb</hp>
              </hli>
            </hol>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin, ParagraphPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    const event = {
      key: 'Tab',
      keyCode: 9,
      which: 9,
      preventDefault: jest.fn(),
    };

    editor.handleTab(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
