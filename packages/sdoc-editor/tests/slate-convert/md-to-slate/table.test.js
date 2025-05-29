import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('table test', () => {
  it('table', () => {
    const mdString = '|name|sex|age| \n |-|-|-| \n |alex|man|24|';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [
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
    ];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
