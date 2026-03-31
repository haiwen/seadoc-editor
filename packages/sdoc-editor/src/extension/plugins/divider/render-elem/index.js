/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { useSelected } from '@seafile/slate-react';

import './index.css';


const renderDivider = ({ attributes, children, element }) => {
  const isSelected = useSelected();

  return (
    <div
      data-id={element.id}
      {...attributes}
      contentEditable='false'
      suppressContentEditableWarning
      className={`sdoc-divider-container ${isSelected ? 'is-selected' : ''}`}
    >
      {children}
      <div className="sdoc-divider"></div>
    </div>
  );
};

export default renderDivider;
