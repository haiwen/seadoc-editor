import React, { useRef, useState, useCallback, Fragment, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import CommentProvider from '../comment/provider';
import { FULL_WIDTH_MODE } from '../constants';
import { ScrollContext } from '../hooks/use-scroll-context';
import SDocOutline from '../outline';
import RightPanel from '../right-panel';
import { getContentStyleByFullModeStyle } from '../utils/full-width-mode';
import LocalStorage from '../utils/local-storage-utils';

const EditorContent = ({
  readonly = false,
  children,
  docValue,
  editor,
  showOutline = true,
  showComment = false,
}) => {
  const scrollRef = useRef(null);

  const [scrollLeft, setScrollLeft] = useState(0);
  const onWrapperScroll = useCallback((event) => {
    const { scrollLeft } = event.target;
    setScrollLeft(scrollLeft);
  }, []);

  const onBodyScroll = useCallback(() => {
    const scrollLeft = window.scrollX;
    setScrollLeft(scrollLeft);
  }, []);

  useEffect(() => {
    // Modify the outline position even when scrolling the window
    if (LocalStorage.getItem(FULL_WIDTH_MODE)) {
      document.addEventListener('scroll', onBodyScroll);
    }
    return () => {
      document.removeEventListener('scroll', onBodyScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const className = classNames('sdoc-editor-content', {
    'readonly': readonly,
    'no-outline': !showOutline,
  });

  // If you don't display comment, use Fragment to replace CommentProvider
  const WithCommentProvider = showComment ? CommentProvider : Fragment;

  return (
    <WithCommentProvider {...(showComment && { editor })}>
      <div className='sdoc-content-wrapper'>
        <div ref={scrollRef} className="sdoc-scroll-container" onScroll={onWrapperScroll} id="sdoc-scroll-container">
          <ScrollContext.Provider value={{ scrollRef }}>
            <div className={className} style={getContentStyleByFullModeStyle()}>
              {showOutline && <SDocOutline scrollLeft={scrollLeft} doc={docValue} />}
              {children}
            </div>
          </ScrollContext.Provider>
        </div>
        <RightPanel editor={editor} />
      </div>
    </WithCommentProvider>
  );
};

EditorContent.propTypes = {
  readonly: PropTypes.bool,
  docValue: PropTypes.array,
  showOutline: PropTypes.bool,
  showComment: PropTypes.bool,
};

export default EditorContent;
