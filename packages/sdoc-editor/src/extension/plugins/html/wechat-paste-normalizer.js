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

const normalizeWechatImageBlocks = (fragment) => {
  const images = new Set(Array.from(fragment.querySelectorAll('#js_content.rich_media_content > section > img.rich_pages.wxw-img'))
    .filter(image => image.style.display === 'block' || image.getAttribute('type') === 'block'));
  const sections = new Set(Array.from(images, image => image.parentElement));
  sections.forEach(section => {
    if (Array.from(section.querySelectorAll('*')).some(node =>
      !node.matches('p, span, b, strong, i, code, del, ins, a, br, img')
      || (node.nodeName === 'P' && node.parentElement !== section))) return;

    let paragraph;
    const paragraphs = [];
    Array.from(section.childNodes).forEach(node => {
      if (node.nodeName === 'P') {
        paragraph = null;
        return;
      }
      const isBlockImage = images.has(node);
      if (isBlockImage) paragraph = null;
      if (!paragraph) {
        paragraph = fragment.ownerDocument.createElement('p');
        paragraph.style.cssText = section.style.cssText;
        if (section.hasAttribute('align')) paragraph.setAttribute('align', section.getAttribute('align'));
        section.insertBefore(paragraph, node);
        paragraphs.push(paragraph);
      }
      paragraph.append(node);
      if (isBlockImage) paragraph = null;
    });
    paragraphs.forEach(node => {
      [node.firstChild, node.lastChild].forEach(child => {
        if (child?.nodeType === 3 && /^[\t\r\n ]*$/.test(child.textContent)) child.remove();
      });
      if (/^[\t\r\n ]*$/.test(node.textContent) && !node.querySelector('img, br')) node.remove();
    });
  });
};

export const normalizeWechatPastedFragment = (fragment) => {
  addWechatCommentReplyBreaks(fragment);
  normalizeWechatImageBlocks(fragment);
};
