import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('code block test', () => {
  it('code_block', () => {
    const nodes = [
      {
        type: 'code_block',
        lang: 'javascript',
        children: [
          {
            type: 'code_line',
            children: [
              { text: 'const a = \'nihao\';' },
            ]
          },
          {
            type: 'code_line',
            children: [
              { text: 'const b = \'wphao\';' },
            ]
          }
        ]
      },
    ];
    const expectResult = [
      {
        type: 'code',
        lang: 'javascript',
        value: 'const a = \'nihao\';\nconst b = \'wphao\';'
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
