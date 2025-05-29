import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('paragraph test', () => {
  it('paragraph > strong > code', () => {
    const mdString = '**`nihaode`**';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [
      {
        type: 'paragraph',
        children: [
          {
            bold: true,
            code: true,
            text: 'nihaode'
          }
        ]
      },
    ];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
