import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('unordered_list test', () => {
  it('blockquote > list', () => {
    const mdString = '- list_item1 \n- list_item2 \n  - list_item_child 2.1 \n   - list_item_child 2.2 ';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
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
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
