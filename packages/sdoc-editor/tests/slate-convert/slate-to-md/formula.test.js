import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('formula test', () => {
  it('formula', () => {
    const nodes = [
      {
        type: 'formula',
        data: { formula: 'a + a' },
        children: [
          {
            text: ''
          }
        ]
      },
    ];

    const expectResult = [
      {
        type: 'math',
        value: 'a + a'
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
