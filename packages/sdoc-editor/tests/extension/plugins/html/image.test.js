import { deserializeHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';

describe('deserialize image', () => {
  it('degrades images without a source to unique empty text nodes', () => {
    const ret = deserializeHtml('<p>before<img /><img />after</p>');
    const children = ret[0].children;

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: '' },
          { text: '' },
          { text: 'after' }
        ]
      }
    ]);
    expect(children.map(child => child.text).join('')).toBe('beforeafter');
    expect(children[1].id).toEqual(expect.any(String));
    expect(children[1].id).not.toBe('');
    expect(children[2].id).toEqual(expect.any(String));
    expect(children[2].id).not.toBe('');
    expect(children[1].id).not.toBe(children[2].id);
  });
});
