import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useScrollContext } from '../hooks/use-scroll-context';
import OutlineItem from './outline-item';

import './style.css';

const getHeaderList = (children) => {
  const headerList = [];
  children.forEach((node) => {
    if (node.type === 'header2' || node.type === 'header3') {
      headerList.push(node);
    }
  });
  return headerList;
};

const Outline = ({ editor }) => {
  const { t } = useTranslation('sdoc-editor');
  const scrollRef = useScrollContext();
  const [headerList, setHeaderList] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const headerList = getHeaderList(editor.children);
    setHeaderList(headerList);
  }, [editor.children]);

  const handleScroll = useCallback((e) => {
    const scrollTop = scrollRef.current.scrollTop;
    const styles = getComputedStyle(scrollRef?.current);
    const paddingTop = parseInt(styles.paddingTop);
    for (let i = 0; i < headerList.length; i++) {
      const headerItem = headerList[i];
      const dom = document.getElementById(headerItem.id);
      const { offsetTop, offsetHeight } = dom;
      const styles = getComputedStyle(dom);
      const marginTop = parseInt(styles.marginTop);
      if (offsetTop + offsetHeight + marginTop > scrollTop - paddingTop) {
        setActiveId(headerItem.id);
        break;
      }
    }
  }, [headerList, scrollRef]);

  useEffect(() => {
    let observerRefValue = null;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
      observerRefValue = scrollRef.current;
    }

    return () => {
      observerRefValue.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, scrollRef]);

  return (
    <div className="sdoc-wiki-viewer-outline">
      {headerList.length === 0 && (
        <div className="empty-container">{t('No_out_line')}</div>
      )}
      {headerList.length > 0 && headerList.map((node, index) => {
        return <OutlineItem key={index} node={node} activeId={activeId} />;
      })}
    </div>
  );
};

Outline.propTypes = {
  editor: PropTypes.object,
};

export default Outline;
