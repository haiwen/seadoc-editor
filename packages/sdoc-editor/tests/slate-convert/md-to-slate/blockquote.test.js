
import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('blockquote test', () => {
  it('blockquote > paragraph', () => {
    const mdString = '> nihaode';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
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

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > table', () => {
    const mdString = '> |name|sex|age| \n > |-|-|-| \n > |alex|man|24|';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'table',
          align: [null, null, null],
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

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > list', () => {
    const mdString = '> name \n > - list_item1 \n > - list_item2 \n >   - list_item_child 2.1 \n >   - list_item_child 2.2 ';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
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

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > check_list', () => {
    const mdString = '> name \n > - [x] Write the press release \n > - [ ] Update the website \n > - [ ] Contact the media ';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
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

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > header', () => {
    const mdString = '> # header1 \n> ## header2 \n> ### header3 \n> #### header4 \n> ##### header5 \n> ###### header6';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
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

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
