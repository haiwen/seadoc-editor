const WECHAT_REPLY_BREAK_ATTRIBUTE = 'data-sdoc-wechat-reply-break';
const WECHAT_REPLY_SELECTOR = 'div.discuss_media.js_reply_item[data-reply-id][data-content-id]';

const addWechatCommentReplyBreaks = (fragment) => {
  const replies = fragment.querySelectorAll(WECHAT_REPLY_SELECTOR);
  replies.forEach((reply) => {
    const replyId = reply.getAttribute('data-reply-id');
    const contentId = reply.getAttribute('data-content-id');
    const commentItem = reply.closest('li.js_comment_item.discuss_item');
    if (
      !replyId
      || !contentId
      || !commentItem
      || commentItem.getAttribute('data-content-id') !== contentId
    ) {
      return;
    }

    const commentParts = Array.from(commentItem.querySelectorAll('.discuss_media[data-content-id]'))
      .filter(item => item.getAttribute('data-content-id') === contentId);
    if (commentParts.indexOf(reply) <= 0) return;

    const previousElement = reply.previousElementSibling;
    if (previousElement?.getAttribute(WECHAT_REPLY_BREAK_ATTRIBUTE) === 'true') return;

    const breakElement = fragment.ownerDocument.createElement('span');
    breakElement.setAttribute(WECHAT_REPLY_BREAK_ATTRIBUTE, 'true');
    breakElement.textContent = '\n';
    reply.before(breakElement);
  });
};

export const normalizeWechatPastedFragment = (fragment) => {
  addWechatCommentReplyBreaks(fragment);
};
