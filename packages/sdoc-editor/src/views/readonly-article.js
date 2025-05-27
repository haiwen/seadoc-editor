import React, { Fragment } from 'react';
import { Editable, Slate } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import CommentWrapper from '../comment';
import { usePipDecorate } from '../decorates';
import { renderElement, renderLeaf } from '../extension';
import { SetNodeToDecorations } from '../highlight';
import { ArticleContainer } from '../layout';

const ReadOnlyArticle = ({ editor, slateValue, showComment = false }) => {
  const decorate = usePipDecorate(editor);
  return (
    <Slate editor={editor} value={slateValue}>
      <ArticleContainer editor={editor}>
        <Fragment>
          <SetNodeToDecorations />
          <Editable
            id='sdoc-editor'
            readOnly={true}
            placeholder=''
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            decorate={decorate}
          />
        </Fragment>
        {showComment && <CommentWrapper editor={editor} type='editor' />}
      </ArticleContainer>
    </Slate>
  );
};

ReadOnlyArticle.propTypes = {
  showComment: PropTypes.bool,
  editor: PropTypes.object,
  slateValue: PropTypes.array,
  updateSlateValue: PropTypes.func,
};

export default ReadOnlyArticle;
