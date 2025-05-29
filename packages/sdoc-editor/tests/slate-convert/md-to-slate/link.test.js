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
});
