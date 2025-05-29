import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('paragraph test', () => {
  it('paragraph > text', () => {
    const mdString = 'nihaode';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [
      {
        type: 'paragraph',
        children: [
          { text: 'nihaode' }
        ]
      },
    ];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
