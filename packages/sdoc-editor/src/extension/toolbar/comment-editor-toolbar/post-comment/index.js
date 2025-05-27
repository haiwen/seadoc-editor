import React, { useEffect } from 'react';
import Tooltip from '../../../../components/tooltip';

import './style.css';

const PostCommentBtn = ({ onSubmit, submitBtnText, onCancel }) => {

  useEffect(() => {
    document.addEventListener('keydown', onCancel, false);
    document.addEventListener('click', onCancel, false);
    return () => {
      document.removeEventListener('keydown', onCancel, false);
      document.removeEventListener('click', onCancel, false);
    };
  }, [onCancel]);

  return (
    <div role="button" id='sdoc-comment-editor-comment-btn'>
      <i className="sdocfont sdoc-save sdoc-comment-btn" onClick={onSubmit} ></i>
      <Tooltip target="sdoc-comment-editor-comment-btn" >
        {submitBtnText}
      </Tooltip>
    </div>
  );
};

export default PostCommentBtn;
