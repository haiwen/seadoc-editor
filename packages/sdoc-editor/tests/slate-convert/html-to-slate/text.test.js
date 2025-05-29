import { deserializeHtml } from '../../../src';
import { formatChildren } from '../../core/utils';


describe('deserialize text', () => {
  it('span to slate node', () => {
    const html = '<span>Hello, seafile sdoc editor</span>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('i to slate node', () => {
    const html = '<i>Hello, seafile sdoc editor</i>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            italic: true,
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('b to slate node', () => {
    const html = '<b>Hello, seafile sdoc editor</b>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            bold: true,
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('strong to slate node', () => {
    const html = '<strong>Hello, seafile sdoc editor</strong>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            bold: true,
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('del to slate node', () => {
    const html = '<del>Hello, seafile sdoc editor</del>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            delete: true,
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('ins to slate node', () => {
    const html = '<ins>Hello, seafile sdoc editor</ins>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            add: true,
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('code to slate node', () => {
    const html = '<code>Hello, seafile sdoc editor</code>';

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'paragraph',
        children: [
          {
            code: true,
            text: 'Hello, seafile sdoc editor'
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

});
