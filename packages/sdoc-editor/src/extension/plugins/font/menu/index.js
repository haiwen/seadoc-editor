import React from 'react';
import PropTypes from 'prop-types';
import FontFamily from './font-family';
import FontSize from './font-size';

const Font = ({ editor, readonly }) => {

  return (
    <>
      <FontFamily editor={editor} readonly={readonly} />
      <FontSize editor={editor} readonly={readonly} />
    </>
  );
};

Font.propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

export default Font;
