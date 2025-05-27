import React, { useEffect, useState } from 'react';
import { Editor, Path } from '@seafile/slate';
import { ReactEditor, useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Column = ({ attributes, element, children }) => {
  const editor = useSlateStatic();
  const [columnWidth, setColumnWidth] = useState(element.width || 0);

  const path = ReactEditor.findPath(editor, element);
  const parentPath = Path.parent(path);
  const [parentNode] = Editor.node(editor, parentPath);

  useEffect(() => {
    const matchingColumn = parentNode?.column?.find(column => column.key === element.id);
    if (matchingColumn) {
      setColumnWidth(matchingColumn.width);
    }
  }, [editor, element, parentNode.column]);

  return (
    <div
      {...attributes}
      className={classnames('column', attributes.className)}
      data-id={element.id}
      style={{ width: `${columnWidth}px` }}
    >
      <div className='sdoc-column-container'>
        {children}
      </div>
    </div>
  );
};

Column.propTypes = {
  isComposing: PropTypes.bool,
  attributes: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
};

function renderColumn(props) {
  // When read only

  return (
    <Column {...props} />
  );
}

export default renderColumn;
