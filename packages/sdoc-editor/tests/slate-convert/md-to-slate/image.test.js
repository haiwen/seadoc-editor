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

  it('paragraph > linked image', () => {
    const mdString = '[![alt text](image.jpg "nihadoe")](https://example.com)';
    const nodes = mdStringToSlate(mdString);

    expect(formatChildren(nodes)).toEqual([
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
              href: 'https://example.com',
            },
            children: [{ text: '' }]
          },
          { text: '' },
        ]
      },
    ]);
  });
});
