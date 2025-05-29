import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('link test', () => {
  it('paragraph > link', () => {
    const nodes = [{
      type: 'paragraph',
      children: [
        {
          text: '',
        },
        {
          type: 'link',
          href: 'http://127.0.0.1/shuntian/learning/index.html',
          title: 'xiaoqiang',
          children: [
            { text: 'xiaoqiang' }
          ]
        },
        {
          text: ''
        }
      ]
    }];

    const expectResult = [{
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '',
        },
        {
          type: 'link',
          url: 'http://127.0.0.1/shuntian/learning/index.html',
          title: 'xiaoqiang',
          children: [
            {
              type: 'text',
              value: 'xiaoqiang',
            },
          ]
        },
        {
          type: 'text',
          value: '',
        },
      ]
    }];
    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
