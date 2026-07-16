import context from '../../../src/context';
import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('image test', () => {
  it('image', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'image',
            data: {
              src: 'image.jpg',
              alt: 'alt text',
              title: 'nihadoe',
            },
            children: [
              { text: '' }
            ]
          },
          { text: '' },
        ]
      },
    ];

    const expectResult = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: '',
          },
          {
            type: 'image',
            url: 'image.jpg',
            alt: 'alt text',
            title: 'nihadoe',
          },
          {
            type: 'text',
            value: '',
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});

describe('linked image test', () => {
  it('image link', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: {
              src: 'image.jpg',
              href: 'https://dev.seafile.com',
            },
            children: [{ text: '' }]
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://dev.seafile.com',
            title: null,
            children: [{ type: 'image', url: 'image.jpg', alt: null, title: null }]
          }
        ]
      }
    ]);
  });

  it('exports a wiki-linked image with the target wiki URL', () => {
    context.initSSRSettings({
      serviceUrl: 'https://cloud.example.com',
      siteRoot: '/seafile/',
    });
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: {
              src: 'image.jpg',
              href: 'https://cloud.example.com/seafile/wikis/target-wiki/target-page/',
              linked_wiki_id: 'target-wiki',
              linked_wiki_page_id: 'target-page',
            },
            children: [{ text: '' }]
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://cloud.example.com/seafile/wikis/target-wiki/target-page/',
            title: null,
            children: [{ type: 'image', url: 'image.jpg', alt: null, title: null }]
          }
        ]
      }
    ]);
  });

  it('exports an internal library image link', () => {
    const nodes = [{
      type: 'paragraph',
      children: [{
        type: 'image',
        data: {
          src: 'image.jpg',
          href: 'https://cloud.example.com/lib/repo-id/file/image.sdoc',
        },
        children: [{ text: '' }]
      }]
    }];

    expect(formatSlateToMd(nodes)[0].children[0]).toEqual({
      type: 'link',
      url: 'https://cloud.example.com/lib/repo-id/file/image.sdoc',
      title: null,
      children: [{ type: 'image', url: 'image.jpg', alt: null, title: null }]
    });
  });

  it('does not export an unsafe image link', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src: 'image.jpg', href: ['java', 'script:alert(1)'].join('') },
            children: [{ text: '' }]
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)[0].children[0]).toEqual({
      type: 'image',
      url: 'image.jpg',
      alt: null,
      title: null,
    });
  });

  it('escapes linked raw-image HTML attributes', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: {
              src: 'image.jpg',
              alt: 'A & B',
              title: 'A "title"',
              width: 100,
              href: 'https://example.com/?a=1&b=2',
            },
            children: [{ text: '' }]
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)[0].children[0]).toEqual({
      type: 'html',
      value: '<a href="https://example.com/?a=1&amp;b=2"><img src="image.jpg" alt="A &amp; B" title="A &quot;title&quot;" width="100" height="undefined" /></a>',
    });
  });
});

describe('image test', () => {
  it('image', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'image',
            data: {
              src: 'image.jpg',
              alt: 'alt text',
              title: 'nihadoe',
              width: 100
            },
            children: [
              { text: '' }
            ]
          },
          { text: '' },
        ]
      },
    ];

    const expectResult = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: '',
          },
          {
            type: 'html',
            value: '<img src="image.jpg" alt="alt text" title="nihadoe" width="100" height="undefined" />'
          },
          {
            type: 'text',
            value: '',
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
