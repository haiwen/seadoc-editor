import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Z_INDEX } from '../../../constants';
import { getNodeById } from '../../../extension/core';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { getElementCommentCountTop } from '../../helper';

const ElementCommentCount = ({ elementId, isElementSelected, commentsCount, editor, onSelectElement }) => {
  const element = getNodeById(editor.children, elementId);
  const [top, setTop] = useState(-9999);
  const scrollRef = useScrollContext();

  const onClick = useCallback(
    (event) => {
      eventStopPropagation(event);
      onSelectElement(elementId);
    },
    [elementId, onSelectElement]
  );

  const updatePosition = useCallback(() => {
    if (!element) return;

    const scrollTop = scrollRef.current.scrollTop || 0;
    const newTop = getElementCommentCountTop(editor, element, scrollTop);
    setTop(newTop);
  }, [editor, element, scrollRef]);

  useEffect(() => {
    updatePosition();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scrollDom = scrollRef.current;
    scrollDom.addEventListener('scroll', updatePosition);
    return () => {
      scrollDom.removeEventListener('scroll', updatePosition);
    };
  }, [editor, elementId, element, scrollRef, isElementSelected, updatePosition]);

  if (!element) return null;
  let style = { top };
  if (isElementSelected) {
    style['zIndex'] = Z_INDEX.ACTIVE_COMMENT_COUNT;
  }

  return (
    <div className="element-comments-count" style={style} onClick={onClick}>
      <i className="sdocfont sdoc-comment-count"></i>
      <div className="element-comments-count-value">{commentsCount}</div>
    </div>
  );
};

ElementCommentCount.propTypes = {
  isElementSelected: PropTypes.bool,
  elementId: PropTypes.string,
  commentsCount: PropTypes.number,
};

export default ElementCommentCount;
