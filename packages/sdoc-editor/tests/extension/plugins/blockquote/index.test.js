/** @jsx jsx */
import { BlockquotePlugin, ListPlugin, ParagraphPlugin } from '../../../../src/extension/plugins';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('delete in only one child blockquote at the end', () => {
  it('change paragraph to checkbox', () => {
    const input = (
      <editor>
        <hblockquote><hp>aaaa<cursor /></hp></hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote><hp>aaa</hp></hblockquote>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.deleteBackward();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});

describe('delete in only one child blockquote at the start', () => {
  it('change paragraph to checkbox', () => {
    const input = (
      <editor>
        <hblockquote><hp><cursor />aaaa</hp></hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hp>aaaa</hp>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.deleteBackward();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});

describe('tab in blockquote', () => {
  it('keeps blockquote content unchanged', () => {
    const input = (
      <editor>
        <hblockquote><hp>aa<cursor />bb</hp></hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote><hp>aa<cursor />bb</hp></hblockquote>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin];
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

  it('indents list item inside blockquote', () => {
    const input = (
      <editor>
        <hblockquote>
          <hol>
            <hli>
              <hp>aa</hp>
            </hli>
            <hli>
              <hp><cursor />bb</hp>
            </hli>
          </hol>
        </hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote>
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
        </hblockquote>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin, ListPlugin.editorPlugin];
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

  it('outdents nested list item inside blockquote', () => {
    const input = (
      <editor>
        <hblockquote>
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
        </hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote>
          <hol>
            <hli>
              <hp>aa</hp>
            </hli>
            <hli>
              <hp><cursor />bb</hp>
            </hli>
          </hol>
        </hblockquote>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin, ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    const event = {
      key: 'Tab',
      keyCode: 9,
      which: 9,
      shiftKey: true,
      preventDefault: jest.fn(),
    };

    editor.handleTab(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('indents list item inside blockquote with paragraph plugin enabled', () => {
    const input = (
      <editor>
        <hblockquote>
          <hol>
            <hli>
              <hp>aa</hp>
            </hli>
            <hli>
              <hp><cursor />bb</hp>
            </hli>
          </hol>
        </hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote>
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
        </hblockquote>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin, ListPlugin.editorPlugin, ParagraphPlugin.editorPlugin];
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
