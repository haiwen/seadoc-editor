import isUrl from 'is-url';

export const IMAGE_TYPES = [
  'png',
  'jpg',
  'gif',
];

export const isImage = (url) => {
  if (!url) return false;

  if (!isUrl(url)) return false;

  const suffix = url.split('.')[1]; // http://xx/mm/*.png
  if (!suffix) return false;

  return IMAGE_TYPES.includes(suffix.toLowerCase());
};

export const isSameDomain = (currentUrl, targetUrl) => {
  return String(currentUrl).split('/')[2] === String(targetUrl).split('/')[2];
};

export const isOverflowPortByDirection = (targetDom, direction) => {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const { top, right, bottom, left } = targetDom.getBoundingClientRect();

  if (direction === 'top') {
    return top <= 0;
  }

  if (direction === 'bottom') {
    return bottom + 370 >= viewHeight;
  }

  if (direction === 'left') {
    return left <= 0;
  }

  if (direction === 'right') {
    return right >= viewWidth;
  }
};

export const onHandleOverflowScroll = (currentSelectItem, downDownWrapperRef) => {
  const { bottom: curBottom, top: curTop } = currentSelectItem.getBoundingClientRect();
  const { bottom: containerBottom } = downDownWrapperRef.current.parentNode.getBoundingClientRect();
  const { top: containerTop } = downDownWrapperRef.current.getBoundingClientRect();

  if (curBottom > containerBottom) {
    const scrollTop = downDownWrapperRef.current.scrollTop + 100;
    downDownWrapperRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
  }

  if (curTop < containerTop) {
    const scrollTop = downDownWrapperRef.current.scrollTop - 100;
    downDownWrapperRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
  }
};

export const getMenuPosition = (element, editor) => {
  const { top, left } = element.getBoundingClientRect();
  const menuTop = top - 42; // top = top distance - menu height
  let menuPosition = {
    top: menuTop,
    left: left // left = callout left distance
  };
  // topOffset: the editor container left-top distance with browser top
  if (editor.topOffset && menuPosition.top < editor.topOffset) {
    menuPosition['display'] = 'none';
  }
  return menuPosition;
};

