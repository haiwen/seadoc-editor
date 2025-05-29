import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('paragraph test', () => {
  it('paragraph > code', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            code: true,
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
            type: 'inlineCode',
            value: 'nihaode',
          }
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
