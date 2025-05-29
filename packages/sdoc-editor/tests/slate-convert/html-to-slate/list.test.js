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
});
