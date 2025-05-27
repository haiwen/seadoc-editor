export const eventStopPropagation = (event) => {
  if (!event) return;
  event.stopPropagation();
  event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();
};

export const registerResizeEvents = (eventsMap = {}) => {
  for (let key in eventsMap) {
    document.addEventListener(key, eventsMap[key]);
  }
};

export const unregisterResizeEvents = (eventsMap = {}) => {
  for (let key in eventsMap) {
    document.removeEventListener(key, eventsMap[key]);
  }
};

export const getMouseDownInfo = (event, scrollContainer) => {
  let positionX = 0;
  let positionY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;
  if (event) {
    positionX = event.clientX;
    positionY = event.clientY;
  }
  if (scrollContainer) {
    scrollLeft = scrollContainer.scrollLeft;
    scrollTop = scrollContainer.scrollTop;
  }
  return { positionX, positionY, scrollLeft, scrollTop };
};

export const getMouseMoveInfo = (event, mouseDownInfo, scrollContainer) => {
  let displacementX = 0;
  let displacementY = 0;
  if (!event) return { displacementX, displacementY };
  const { clientX: currPositionX, clientY: currPositionY } = event;
  let scrollLeft = 0;
  let scrollTop = 0;
  if (scrollContainer) {
    scrollLeft = scrollContainer.scrollLeft || 0;
    scrollTop = scrollContainer.scrollTop || 0;
  }
  displacementX = currPositionX - mouseDownInfo.positionX + scrollLeft - (mouseDownInfo.scrollLeft || 0);
  displacementY = currPositionY - mouseDownInfo.positionY + scrollTop - (mouseDownInfo.scrollTop || 0);
  return { displacementX, displacementY };
};

export const createObjectWithProperties = (originalObj, properties) => {
  return properties.reduce((result, property) => {
    if (property in originalObj) {
      result[property] = originalObj[property];
    }
    return result;
  }, {});
};
