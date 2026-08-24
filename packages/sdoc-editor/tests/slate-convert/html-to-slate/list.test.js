import { deserializeHtml } from '../../../src';
import { formatChildren } from '../../core/utils';


describe('deserialize list', () => {
  it('ul > li to slate node', () => {
    const html = [
      '<ul>',
      '<li>Nothing gold can stay</li>',
      '<li>Nature\'s first green is gold</li>',
      '<li>Her hardest hue to hold</li>',
      '</ul>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Nothing gold can stay',
                  }
                ]
              }
            ],
          },
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Nature\'s first green is gold',
                  }
                ]
              }
            ],
          },
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Her hardest hue to hold',
                  }
                ]
              }
            ],
          },
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('ol > li to slate node', () => {
    const html = [
      '<ol>',
      '<li>Nothing gold can stay</li>',
      '<li>Nature\'s first green is gold</li>',
      '<li>Her hardest hue to hold</li>',
      '</ol>'
    ].join('');

    const ret = deserializeHtml((html));
    const exp = [
      {
        type: 'ordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Nothing gold can stay',
                  }
                ]
              }
            ],
          },
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Nature\'s first green is gold',
                  }
                ]
              }
            ],
          },
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Her hardest hue to hold',
                  }
                ]
              }
            ],
          },
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('li to slate node', () => {
    const html = [
      '<li>Nothing gold can stay</li>',
      '<li>Nature\'s first green is gold</li>',
      '<li>Her hardest hue to hold</li>',
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Nothing gold can stay',
                  }
                ]
              }
            ],
          },
        ]
      },
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Nature\'s first green is gold',
                  }
                ]
              }
            ],
          },
        ]
      },
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Her hardest hue to hold',
                  }
                ]
              }
            ],
          },
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('li with nested list to slate node', () => {
    const html = [
      '<ul>',
      '<li>parent 1<ul><li>child 1</li><li>child 2</li></ul></li>',
      '</ul>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  { text: 'parent 1' }
                ]
              },
              {
                type: 'unordered_list',
                children: [
                  {
                    type: 'list_item',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          { text: 'child 1' }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'list_item',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          { text: 'child 2' }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('ignore non-li children in list container', () => {
    const html = [
      '<ul>',
      '<div>not a list item</div>',
      '<li>real item</li>',
      '</ul>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  { text: 'real item' }
                ]
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('keeps a paragraph in a list item valid when an image is downgraded', () => {
    const html = '<ul><li><p><img /></p></li></ul>';

    expect(formatChildren(deserializeHtml(html))).toEqual([
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ]
          }
        ]
      }
    ]);
  });

  it('discards a line-index list in a complete WeChat code snippet', () => {
    const html = [
      '<p>before</p>',
      '<section class="code-snippet__fix code-snippet__js">',
      '<ul class="code-snippet__line-index code-snippet__js"><li></li><li></li></ul>',
      '\n',
      '<pre class="code-snippet__js"><code>code</code></pre>',
      '</section>',
      '<p>after</p>'
    ].join('');

    expect(formatChildren(deserializeHtml(html))).toEqual([
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
            children: [{ text: 'code' }]
          }
        ]
      },
      {
        type: 'paragraph',
        children: [{ text: 'after' }]
      }
    ]);
  });

  it('discards an empty standalone WeChat code line-index list', () => {
    const html = [
      '<ul class="code-snippet__line-index code-snippet__js">',
      '<li></li>',
      '<li>\n  </li>',
      '</ul>',
      '<pre class="code-snippet__js" data-lang="js">',
      '<code><span class="code-snippet_outer">code</span></code>',
      '</pre>'
    ].join('');

    expect(formatChildren(deserializeHtml(html))).toEqual([
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [{ text: 'code' }]
          }
        ]
      }
    ]);
  });

  it('keeps a matching list followed by pre outside a complete WeChat code snippet', () => {
    const html = [
      '<ul class="code-snippet__line-index code-snippet__js">',
      '<li>user content</li>',
      '</ul>',
      '<pre class="code-snippet__js"><code>code</code></pre>'
    ].join('');

    expect(formatChildren(deserializeHtml(html))).toEqual([
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'user content' }]
              }
            ]
          }
        ]
      },
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [{ text: 'code' }]
          }
        ]
      }
    ]);
  });

  it.each([
    [
      'inside an ordinary div',
      [
        '<div>',
        '<ul class="code-snippet__line-index code-snippet__js"><li></li></ul>',
        '<pre class="code-snippet__js"><code>code</code></pre>',
        '</div>'
      ].join('')
    ],
    [
      'when pre lacks the WeChat class',
      [
        '<section class="code-snippet__fix code-snippet__js">',
        '<ul class="code-snippet__line-index code-snippet__js"><li></li></ul>',
        '<pre><code>code</code></pre>',
        '</section>'
      ].join('')
    ],
    [
      'when a standalone line item contains an element',
      [
        '<ul class="code-snippet__line-index code-snippet__js"><li><span></span></li></ul>',
        '<pre class="code-snippet__js"><code>code</code></pre>'
      ].join('')
    ]
  ])('keeps a matching line-index list %s', (name, html) => {
    const nodes = formatChildren(deserializeHtml(html));

    expect(nodes.map(node => node.type)).toEqual(['unordered_list', 'code_block']);
  });

  it('keeps a WeChat code line-index list without an adjacent pre', () => {
    const html = '<ul class="code-snippet__line-index code-snippet__js"><li></li></ul>';

    expect(formatChildren(deserializeHtml(html))).toEqual([
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ]
          }
        ]
      }
    ]);
  });
});
