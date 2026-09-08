import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('link test', () => {
  it('paragraph > link', () => {
    const mdString = '[xiaoqiang](http://127.0.0.1/shuntian/learning/index.html)';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'paragraph',
      children: [
        {
          text: '',
        },
        {
          type: 'link',
          url: 'http://127.0.0.1/shuntian/learning/index.html',
          title: null,
          children: [
            { text: 'xiaoqiang' }
          ]
        },
        {
          text: ''
        }
      ]
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });

  it('paragraph > bold link', () => {
    const mdString = '[**xiaoqiang**](http://127.0.0.1/shuntian/learning/index.html)';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'paragraph',
      children: [
        {
          text: '',
        },
        {
          type: 'link',
          url: 'http://127.0.0.1/shuntian/learning/index.html',
          title: null,
          children: [
            { text: 'xiaoqiang', bold: true }
          ]
        },
        {
          text: ''
        }
      ]
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });

  it('paragraph > italic link', () => {
    const mdString = '[*xiaoqiang*](http://127.0.0.1/shuntian/learning/index.html)';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'paragraph',
      children: [
        {
          text: '',
        },
        {
          type: 'link',
          url: 'http://127.0.0.1/shuntian/learning/index.html',
          title: null,
          children: [
            { text: 'xiaoqiang', italic: true }
          ]
        },
        {
          text: ''
        }
      ]
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });

  it('paragraph > bold italic link', () => {
    const mdString = '[***example***](https://example.com)';
    const nodes = mdStringToSlate(mdString);
    const link = formatChildren(nodes)[0].children[1];

    expect(link.children).toEqual([
      { text: 'example', italic: true, bold: true },
    ]);
  });

  it('paragraph > link with nested styles', () => {
    const mdString = '[**bold and *italic***](https://example.com)';
    const nodes = mdStringToSlate(mdString);
    const link = formatChildren(nodes)[0].children[1];

    expect(link.children).toEqual([
      { text: 'bold and ', bold: true },
      { text: 'italic', bold: true, italic: true },
    ]);
  });

  it('paragraph > link with plain and bold text', () => {
    const mdString = '[a **bold** b](https://example.com)';
    const nodes = mdStringToSlate(mdString);
    const link = formatChildren(nodes)[0].children[1];

    expect(link.children).toEqual([
      { text: 'a ' },
      { text: 'bold', bold: true },
      { text: ' b' },
    ]);
  });

  it('paragraph > link with multiple bold texts', () => {
    const mdString = '[**a** **b**](https://example.com)';
    const nodes = mdStringToSlate(mdString);
    const link = formatChildren(nodes)[0].children[1];

    expect(link.children).toEqual([
      { text: 'a', bold: true },
      { text: ' ' },
      { text: 'b', bold: true },
    ]);
  });
});
