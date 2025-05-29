import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('unordered_list test', () => {
  it('unordered list', () => {
    const nodes = [{
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
    const expectResult = [{
      type: 'list',
      loose: true,
      ordered: false,
      start: 1,
      children: [
        {
          type: 'listItem',
          checked: null,
          loose: false,
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 'list_item1' }] },
          ]
        },
        {
          type: 'listItem',
          loose: true,
          checked: null,
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 'list_item2' }] },
            { type: 'list', loose: false, ordered: false, start: 1, children: [
              {
                type: 'listItem',
                checked: null,
                loose: false,
                children: [
                  { type: 'paragraph', children: [{ type: 'text', value: 'list_item_child 2.1' }] },
                ]
              },
              {
                type: 'listItem',
                checked: null,
                loose: false,
                children: [
                  { type: 'paragraph', children: [{ type: 'text', value: 'list_item_child 2.2' }] },
                ]
              },
            ] },
          ]
        }
      ]
    }];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
