import slugid from 'slugid';

const textRule = (element, parseChild) => {
  const { nodeName, nodeType, childNodes } = element;
  // If the child node is not a text node, it is processed by the child node
  if (childNodes.length && !(childNodes?.[0] instanceof Text)) return parseChild(childNodes);

  const style = {};
  let fontSizeResolved = false;
  let ancestor = nodeType === 3 ? element.parentElement : element;
  while (ancestor) {
    const { color, fontSize } = ancestor.style || {};
    if (!fontSize && /^H[1-6]$/.test(ancestor.nodeName)) fontSizeResolved = true;
    if (!style.color && color && !['inherit', 'unset', 'currentcolor'].includes(color.toLowerCase())) {
      style.color = color;
    }
    if (!fontSizeResolved && fontSize && !['inherit', 'unset'].includes(fontSize.toLowerCase())) {
      fontSizeResolved = true;
      const size = fontSize.match(/^(\d*\.?\d+)(px|pt)$/i);
      if (size && Number(size[1]) > 0) {
        // The editor renders font_size in points.
        style.font_size = Math.round(Number(size[1]) * (size[2].toLowerCase() === 'px' ? 0.75 : 1) * 1000) / 1000;
      }
    }
    ancestor = ancestor.parentElement;
  }

  if (nodeName === 'SPAN') {
    return {
      id: slugid.nice(),
      ...style,
      text: element.textContent,
    };
  }

  if (nodeName === 'STRONG' || nodeName === 'B') {
    return {
      id: slugid.nice(),
      ...style,
      bold: true,
      text: element.textContent,
    };
  }

  if (nodeName === 'CODE' && element.parentElement.nodeName !== 'PRE') {
    return {
      id: slugid.nice(),
      ...style,
      code: true,
      text: element.textContent
    };
  }

  if (nodeName === 'DEL') {
    return {
      id: slugid.nice(),
      ...style,
      delete: true,
      text: element.textContent
    };
  }

  if (nodeName === 'I') {
    return {
      id: slugid.nice(),
      ...style,
      italic: true,
      text: element.textContent
    };
  }

  if (nodeName === 'INS') {
    return {
      id: slugid.nice(),
      ...style,
      add: true,
      text: element.textContent
    };
  }

  if (nodeType === 3) {
    return {
      id: slugid.nice(),
      ...style,
      text: element.textContent,
    };
  }

  return;
};

export default textRule;
