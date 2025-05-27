import React from 'react';

const Group = ({ element, attributes, children, className }) => {

  return (
    <div
      data-id={element.id}
      {...attributes}
      className={className}
    >
      {children}
    </div>
  );
};

export const renderGroup = (props) => {
  return <Group {...props} />;
};
