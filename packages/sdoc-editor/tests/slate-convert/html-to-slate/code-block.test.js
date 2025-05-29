import { deserializeHtml } from '../../../src';
import { formatChildren } from '../../core/utils';


describe('deserialize code-block', () => {
  it('pre > code to slate node', () => {
    const html = [
      '<pre>',
      '<code>const seafile = \'seafile\'</code>',
      '</pre>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'const seafile = \'seafile\''
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });
});
