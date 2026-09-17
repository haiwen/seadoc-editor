import { IMAGE } from '../../constants';
import base64ToUnit8Array from '../image/base64-to-unit8array';
import { generateImageInfos, isWechatImageUrl, normalizeRemoteImageUrl } from '../image/helpers';

const WECHAT_REPLY_BREAK_ATTRIBUTE = 'data-sdoc-wechat-reply-break';
const WECHAT_EMOJI_HOST = 'res.wx.qq.com';
const WECHAT_EMOJI_PATH_PREFIX = '/t/wx_fed/we-emoji/res/assets/';
const WECHAT_EMOTICON_SELECTOR = 'img.js_module_emoticon_img.liteapp-emoticon__img';
const WECHAT_EMOJI_SELECTOR = 'img.we-emoji[alt]';
const WECHAT_REPLY_SELECTOR = 'div.discuss_media.js_reply_item[data-reply-id][data-content-id]';
const DATA_IMAGE_EXTENSION = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const isDataImage = (value) => typeof value === 'string' && /^data:image\//i.test(value.trim());

// Convert WeChat Base64 animated emoticons into uploadable local images without retaining their data URLs in the clipboard cache.
const cacheWechatInlineDataImage = (dataUrl) => {
  const { u8arr, mime } = base64ToUnit8Array(dataUrl);
  const normalizedMime = mime.toLowerCase();
  const extension = DATA_IMAGE_EXTENSION[normalizedMime];
  if (!extension) throw new Error(`Unsupported WeChat inline image type: ${mime}`);

  const file = new File([u8arr], `wechat-emoticon.${extension}`, { type: normalizedMime });
  const [imageInfo] = generateImageInfos([file]);
  if (!imageInfo) throw new Error(`Unsupported WeChat inline image type: ${mime}`);
  return { blobUrl: imageInfo.src, fileUuid: imageInfo.file_uuid };
};

const prepareWechatInlineDataImages = (fragment) => {
  const fileUuids = new Map();
  const emoticons = fragment.querySelectorAll(WECHAT_EMOTICON_SELECTOR);
  emoticons.forEach((image) => {
    const src = image.getAttribute('src');
    const dataSrc = image.getAttribute('data-src');
    const normalizedDataSrc = normalizeRemoteImageUrl(dataSrc);
    if (isWechatImageUrl(normalizedDataSrc)) return;

    const dataUrl = isDataImage(dataSrc) ? dataSrc : (isDataImage(src) ? src : '');
    if (!dataUrl) return;

    try {
      const { blobUrl, fileUuid } = cacheWechatInlineDataImage(dataUrl);
      image.setAttribute('src', blobUrl);
      image.removeAttribute('data-src');
      fileUuids.set(blobUrl, fileUuid);
    } catch {
      image.remove();
    }
  });
  return fileUuids;
};

export const removeWechatInlineDataImages = (fragment) => {
  const emoticons = fragment.querySelectorAll(WECHAT_EMOTICON_SELECTOR);
  emoticons.forEach((image) => {
    const src = image.getAttribute('src');
    const dataSrc = image.getAttribute('data-src');
    if (isDataImage(src) || isDataImage(dataSrc)) image.remove();
  });
};

// Attach cached file UUIDs to the converted Slate image nodes.
export const addWechatInlineImageFileUuids = (nodes, fileUuids) => {
  if (!Array.isArray(nodes) || fileUuids.size === 0) return;

  nodes.forEach((node) => {
    if (!node || typeof node !== 'object') return;

    const fileUuid = node.type === IMAGE ? fileUuids.get(node.data?.src) : null;
    if (fileUuid) node.data = { ...node.data, file_uuid: fileUuid };
    addWechatInlineImageFileUuids(node.children, fileUuids);
  });
};

// Replace WeChat emoji images with their visible alt text.
const isWechatEmojiImage = (image) => {
  const alt = image.getAttribute('alt') || '';
  if (!alt.trim() || alt.length > 32 || /[\r\n]/.test(alt)) return false;

  const src = image.getAttribute('data-src') || image.getAttribute('src');
  if (!src) return false;

  try {
    const url = new URL(src, 'https://mp.weixin.qq.com');
    return url.protocol === 'https:'
      && url.hostname === WECHAT_EMOJI_HOST
      && url.pathname.startsWith(WECHAT_EMOJI_PATH_PREFIX);
  } catch (error) {
    return false;
  }
};

const replaceWechatEmojiImages = (fragment) => {
  const emojis = fragment.querySelectorAll(WECHAT_EMOJI_SELECTOR);
  emojis.forEach((image) => {
    if (!isWechatEmojiImage(image)) return;
    const text = fragment.ownerDocument.createTextNode(image.getAttribute('alt'));
    image.replaceWith(text);
  });
};

// Prefer validated WeChat data-src URLs before HTML deserialization.
const promoteWechatImageDataSrc = (fragment) => {
  const images = fragment.querySelectorAll('img');
  images.forEach((image) => {
    const dataSrc = image.getAttribute('data-src');
    const normalizedSrc = normalizeRemoteImageUrl(dataSrc);
    if (isWechatImageUrl(normalizedSrc)) {
      image.setAttribute('src', normalizedSrc);
      return;
    }

    const src = normalizeRemoteImageUrl(image.getAttribute('src'));
    if (isWechatImageUrl(src)) image.setAttribute('src', src);
  });
};

// Preserve line breaks between WeChat comment replies.
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

// Apply WeChat-specific image and comment normalization before generic HTML deserialization.
export const normalizeWechatPastedFragment = (fragment) => {
  const fileUuids = prepareWechatInlineDataImages(fragment);
  replaceWechatEmojiImages(fragment);
  promoteWechatImageDataSrc(fragment);
  addWechatCommentReplyBreaks(fragment);
  return fileUuids;
};
