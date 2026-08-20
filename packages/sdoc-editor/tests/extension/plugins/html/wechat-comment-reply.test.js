import { deserializeHtml, normalizePastedHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';

const createCommentHtml = (content) => (
  `<ul><li class="js_comment_item discuss_item" data-content-id="comment-1"><div>${content}</div></li></ul>`
);

const deserializePastedHtml = html => deserializeHtml(normalizePastedHtml(html));

describe('deserialize WeChat comment replies', () => {
  it('separates replies in the same paragraph with newlines', () => {
    const html = createCommentHtml([
      '<div class="discuss_media" data-content-id="comment-1"><span>Main comment</span></div>',
      '<div class="discuss_media js_reply_item" data-content-id="comment-1" data-reply-id="1"><span>First reply</span></div>',
      '<div class="discuss_media js_reply_item" data-content-id="comment-1" data-reply-id="2"><span>Second reply</span></div>',
    ].join(''));

    const normalizedHtml = normalizePastedHtml(html);
    const normalizedAgain = normalizePastedHtml(normalizedHtml);
    const normalizedDocument = new DOMParser().parseFromString(normalizedAgain, 'text/html');

    expect(normalizedDocument.querySelectorAll('[data-sdoc-wechat-reply-break="true"]')).toHaveLength(2);
    expect(formatChildren(deserializeHtml(normalizedAgain))).toEqual([
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  { text: 'Main comment' },
                  { text: '\n' },
                  { text: 'First reply' },
                  { text: '\n' },
                  { text: 'Second reply' },
                ]
              }
            ]
          }
        ]
      }
    ]);
  });

  it('does not add a leading newline when only one reply is copied', () => {
    const html = createCommentHtml(
      '<div class="discuss_media js_reply_item" data-content-id="comment-1" data-reply-id="1"><span>Only reply</span></div>'
    );

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Only reply' }]
              }
            ]
          }
        ]
      }
    ]);
  });

  it('does not change a normal list item', () => {
    const html = '<ul><li><div><span>Normal item</span></div></li></ul>';

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'unordered_list',
        children: [
          {
            type: 'list_item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Normal item' }]
              }
            ]
          }
        ]
      }
    ]);
  });
});
