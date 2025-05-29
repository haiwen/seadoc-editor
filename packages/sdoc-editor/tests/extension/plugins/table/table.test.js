/** @jsx jsx */
import TablePlugin from '../../../../src/extension/plugins/table';
import { syncRemoveTable } from '../../../../src/extension/plugins/table/helpers';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('table operations tests', () => {
  it('delete the entire table', () => {
    const input = (
      <editor>
        <htable>
          <htrow>
            <htcell><htext><anchor /><focus />Cell 1</htext></htcell>
            <htcell><htext>Cell 2</htext></htcell>
          </htrow>
          <htrow>
            <htcell><htext>Cell 3</htext></htcell>
            <htcell><htext>Cell 4</htext></htcell>
          </htrow>
        </htable>
      </editor>
    );

    const output = { children: [] };

    const plugins = [TablePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    const tablePath = [0];

    syncRemoveTable(editor, tablePath);
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('delete the content in the cell', () => {
    const input = (
      <editor>
        <htable>
          <htrow>
            <htcell><htext>ab<cursor /></htext></htcell>
            <htcell><htext>Cell 2</htext></htcell>
          </htrow>
          <htrow>
            <htcell><htext>Cell 3</htext></htcell>
            <htcell><htext>Cell 4</htext></htcell>
          </htrow>
        </htable>
      </editor>
    );

    const output = (
      <editor>
        <htable
          ui={{ 'alternate_highlight': false }}
          style={{ 'gridAutoRows': 'minmax(42}px, auto)', 'gridTemplateColumns': 'repeat(2, NaNpx)' }}
          columns={[{ width: NaN }, { width: NaN }]}
        >
          <htrow style={{ 'min_height': 42 }}>
            <htcell><htext>a<cursor /></htext></htcell>
            <htcell><htext>Cell 2</htext></htcell>
          </htrow>
          <htrow style={{ 'min_height': 42 }}>
            <htcell><htext>Cell 3</htext></htcell>
            <htcell><htext>Cell 4</htext></htcell>
          </htrow>
        </htable>
        <hp><htext></htext></hp>
      </editor>
    );

    const plugins = [TablePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);

    editor.deleteBackward();
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
