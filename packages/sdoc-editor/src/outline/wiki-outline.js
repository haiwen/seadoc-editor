import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import throttle from 'lodash.throttle';
import PropTypes from 'prop-types';
import { useScrollContext } from '../hooks/use-scroll-context';
import OutlineItem from './outline-item';

import './style.css';

const propTypes = {
  doc: PropTypes.array.isRequired,
};

const WikiOutline = ({ doc = [] }) => {
  const scrollRef = useScrollContext();
  const wikiOutlineRef = useRef(null);
  const [wikiOutlineList, setWikiOutlineList] = useState([]);
  const [isShowOutlinePopover, setIsShowOutlinePopover] = useState(false);

  const onMouseOver = useCallback(() => {
    if (!isShowOutlinePopover) {
      setIsShowOutlinePopover(true);
    }
  }, [isShowOutlinePopover]);

  const updateWikiOutlineList = useCallback(() => {
    const list = doc.filter(item => ['header1', 'header2', 'header3'].includes(item.type));

    if (list.length === 0) {
      setWikiOutlineList([]);
      return;
    }

    // The slateValue value in the document cannot be operated, so copy it for operation
    const newList = JSON.parse(JSON.stringify(list));

    const index = list.findIndex((item) => {
      const { id } = item;
      const el = document.getElementById(id);
      if (el) {
        const { bottom } = el.getBoundingClientRect();
        if (bottom >= 43) { // 43 is Top toolbar height
          return true;
        }
      }
      return false;
    });

    // There is a title in the visible area
    if (index !== -1) {
      newList[index]['isActive'] = true;
    }
    // There is no title in the visible area
    if (index === -1) {
      const lastItemId = list[list.length - 1].id;
      const lastItemEl = document.getElementById(lastItemId);
      if (lastItemEl) {
        const { top } = lastItemEl.getBoundingClientRect();
        if (top < 0) {
          newList[newList.length - 1]['isActive'] = true;
        }
      }
    }

    setWikiOutlineList([...newList]);
  }, [doc]);

  const onScroll = throttle(() => {
    updateWikiOutlineList();
  }, 200);

  useEffect(() => {
    updateWikiOutlineList();
    let curRef = null;
    curRef = scrollRef.current;
    scrollRef.current.addEventListener('scroll', onScroll);
    return () => {
      curRef && curRef.removeEventListener('scroll', onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  return (
    <div
      className='sdoc-outline-wrapper wiki-outline-wrapper'
      onMouseLeave={() => {
        setIsShowOutlinePopover(false);
      }}
    >
      <div className='sdoc-outline-container'>
        {wikiOutlineList.length > 0 && (
          <div className="sdoc-outline-list-container" onMouseOver={onMouseOver}>
            {wikiOutlineList.map((item, index) => <OutlineItem key={index} item={item} isDisplayHorizontalBar={true} />)}
          </div>
        )}
      </div>
      {isShowOutlinePopover && (
        <div className='wiki-outline-popover' ref={wikiOutlineRef}>
          <div className="sdoc-outline-list-container">
            {wikiOutlineList.map((item, index) => <OutlineItem key={index} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
};

WikiOutline.propTypes = propTypes;

export default withTranslation('sdoc-editor')(WikiOutline);
