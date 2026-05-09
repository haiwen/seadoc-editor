/** @jsx jsx */
import { CalloutPlugin, ListPlugin } from '../../../../src/extension/plugins';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('tab in callout', () => {
  it('keeps callout content unchanged', () => {
    const input = (
      <editor>
        <hcallout><hp>aa<cursor />bb</hp></hcallout>
      </editor>
    );

    const output = (
      <editor>
        <hcallout><hp>aa<cursor />bb</hp></hcallout>
      </editor>
    );

    const plugins = [CalloutPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    const event = {
      key: 'Tab',
      keyCode: 9,
      which: 9,
      preventDefault: jest.fn(),
    };

    editor.onHotKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('indents list item inside callout', () => {
    const input = (
      <editor>
        <hcallout>
          <hol>
            <hli>
              <hp>aa</hp>
            </hli>
            <hli>
              <hp><cursor />bb</hp>
            </hli>
          </hol>
        </hcallout>
      </editor>
    );

    const output = (
      <editor>
        <hcallout>
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
        </hcallout>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin, CalloutPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    const event = {
      key: 'Tab',
      keyCode: 9,
      which: 9,
      preventDefault: jest.fn(),
    };

    editor.onHotKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('outdents nested list item inside callout', () => {
    const input = (
      <editor>
        <hcallout>
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
        </hcallout>
      </editor>
    );

    const output = (
      <editor>
        <hcallout>
          <hol>
            <hli>
              <hp>aa</hp>
            </hli>
            <hli>
              <hp><cursor />bb</hp>
            </hli>
          </hol>
        </hcallout>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin, CalloutPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    const event = {
      key: 'Tab',
      keyCode: 9,
      which: 9,
      shiftKey: true,
      preventDefault: jest.fn(),
    };

    editor.onHotKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
