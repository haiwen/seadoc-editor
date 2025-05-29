import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('table test', () => {
  it('table', () => {
    const slateNodes = [
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
    ];

    const expectResult = [
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
    ];

    expect(formatSlateToMd(slateNodes)).toEqual(expectResult);
  });
});
