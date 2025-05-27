import React from 'react';

const InlineBugFixer = () => {
  return (
    <span
      contentEditable={false}
      style={{ fontSize: 0 }}
    >
      {String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  );
};

export default InlineBugFixer;
