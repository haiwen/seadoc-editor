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
});
