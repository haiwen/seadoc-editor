import React, { useRef, useState, useEffect } from 'react';
import { useReadOnly, useSlateStatic } from '@seafile/slate-react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { LAST_COLUMN_MARGIN_RIGHT_WIDTH } from '../constants';
import { getCurrentPageWidth, updateColumnWidth } from '../helper';
import ResizeHandlers from '../resize-handlers';
import MultiColumnRoot from './multi-column-root';

import './index.css';

const MultiColumn = ({ className, attributes, children, element }) => {
  const editor = useSlateStatic();
  const multiColumn = useRef(null);
  const [style, setStyle] = useState(element.style ? { ...element.style } : {});
  const multiColumnContainerClassName = classNames('sdoc-multicolumn-container', className);
  const [pageWidth, setPageWidth] = useState(getCurrentPageWidth(editor));
  const readOnly = useReadOnly();

  const handleResizeColumn = (newColumn) => {
    updateColumnWidth(editor, element, newColumn);
  };

  useEffect(() => {
    setPageWidth(getCurrentPageWidth(editor));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , []);

  useEffect(() => {
    const sdocEditorPage = document.getElementById('sdoc-editor');
    if (!sdocEditorPage) return;

    const resizeObserver = new ResizeObserver(entries => {
      const newPageWidth = entries[0]?.contentRect.width;
      // Check if sdocPageWidth changes
      if (pageWidth && newPageWidth !== pageWidth) {
        const scaleFactor = (newPageWidth + LAST_COLUMN_MARGIN_RIGHT_WIDTH) / (pageWidth + LAST_COLUMN_MARGIN_RIGHT_WIDTH);
        const updatedColumns = element.column.map(item => ({
          ...item,
          width: item.width * scaleFactor,
        }));

        const columnWidthList = updatedColumns.map(item => `${item.width}px`);
        const newStyle = { ...element.style, gridTemplateColumns: columnWidthList.join(' ') };
        setStyle(newStyle);
        setPageWidth(newPageWidth);
        updateColumnWidth(editor, element, updatedColumns);
      } else {
        const columnWidthList = element.column.map(item => `${item.width}px`);
        const newStyle = { ...element.style, gridTemplateColumns: columnWidthList.join(' ') };
        setStyle(newStyle);
      }
    });

    resizeObserver.observe(sdocEditorPage);
    return () => {
      resizeObserver.disconnect();
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageWidth, element.style, element.column]);

  return (
    <MultiColumnRoot attributes={attributes}>
      <div className={multiColumnContainerClassName} style={style} ref={multiColumn} data-id={element.id}>
        {children}
        {!readOnly && <ResizeHandlers
          element={element}
          handleResizeColumn={handleResizeColumn}
        />}
      </div>
    </MultiColumnRoot>
  );
};

MultiColumn.propTypes = {
  className: PropTypes.string,
  attributes: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  element: PropTypes.object,
};

function renderMultiColumn(props) {
  return <MultiColumn {...props} />;
}

export default renderMultiColumn;
