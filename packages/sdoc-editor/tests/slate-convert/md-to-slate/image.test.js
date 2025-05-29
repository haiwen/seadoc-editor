import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('image test', () => {
  it('paragraph > image', () => {
    const mdString = '![alt text](image.jpg "nihadoe")';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'image',
            data: {
              src: 'image.jpg',
              alt: 'alt text',
              title: 'nihadoe',
            },
            children: [
              { text: '' }
            ]
          },
          { text: '' },
        ]
      },
    ];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
