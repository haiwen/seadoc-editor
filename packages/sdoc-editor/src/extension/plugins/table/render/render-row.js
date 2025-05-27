import React from 'react';

function renderTableRow(props) {
  const { children } = props;
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}

export default renderTableRow;
