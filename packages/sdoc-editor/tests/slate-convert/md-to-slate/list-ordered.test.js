import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('ordered_list test', () => {
  it('blockquote > list', () => {
    const mdString = '1. list_item1 \n2. list_item2 \n    1. list_item_child 2.1 \n    2. list_item_child 2.2 ';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'ordered_list',
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
            { type: 'ordered_list', children: [
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
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
