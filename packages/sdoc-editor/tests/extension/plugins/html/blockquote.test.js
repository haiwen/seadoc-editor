import { deserializeHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';

describe('deserialize blockquote', () => {
  it('blockquote to slate node', () => {
    const html = '<blockquote>I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;</blockquote>';
    const ret = deserializeHtml(html);
    const exp = [{
      type: 'blockquote',
      children: [
        {
          text: 'I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;',
        }
      ]
    }];

    expect(formatChildren(ret)).toEqual(exp);
  });

  it('blockquote>p to slate node', () => {
    const html = [
      '<blockquote>',
      '<p>I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;</p>',
      '</blockquote>'
    ].join('');
    const ret = deserializeHtml(html);
    const exp = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;',
            },
          ]
        }
      ]
    }];

    expect(formatChildren(ret)).toEqual(exp);
  });

  it('blockquote>ul>li to slate node', () => {
    const html = [
      '<blockquote>',
      '<ul>',
      '<li>I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;</li>',
      '<li>I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;</li>',
      '<li>I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;</li>',
      '</ul>',
      '</blockquote>'
    ].join('');
    const ret = deserializeHtml(html);
    const exp = [{
      type: 'blockquote',
      children: [
        {
          type: 'unordered_list',
          children: [
            {
              type: 'list_item',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;',
                    }
                  ]
                }
              ],
            },
            {
              type: 'list_item',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;',
                    }
                  ]
                }
              ],
            },
            {
              type: 'list_item',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'I offer you my ancestors, my dead men, the ghosts that living men have honoured in marble: my father\'s father killed in the frontier of Buenos Aires, two bullets through his lungs, bearded and dead, wrapped by his soldiers in the hide of a cow;',
                    }
                  ]
                }
              ],
            },
          ]
        }
      ]
    }];

    expect(formatChildren(ret)).toEqual(exp);
  });
});
