import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('paragraph test', () => {
  it('paragraph > bold > italic', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            bold: true,
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
                type: 'strong',
                children: [
                  {
                    type: 'text',
                    value: 'nihaode',
                  }
                ]
              }
            ]
          }
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
