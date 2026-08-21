import { deserializeHtml } from '../../../src';
import { formatChildren } from '../../core/utils';

describe('deserialize table', () => {
  it('keeps a table cell valid when an image is downgraded', () => {
    const html = '<table><tbody><tr><td><img /></td></tr></tbody></table>';

    expect(formatChildren(deserializeHtml(html))).toEqual([
      {
        type: 'table',
        children: [
          {
            type: 'table_row',
            children: [
              {
                type: 'table_cell',
                children: [{ text: '' }]
              }
            ]
          }
        ]
      }
    ]);
  });
});
