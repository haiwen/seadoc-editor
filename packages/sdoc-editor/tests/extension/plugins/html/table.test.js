import { createEditor, Editor, Node, Transforms } from '@seafile/slate';
import { withReact } from '@seafile/slate-react';
import { deserializeHtml, deserializePastedHtml } from '../../../../src/extension/plugins/html/helper';
import withHtml from '../../../../src/extension/plugins/html/plugin';
import withParagraph from '../../../../src/extension/plugins/paragraph/plugin';
import withTable from '../../../../src/extension/plugins/table/plugin';
import { formatChildren } from '../../../core/utils';
import { reloadTableFromServer } from './fixtures/server-table-reload';

const usageTableHtml = `
  <table>
    <caption>Usage <strong>comparison</strong></caption>
    <colgroup><col><col><col></colgroup>
    <thead>
      <tr>
        <th>Version</th>
        <th>Session</th>
        <th>Credit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th><span>Old</span></th>
        <td><div>dd071719</div></td>
        <td><div> 31.30 </div></td>
      </tr>
      <tr>
        <th><span>New</span></th>
        <td><div>d6130cf9</div></td>
        <td><div>32.05</div></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th colspan="2">Change</th>
        <td><div>+2.4%</div></td>
      </tr>
    </tfoot>
  </table>
`;

