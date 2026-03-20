import React from 'react';

function renderTableRow(props) {
  const { element, children } = props;
  return (
    <React.Fragment>
      <div hidden data-id={element.id}></div>
      {children}
    </React.Fragment>
  );
}

export default renderTableRow;
