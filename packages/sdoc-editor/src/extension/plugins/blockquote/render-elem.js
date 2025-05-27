
import React from 'react';

const renderBlockquote = (props, editor) => {
  const { attributes, children, element } = props;
  const style = { textAlign: element.align };
  return <blockquote data-id={element.id} {...attributes} style={style}>{children}</blockquote>;
};

export default renderBlockquote;
