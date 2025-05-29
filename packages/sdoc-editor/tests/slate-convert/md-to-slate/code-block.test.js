import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('code_block test', () => {
  it.only('code_block', () => {
    // eslint-disable-next-line quotes
    const mdString = "```javascript\nconst a = 'nihao';\nconst b = 'wphao';";
    const nodes = mdStringToSlate(mdString);
    const expectResult = [
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

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