describe('deserialize table', () => {
  it('keeps a table cell valid when an image is downgraded', () => {
    const html = '<table><tbody><tr><td><img /></td></tr></tbody></table>';

    expect(formatChildren(deserializeHtml(html))).toEqual([
      {
        type: 'table',
        children: [
          {
            type: 'table_row',
            children: [
              {
                type: 'table_cell',
                children: [{ text: '' }]
              }
            ]
          }
        ]
      }
    ]);
  });

  it('keeps captions outside indented tables and preserves footer merges and cell whitespace', () => {
    const [caption, table] = deserializePastedHtml(usageTableHtml);

    expect(formatChildren(caption)).toEqual({
      type: 'paragraph',
      children: [{ text: 'Usage ' }, { text: 'comparison', bold: true }],
    });
    expect(table.type).toBe('table');
    expect(table.children.map(row => row.type)).toEqual(Array(4).fill('table_row'));
    expect(table.children.map(row => row.children.map(Node.string))).toEqual([
      ['Version', 'Session', 'Credit'],
      ['Old', 'dd071719', ' 31.30 '],
      ['New', 'd6130cf9', '32.05'],
      ['Change', '', '+2.4%'],
    ]);
    expect(table.children.every(row => row.children.every(cell => cell.type === 'table_cell'))).toBe(true);
    expect(table.children[3].children[0]).toMatchObject({ rowspan: 1, colspan: 2 });
    expect(table.children[3].children[1]).toMatchObject({ is_combined: true });
  });

  it('preserves row and column spans with a cell for every grid position', () => {
    const [table] = deserializePastedHtml(`
      <table><tbody>
        <tr><td rowspan="2" colspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td colspan="2">D</td></tr>
        <tr><td>E</td><td>F</td><td>G</td><td>H</td></tr>
      </tbody></table>
    `);

    expect(table.children.map(row => row.children.map(Node.string))).toEqual([
      ['A', '', 'B', 'C'],
      ['', '', 'D', ''],
      ['E', 'F', 'G', 'H'],
    ]);
    expect(table.children[0].children[0]).toMatchObject({ rowspan: 2, colspan: 2 });
    expect(table.children[1].children[2]).toMatchObject({ rowspan: 1, colspan: 2 });
    for (const [row, column] of [[0, 1], [1, 0], [1, 1], [1, 3]]) {
      expect(table.children[row].children[column]).toMatchObject({
        type: 'table_cell',
        is_combined: true,
        children: [{ text: '' }],
      });
    }
    const ids = Array.from(Node.nodes(table), ([node]) => node.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(['td', 'th'])('unwraps div and p inside %s while preserving text styles and links', (tag) => {
    const [table] = deserializePastedHtml(`<table><tr><${tag}><div>Before </div><div><p><strong style="color: #ff0000; font-size: 16px">Bold</strong> <a href="https://example.com">Link</a></p></div><p> After</p></${tag}></tr></table>`);
    const cell = table.children[0].children[0];

    expect(formatChildren(cell.children)).toEqual([
      { text: 'Before ' },
      { text: 'Bold', bold: true, color: 'rgb(255, 0, 0)', font_size: 12 },
      { text: ' ' },
      { type: 'link', href: 'https://example.com/', title: null, children: [{ text: 'Link' }] },
      { text: ' After' },
    ]);
    expect(Node.string(cell)).toBe('Before Bold Link After');
  });

  it.each(['div', 'p'])('unwraps consecutive %s elements without adding line breaks', (tag) => {
    const [table] = deserializePastedHtml(`<table><tr><td><${tag}>First</${tag}><${tag}>Second</${tag}></td></tr></table>`);

    expect(formatChildren(table.children[0].children[0].children)).toEqual([
      { text: 'First' },
      { text: 'Second' },
    ]);
  });

  it('keeps a text child when a cell contains only an empty paragraph', () => {
    const [table] = deserializePastedHtml('<table><tr><td><p></p></td></tr></table>');

    expect(formatChildren(table.children[0].children[0].children)).toEqual([{ text: '' }]);
  });

  describe.each(['td', 'th'])('%s content after server reload', (tag) => {
    it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])('converts %s to plain text', (heading) => {
      const [table] = deserializePastedHtml(`<table><tr><${tag}><${heading}><strong style="color: #ff0000">Important</strong> <a href="https://example.com">Link</a></${heading}></${tag}></tr></table>`);
      const children = table.children[0].children[0].children;

      expect(formatChildren(children)).toEqual([{ text: 'Important Link' }]);
      expect(reloadTableFromServer(table)).toEqual(table);
    });

    it('takes all text from a quote including nested blocks', () => {
      const [table] = deserializePastedHtml(`<table><tr><${tag}><blockquote><h3><i>Quote</i></h3><ul><li><h4>Item</h4><blockquote><p>Details</p></blockquote><ol><li><p>Nested</p></li></ol></li></ul><p>After</p></blockquote></${tag}></tr></table>`);
      const cell = table.children[0].children[0];

      expect(formatChildren(cell.children)).toEqual([{ text: 'QuoteItemDetailsNestedAfter' }]);
      expect(Node.string(cell)).toBe('QuoteItemDetailsNestedAfter');
      expect(reloadTableFromServer(table)).toEqual(table);
    });

    it('takes nested table text and keeps surrounding inline content', () => {
      const [table] = deserializePastedHtml(`<table><tr><${tag}><strong>Before</strong><table><tr><td>Inner</td></tr></table><a href="https://example.com">After</a></${tag}></tr></table>`);

      expect(formatChildren(table.children[0].children[0].children)).toEqual([
        { text: 'Before', bold: true },
        { text: 'Inner' },
        { type: 'link', href: 'https://example.com/', title: null, children: [{ text: 'After' }] },
      ]);
      expect(reloadTableFromServer(table)).toEqual(table);
    });

    it('keeps code lines, blank lines, indentation and trailing newlines', () => {
      const code = 'const x = 1;\n\n  console.log(x);\n';
      const [table] = deserializePastedHtml(`<table><tr><${tag}><pre><code>${code}</code></pre></${tag}></tr></table>`);
      const cell = table.children[0].children[0];

      expect(Node.string(cell)).toBe(code);
      expect(cell.children.every(child => typeof child.text === 'string')).toBe(true);
      expect(reloadTableFromServer(table)).toEqual(table);
    });

    it('normalizes blocks inside list items without removing paragraph or list structure', () => {
      const [table] = deserializePastedHtml(`<table><tr><${tag}><ul><li><p>First</p><p><strong>Second</strong></p><pre><code>line 1\nline 2</code></pre></li></ul></${tag}></tr></table>`);
      const item = table.children[0].children[0].children[0].children[0];

      expect(item.children.map(child => child.type)).toEqual(['paragraph', 'paragraph', 'paragraph']);
      expect(item.children.map(Node.string)).toEqual(['First', 'Second', 'line 1\nline 2']);
      expect(item.children[1].children[0]).toMatchObject({ text: 'Second', bold: true });
      expect(reloadTableFromServer(table)).toEqual(table);
    });

    it.each(['<h3></h3>', '<blockquote></blockquote>', '<pre><code></code></pre>', '<hr>'])('keeps an empty cell valid for %s', (content) => {
      const [table] = deserializePastedHtml(`<table><tr><${tag}>${content}</${tag}></tr></table>`);

      expect(formatChildren(table.children[0].children[0].children)).toEqual([{ text: '' }]);
      expect(reloadTableFromServer(table)).toEqual(table);
    });
  });

  it('keeps headings, quotes and code blocks outside cells as blocks', () => {
    const nodes = deserializePastedHtml('<h3>Heading</h3><blockquote><p>Quote</p></blockquote><pre><code>Code</code></pre><table><tr><td><h3>Cell</h3></td></tr></table>');

    expect(nodes.map(node => node.type)).toEqual(['header3', 'blockquote', 'code_block', 'table']);
    expect(nodes.map(Node.string)).toEqual(['Heading', 'Quote', 'Code', 'Cell']);
  });

  it('preserves pasted cell content through JSON save, server normalization and editor reload', () => {
    const makeEditor = () => {
      const editor = withParagraph(withTable(withHtml(withReact(createEditor()))));
      editor.width = 900;
      return editor;
    };
    const editor = makeEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    editor.insertData({
      types: ['text/html', 'text/plain'],
      getData: type => type === 'text/html' ? '<table><tr><th><h3><strong>Important</strong></h3></th><td><blockquote><p><i>Quote</i></p></blockquote></td><td><pre><code>first\nsecond</code></pre></td><td><ul><li><h4>Item</h4><ol><li>Nested</li></ol></li></ul></td></tr></table>' : '',
    });
    const pastedTable = editor.children.find(node => node.type === 'table');
    const reloadedTable = reloadTableFromServer(pastedTable);

    expect(pastedTable.children[0].children.map(Node.string)).toEqual(['Important', 'Quote', 'first\nsecond', 'ItemNested']);
    expect(reloadedTable).toEqual(pastedTable);
    const reloadedEditor = makeEditor();
    reloadedEditor.children = [reloadedTable, { type: 'paragraph', children: [{ text: '' }] }];
    Editor.normalize(reloadedEditor, { force: true });
    expect(reloadedEditor.children[0]).toEqual(pastedTable);
    expect(formatChildren(reloadedEditor.children[0].children[0].children[0].children)).toEqual([{ text: 'Important' }]);
    expect(formatChildren(reloadedEditor.children[0].children[0].children[1].children)).toEqual([{ text: 'Quote' }]);
  });

  it('keeps paragraphs outside table cells as blocks', () => {
    const nodes = deserializePastedHtml('<p>Before</p><table><caption><p>Caption</p></caption><tr><td><p>Cell</p></td></tr></table><p>After</p>');

    expect(nodes.map(node => node.type)).toEqual(['paragraph', 'paragraph', 'table', 'paragraph']);
    expect(nodes.filter(node => node.type === 'paragraph').map(Node.string)).toEqual(['Before', 'Caption', 'After']);
  });

  it.each(['0', '99'])('keeps rowspan="%s" within its row group', (rowspan) => {
    const [table] = deserializePastedHtml(`
      <table>
        <thead>
          <tr><th rowspan="${rowspan}">Header</th><th>First value</th></tr>
          <tr><th>Second value</th></tr>
        </thead>
        <tbody><tr><td>Body</td><td>Value</td></tr></tbody>
      </table>
    `);

    expect(table.children.map(row => row.children.map(Node.string))).toEqual([
      ['Header', 'First value'],
      ['', 'Second value'],
      ['Body', 'Value'],
    ]);
    expect(table.children[0].children[0]).toMatchObject({ rowspan: 2, colspan: 1 });
    expect(table.children[1].children[0]).toMatchObject({ is_combined: true });
    expect(table.children[2].children[0]).not.toHaveProperty('is_combined');
  });

  it('pads short and empty rows and supplies text children for empty cells', () => {
    const [table] = deserializePastedHtml(`
      <table><tbody>
        <tr></tr>
        <tr><td>A</td><td></td><td>C</td></tr>
        <tr><td>D</td></tr>
      </tbody></table>
    `);

    expect(table.children.map(row => row.children.map(Node.string))).toEqual([
      ['', '', ''],
      ['A', '', 'C'],
      ['D', '', ''],
    ]);
    expect(table.children.every(row => row.children.every(cell => cell.children.length > 0))).toBe(true);
  });

  it.each(['<table></table>', '<table><tbody><tr></tr></tbody></table>'])(
    'does not create an invalid table from %s', (html) => {
      expect(formatChildren(deserializePastedHtml(html))).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
    }
  );

  it('preserves the caption of a table without cells as a paragraph', () => {
    expect(formatChildren(deserializePastedHtml('<table><caption>Usage</caption></table>'))).toEqual([
      { type: 'paragraph', children: [{ text: 'Usage' }] },
    ]);
  });

  it('pastes an indented table with a caption and merged footer through the HTML and table plugins', () => {
    const editor = withTable(withHtml(withReact(createEditor())));
    editor.width = 900;
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    const clipboardData = {
      types: ['text/html', 'text/plain'],
      getData: type => type === 'text/html' ? usageTableHtml : '',
    };

    expect(() => editor.insertData(clipboardData)).not.toThrow();

    const table = editor.children.find(node => node.type === 'table');
    expect(table.columns).toHaveLength(3);
    expect(table.children.map(row => row.children.map(Node.string))).toEqual([
      ['Version', 'Session', 'Credit'],
      ['Old', 'dd071719', ' 31.30 '],
      ['New', 'd6130cf9', '32.05'],
      ['Change', '', '+2.4%'],
    ]);
    expect(editor.children[editor.children.length - 1].type).toBe('paragraph');
    expect(() => Editor.leaf(editor, editor.selection.anchor)).not.toThrow();
  });

  it('inserts a line break at the start of a pasted cell instead of creating a paragraph', () => {
    const editor = withParagraph(withTable(withHtml(withReact(createEditor()))));
    editor.width = 900;
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    editor.insertData({
      types: ['text/html', 'text/plain'],
      getData: type => type === 'text/html' ? '<table><tr><td><p>Cell</p></td></tr></table>' : '',
    });
    const tableIndex = editor.children.findIndex(node => node.type === 'table');
    const cellPath = [tableIndex, 0, 0];
    Transforms.select(editor, Editor.start(editor, cellPath));

    editor.insertBreak();

    const cell = Node.get(editor, cellPath);
    expect(Node.string(cell)).toBe('\n\uFEFFCell');
    expect(cell.children.every(child => typeof child.text === 'string')).toBe(true);
    expect(() => Editor.leaf(editor, editor.selection.anchor)).not.toThrow();
  });
});
