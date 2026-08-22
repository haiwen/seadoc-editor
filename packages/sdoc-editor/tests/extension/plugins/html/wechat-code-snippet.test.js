import { deserializePastedHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';

describe('deserialize WeChat code snippet', () => {
  it('discards the line index while preserving surrounding content, code lines, and spaces', () => {
    const html = [
      '<p>before</p>',
      '<section class="code-snippet__fix code-snippet__js">',
      '<ul class="code-snippet__line-index code-snippet__js">',
      '<li></li>',
      '<li></li>',
      '</ul>',
      '<pre class="code-snippet__js" data-lang="nginx">',
      '<code style="white-space: pre-wrap; display: flex;">',
      '<span leaf=""><span class="code-snippet__attribute">first</span>&nbsp;',
      '<span class="code-snippet__variable">second</span>-third</span>',
      '</code>',
      '<code style="white-space: pre-wrap; display: flex;">',
      '<span class="code-snippet_outer">fourth line</span>',
      '</code>',
      '</pre>',
      '</section>',
      '<p>after</p>',
    ].join('');

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'before' }]
      },
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [{ text: 'first second-third' }]
          },
          {
            type: 'code_line',
            children: [{ text: 'fourth line' }]
          }
        ]
      },
      {
        type: 'paragraph',
        children: [{ text: 'after' }]
      }
    ]);
  });
});
