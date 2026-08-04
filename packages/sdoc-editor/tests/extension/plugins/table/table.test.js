/** @jsx jsx */
import { Editor, Node, Range, Transforms } from '@seafile/slate';
import { withReact } from '@seafile/slate-react';
import { FileLinkPlugin, HtmlPlugin, LinkPlugin, SdocLinkPlugin } from '../../../../src/extension/plugins';
import TablePlugin from '../../../../src/extension/plugins/table';
import { syncRemoveTable } from '../../../../src/extension/plugins/table/helpers';
import withNodeId from '../../../../src/node-id';
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

  it('pastes a URL in a table cell as a link', async () => {
    const url = 'https://example.com/docs';
    const input = (
      <editor>
        <htable>
          <htrow>
            <htcell><htext><cursor /></htext></htcell>
          </htrow>
        </htable>
      </editor>
    );
    const clipboardData = {
      getData: (type) => type === 'text/plain' ? url : '',
      types: ['text/plain'],
    };
    const editor = createSdocEditor(input, [LinkPlugin.editorPlugin, TablePlugin.editorPlugin]);

    await editor.insertData(clipboardData);

    const [linkNode] = Array.from(Node.descendants(editor)).find(([node]) => node.type === 'link');
    expect(linkNode).toMatchObject({
      type: 'link',
      href: url,
      title: url,
      children: [{ text: url }],
    });
  });

  it.each([
    ['link', { href: 'https://example.com/docs', title: 'Example docs' }],
    ['sdoc_link', { doc_uuid: 'sdoc-uuid', title: 'Example SDoc' }],
    ['file_link', { doc_uuid: 'file-uuid', title: 'Example file' }],
  ])('pastes a copied SDoc %s node in a table cell without flattening it', async (type, attributes) => {
    const input = (
      <editor>
        <htable>
          <htrow>
            <htcell><htext><cursor /></htext></htcell>
          </htrow>
        </htable>
      </editor>
    );
    const sourceNode = {
      id: 'source-link-id',
      type,
      ...attributes,
      children: [{
        id: 'source-link-text-id',
        text: attributes.title,
        sdoc_comment_test: true,
        removed_test: true,
      }],
    };
    const fragment = window.btoa(encodeURIComponent(JSON.stringify([{
      id: 'source-paragraph-id',
      type: 'paragraph',
      children: [sourceNode],
    }])));
    const clipboardData = {
      getData: (dataType) => dataType === 'application/x-slate-fragment' ? fragment : attributes.title,
      types: ['application/x-slate-fragment', 'text/plain'],
    };
    const editor = createSdocEditor(input, [
      withReact,
      HtmlPlugin.editorPlugin,
      LinkPlugin.editorPlugin,
      TablePlugin.editorPlugin,
      SdocLinkPlugin.editorPlugin,
      FileLinkPlugin.editorPlugin,
      withNodeId,
    ]);

    await editor.insertData(clipboardData);

    const [linkNode, linkPath] = Array.from(Node.descendants(editor)).find(([node]) => node.type === type);
    expect(linkNode).toMatchObject({ type, ...attributes, children: [{ text: attributes.title }] });
    expect(linkNode.id).not.toBe(sourceNode.id);
    expect(linkNode.children[0]).not.toHaveProperty('sdoc_comment_test');
    expect(linkNode.children[0]).not.toHaveProperty('removed_test');
    expect(Editor.parent(editor, linkPath)[0].type).toBe('table_cell');
  });

  it('does not flatten links copied from multiple paragraphs into a table cell', async () => {
    const input = (
      <editor>
        <htable>
          <htrow>
            <htcell><htext><cursor /></htext></htcell>
          </htrow>
        </htable>
      </editor>
    );
    const sourceParagraphs = [
      {
        type: 'paragraph',
        children: [{ type: 'link', href: 'https://example.com/one', children: [{ text: 'First link' }] }],
      },
      {
        type: 'paragraph',
        children: [{ type: 'link', href: 'https://example.com/two', children: [{ text: 'Second link' }] }],
      },
    ];
    const fragment = window.btoa(encodeURIComponent(JSON.stringify(sourceParagraphs)));
    const clipboardData = {
      getData: (dataType) => dataType === 'application/x-slate-fragment' ? fragment : 'First link\nSecond link',
      types: ['application/x-slate-fragment', 'text/plain'],
    };
    const editor = createSdocEditor(input, [LinkPlugin.editorPlugin, TablePlugin.editorPlugin]);

    await editor.insertData(clipboardData);

    const pastedLinks = Array.from(Node.descendants(editor)).filter(([node]) => node.type === 'link');
    expect(pastedLinks).toHaveLength(0);
    expect(Node.string(editor.children[0].children[0].children[0])).toBe('First link\nSecond link');
  });

  it('delete selection from empty paragraph to the first table cell keeps a valid selection', () => {
    const input = (
      <editor>
        <hp><htext></htext></hp>
        <htable
          ui={{ 'alternate_highlight': false }}
          style={{ 'gridAutoRows': 'minmax(42}px, auto)', 'gridTemplateColumns': 'repeat(2, 100px)' }}
          columns={[{ width: 100 }, { width: 100 }]}
        >
          <htrow>
            <htcell><htext>a</htext></htcell>
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
          style={{ 'gridAutoRows': 'minmax(42}px, auto)', 'gridTemplateColumns': 'repeat(2, 100px)' }}
          columns={[{ width: 100 }, { width: 100 }]}
        >
          <htrow style={{ 'min_height': 42 }}>
            <htcell><htext><cursor /></htext></htcell>
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
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0, 0, 0], offset: 1 },
    });

    editor.deleteFragment();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
    expect(Range.isRange(editor.selection)).toBe(true);
    expect(Range.isCollapsed(editor.selection)).toBe(true);
    expect(Editor.hasPath(editor, editor.selection.anchor.path)).toBe(true);
    expect(Editor.hasPath(editor, editor.selection.focus.path)).toBe(true);
    expect(editor.selection.anchor).toEqual({ path: [0, 0, 0, 0], offset: 0 });
    expect(editor.selection.focus).toEqual({ path: [0, 0, 0, 0], offset: 0 });
  });

  it('delete selection from paragraph text to the first table cell collapses selection in table cell', () => {
    const input = (
      <editor>
        <hp><htext>xy</htext></hp>
        <htable
          ui={{ 'alternate_highlight': false }}
          style={{ 'gridAutoRows': 'minmax(42}px, auto)', 'gridTemplateColumns': 'repeat(2, 100px)' }}
          columns={[{ width: 100 }, { width: 100 }]}
        >
          <htrow>
            <htcell><htext>A</htext></htcell>
            <htcell><htext>B</htext></htcell>
          </htrow>
          <htrow>
            <htcell><htext>C</htext></htcell>
            <htcell><htext>D</htext></htcell>
          </htrow>
        </htable>
      </editor>
    );

    const output = (
      <editor>
        <hp><htext>x</htext></hp>
        <htable
          ui={{ 'alternate_highlight': false }}
          style={{ 'gridAutoRows': 'minmax(42}px, auto)', 'gridTemplateColumns': 'repeat(2, 100px)' }}
          columns={[{ width: 100 }, { width: 100 }]}
        >
          <htrow style={{ 'min_height': 42 }}>
            <htcell><htext><cursor /></htext></htcell>
            <htcell><htext>B</htext></htcell>
          </htrow>
          <htrow style={{ 'min_height': 42 }}>
            <htcell><htext>C</htext></htcell>
            <htcell><htext>D</htext></htcell>
          </htrow>
        </htable>
        <hp><htext></htext></hp>
      </editor>
    );

    const plugins = [TablePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0, 0, 0], offset: 1 },
    });

    editor.deleteFragment();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
    expect(Range.isRange(editor.selection)).toBe(true);
    expect(Range.isCollapsed(editor.selection)).toBe(true);
    expect(editor.selection.anchor).toEqual({ path: [1, 0, 0, 0], offset: 0 });
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0, 0], offset: 0 });
  });
});
