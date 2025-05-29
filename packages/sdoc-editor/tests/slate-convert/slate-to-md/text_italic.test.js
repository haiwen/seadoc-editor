import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('paragraph test', () => {
  it('paragraph > italic', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            italic: true,
            text: 'nihaode'
          }
        ]
      },
    ];

    const expectResult = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'emphasis',
            children: [
              {
                type: 'text',
                value: 'nihaode',
              }
            ]
          }
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
