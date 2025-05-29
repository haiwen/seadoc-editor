import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('check list test', () => {
  it('check_list', () => {
    const nodes = [
      {
        type: 'check_list_item',
        checked: true,
        children: [
          { text: 'Write the press release' },
        ]
      },
      {
        type: 'check_list_item',
        checked: false,
        children: [
          { text: 'Update the website' },
        ]
      },
      {
        type: 'check_list_item',
        checked: false,
        children: [
          { text: 'Contact the media' },
        ]
      }
    ];
    const expectResult = [
      {
        type: 'list',
        'ordered': false,
        'spread': false,
        'start': null,
        children: [
          {
            type: 'listItem',
            checked: true,
            'spread': false,
            children: [
              {
                type: 'paragraph',
                children: [
                  { type: 'text', value: 'Write the press release' },
                ]
              }
            ]
          },
        ]
      },
      {
        type: 'list',
        'ordered': false,
        'spread': false,
        'start': null,
        children: [
          {
            type: 'listItem',
            checked: false,
            'spread': false,
            children: [
              {
                type: 'paragraph',
                children: [
                  { type: 'text', value: 'Update the website' },
                ]
              }
            ]
          },
        ]
      },
      {
        type: 'list',
        'ordered': false,
        'spread': false,
        'start': null,
        children: [
          {
            type: 'listItem',
            checked: false,
            'spread': false,
            children: [
              {
                type: 'paragraph',
                children: [
                  { type: 'text', value: 'Contact the media' },
                ]
              }
            ]
          },
        ]
      }
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
