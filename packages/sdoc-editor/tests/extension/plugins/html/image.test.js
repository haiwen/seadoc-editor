import { deserializeHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';

describe('deserialize image', () => {
  it('discards an image without a source', () => {
    const ret = deserializeHtml('<p>before<img />after</p>');

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: 'after' }
        ]
      }
    ]);
  });
});
