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
});
