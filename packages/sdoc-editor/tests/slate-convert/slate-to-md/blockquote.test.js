import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('blockquote test', () => {
  it('blockquote > paragraph', () => {
    const slateNodes = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'nihaode' }
          ]
        },
      ]
    }];
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'nihaode',
            }
          ]
        },
      ]
    }];

    expect(formatSlateToMd(slateNodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > table', () => {
    const slateNodes = [{
      type: 'blockquote',
      children: [
        {
          type: 'table',
          children: [
            {
              type: 'table_row',
              children: [
                { type: 'table_cell', children: [{ text: 'name' }] },
                { type: 'table_cell', children: [{ text: 'sex' }] },
                { type: 'table_cell', children: [{ text: 'age' }] },
              ]
            },
            {
              type: 'table_row',
              children: [
                { type: 'table_cell', children: [{ text: 'alex' }] },
                { type: 'table_cell', children: [{ text: 'man' }] },
                { type: 'table_cell', children: [{ text: '24' }] },
              ]
            }
          ]
        },
      ]
    }];

    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'table',
          align: [null, null],
          children: [
            {
              type: 'tableRow',
              children: [
                { type: 'tableCell', children: [{ type: 'text', value: 'name' }] },
                { type: 'tableCell', children: [{ type: 'text', value: 'sex' }] },
                { type: 'tableCell', children: [{ type: 'text', value: 'age' }] },
              ]
            },
            {
              type: 'tableRow',
              children: [
                { type: 'tableCell', children: [{ type: 'text', value: 'alex' }] },
                { type: 'tableCell', children: [{ type: 'text', value: 'man' }] },
                { type: 'tableCell', children: [{ type: 'text', value: '24' }] },
              ]
            }
          ]
        },
      ]
    }];

    expect(formatSlateToMd(slateNodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > list', () => {
    const slateNodes = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'name' },
          ]
        },
        {
          type: 'unordered_list',
          children: [
            {
              type: 'list_item',
              children: [
                { type: 'paragraph', children: [{ text: 'list_item1' }] },
              ]
            },
            {
              type: 'list_item',
              children: [
                { type: 'paragraph', children: [{ text: 'list_item2' }] },
                { type: 'unordered_list', children: [
                  {
                    type: 'list_item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'list_item_child 2.1' }] },
                    ]
                  },
                  {
                    type: 'list_item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'list_item_child 2.2' }] },
                    ]
                  },
                ] },
              ]
            }
          ]
        },
      ]
    }];

    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'name'
            },
          ]
        },
        {
          type: 'list',
          'loose': true,
          'ordered': false,
          'start': 1,
          children: [
            {
              type: 'listItem',
              loose: false,
              checked: null,
              children: [
                { type: 'paragraph', children: [{ type: 'text', value: 'list_item1' }] },
              ]
            },
            {
              type: 'listItem',
              'loose': true,
              checked: null,
              children: [
                { type: 'paragraph', children: [{ type: 'text', value: 'list_item2' }] },
                {
                  type: 'list',
                  'loose': false,
                  'ordered': false,
                  'start': 1,
                  children: [
                    {
                      type: 'listItem',
                      'loose': false,
                      'checked': null,
                      children: [
                        { type: 'paragraph', children: [{ type: 'text', value: 'list_item_child 2.1' }] },
                      ]
                    },
                    {
                      type: 'listItem',
                      'loose': false,
                      checked: null,
                      children: [
                        { type: 'paragraph', children: [{ type: 'text', value: 'list_item_child 2.2' }] },
                      ]
                    },
                  ] },
              ]
            }
          ]
        },
      ]
    }];

    expect(formatSlateToMd(slateNodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > check_list', () => {
    const nodes = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'name' },
          ]
        },
        {
          type: 'check_list_item',
          checked: true,
          children: [
            { text: 'Write the press release' },
          ]
        },
        {
          type: 'check_list_item',
          checked: false,
          children: [
            { text: 'Update the website' },
          ]
        },
        {
          type: 'check_list_item',
          checked: false,
          children: [
            { text: 'Contact the media' },
          ]
        },
      ]
    }];
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'name'
            },
          ]
        },
        {
          type: 'list',
          'ordered': false,
          'spread': false,
          'start': null,
          children: [
            {
              type: 'listItem',
              checked: true,
              'spread': false,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { type: 'text', value: 'Write the press release' },
                  ]
                }
              ]
            },
          ]
        },
        {
          type: 'list',
          'ordered': false,
          'spread': false,
          'start': null,
          children: [
            {
              type: 'listItem',
              checked: false,
              'spread': false,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { type: 'text', value: 'Update the website' },
                  ]
                }
              ]
            },
          ]
        },
        {
          type: 'list',
          'ordered': false,
          'spread': false,
          'start': null,
          children: [
            {
              type: 'listItem',
              checked: false,
              'spread': false,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { type: 'text', value: 'Contact the media' },
                  ]
                }
              ]
            },
          ]
        }
      ]
    }];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > header', () => {
    const nodes = [{
      type: 'blockquote',
      children: [
        {
          type: 'header1',
          children: [
            { text: 'header1' },
          ]
        },
        {
          type: 'header2',
          children: [
            { text: 'header2' },
          ]
        },
        {
          type: 'header3',
          children: [
            { text: 'header3' },
          ]
        },
        {
          type: 'header4',
          children: [
            { text: 'header4' },
          ]
        },
        {
          type: 'header5',
          children: [
            { text: 'header5' },
          ]
        },
        {
          type: 'header6',
          children: [
            { text: 'header6' },
          ]
        },
      ]
    }];
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [
            { type: 'text', value: 'header1' },
          ]
        },
        {
          type: 'heading',
          depth: 2,
          children: [
            { type: 'text', value: 'header2' },
          ]
        },
        {
          type: 'heading',
          depth: 3,
          children: [
            { type: 'text', value: 'header3' },
          ]
        },
        {
          type: 'heading',
          depth: 4,
          children: [
            { type: 'text', value: 'header4' },
          ]
        },
        {
          type: 'heading',
          depth: 5,
          children: [
            { type: 'text', value: 'header5' },
          ]
        },
        {
          type: 'heading',
          depth: 6,
          children: [
            { type: 'text', value: 'header6' },
          ]
        },
      ]
    }];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
