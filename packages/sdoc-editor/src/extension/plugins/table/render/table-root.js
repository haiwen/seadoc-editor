import React, { useState, useRef, useCallback } from 'react';
import { useReadOnly, useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { TableContextMenu } from '../menu';
import { TableRootContext, TableRootScrollLeftContext, useContextMenu } from './hooks';


const TableRoot = ({ attributes, columns = [], children }) => {
  const editor = useSlateStatic();
  const readonly = useReadOnly();
  const tableScrollWrapper = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const allWidth = columns.reduce((pre, cur) => pre + cur.width, 0);
  const onScroll = useCallback((event) => {
    setScrollLeft(event.target.scrollLeft);
  }, []);

  const { isShowContextMenu, menuPosition, onContextMenu } = useContextMenu(tableScrollWrapper);

  return (
    <TableRootContext.Provider value={tableScrollWrapper.current}>
      <TableRootScrollLeftContext.Provider value={scrollLeft}>
        <div
          {...attributes}
          className={classnames('sdoc-table-wrapper position-relative', attributes.className, {
            'scroll': allWidth > editor.width,
          })}
          style={{ ...attributes.style, maxWidth: editor.width ? editor.width : '100%' }}
        >
          <div
            className={classnames('sdoc-table-scroll-wrapper', {
              'scroll-at-center': scrollLeft + editor.width !== allWidth && scrollLeft > 0,
              'scroll-at-right': scrollLeft + editor.width === allWidth,
              'scroll-at-left': scrollLeft === 0,
            })}
            ref={tableScrollWrapper}
            onScroll={onScroll}
            onContextMenu={onContextMenu}
          >
            {children}
          </div>
        </div>
        {!readonly && isShowContextMenu && (
          <TableContextMenu
            editor={editor}
            contextMenuPosition={menuPosition}
            readonly={readonly}
          />
        )}
      </TableRootScrollLeftContext.Provider>
    </TableRootContext.Provider>
  );
};

TableRoot.propTypes = {
  attributes: PropTypes.object,
  columns: PropTypes.array,
  children: PropTypes.node
};

export default TableRoot;
