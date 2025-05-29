import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('paragraph test', () => {
  it('paragraph > italic > code', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            code: true,
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
                type: 'inlineCode',
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
