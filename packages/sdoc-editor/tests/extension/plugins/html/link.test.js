import { deserializeHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';


describe('deserialize link', () => {
  it('a to slate node', () => {
    const html = '<a href="https://dev.seafile.com/seahub" title="seafile">Seafile</a>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: 'https://dev.seafile.com/seahub',
            title: 'seafile',
            children: [
              {
                text: 'Seafile'
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('a to slate node', () => {
    const html = '<a href="https://dev.seafile.com/seahub" title="seafile"></a>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: 'https://dev.seafile.com/seahub',
            title: 'seafile',
            children: [
              {
                text: 'seafile'
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('a to slate node', () => {
    const html = '<a href="https://dev.seafile.com/seahub" title=""></a>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: 'https://dev.seafile.com/seahub',
            title: '',
            children: [
              {
                text: 'https://dev.seafile.com/seahub'
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('linked image to slate node', () => {
    const html = '<a href="https://dev.seafile.com"><img src="image.jpg" /></a>';

    const ret = deserializeHtml(html);
    const exp = [
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
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('drops an unsafe linked image URL', () => {
    const ret = deserializeHtml('<a href="javascript:alert(1)"><img src="image.jpg" /></a>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src: 'image.jpg' },
            children: [{ text: '' }]
          }
        ]
      }
    ]);
  });

  it('preserves both image and text in a mixed image link', () => {
    const ret = deserializeHtml('<a href="https://dev.seafile.com"><img src="image.jpg" />Caption</a>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src: 'image.jpg', href: 'https://dev.seafile.com' },
            children: [{ text: '' }]
          },
          {
            type: 'link',
            href: 'https://dev.seafile.com',
            title: null,
            children: [{ text: 'Caption' }]
          }
        ]
      }
    ]);
  });

  it('keeps a downgraded image as empty text in a mixed link', () => {
    const ret = deserializeHtml('<a href="https://dev.seafile.com"><img />Caption</a>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            href: 'https://dev.seafile.com',
            title: null,
            children: [{ text: 'Caption' }]
          }
        ]
      }
    ]);
    expect(ret[0].children[0].id).toEqual(expect.any(String));
    expect(ret[0].children[0].id).not.toBe('');
  });

  it('degrades an empty link control to empty text', () => {
    const ret = deserializeHtml('<div>before<a role="button"><svg></svg></a>after</div>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: '' },
          { text: 'after' }
        ]
      }
    ]);
    expect(ret[0].children[1].id).toEqual(expect.any(String));
    expect(ret[0].children[1].id).not.toBe('');
  });

  it('degrades a link control containing only formatting whitespace', () => {
    const ret = deserializeHtml('<div>before<a role="button">\n  <svg></svg>\n</a>after</div>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: '' },
          { text: 'after' }
        ]
      }
    ]);
    expect(ret[0].children[1].id).toEqual(expect.any(String));
    expect(ret[0].children[1].id).not.toBe('');
  });

  it('uses the href when link text contains only formatting whitespace', () => {
    const ret = deserializeHtml('<a href="https://dev.seafile.com">\n  <svg></svg>\n</a>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: 'https://dev.seafile.com',
            title: null,
            children: [{ text: 'https://dev.seafile.com' }]
          }
        ]
      }
    ]);
  });

  it('degrades an empty linked image without a source', () => {
    const ret = deserializeHtml('<div>before<a role="button"><img /></a>after</div>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: '' },
          { text: 'after' }
        ]
      }
    ]);
    expect(ret[0].children[1].id).toEqual(expect.any(String));
    expect(ret[0].children[1].id).not.toBe('');
  });
});
