export const getDomHeight = (dom) => {
  const styles = window.getComputedStyle(dom);
  const rect = dom.getBoundingClientRect();
  const marginTop = styles['marginTop'];
  // margin-bottom overlaps margin-top
  // const marginBottom = styles['marginBottom'];
  const { height } = rect;

  return height + parseInt(marginTop);
};

export const getDomMarginTop = (dom) => {
  const styles = window.getComputedStyle(dom);
  const marginTop = styles['marginTop'];
  return parseInt(marginTop);
};

export const getSelectionRange = () => {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange();
  }

  return null;
};

export const getCursorPosition = (isScrollUp = true) => {
  let x = 0;
  let y = 0;
  let range = getSelectionRange();
  if (range) {
    const rect = range.getBoundingClientRect();
    const headerHeight = 100;
    x = rect.x || 0;
    if (isScrollUp) {
      y = rect.y - headerHeight;
    } else {
      y = rect.y - headerHeight + rect.height;
    }
  }
  return { x: x, y: y };
};
