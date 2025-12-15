import React from 'react';
import { useTranslation } from 'react-i18next';
import Lightbox from '@seafile/react-image-lightbox';
import PropTypes from 'prop-types';

import '@seafile/react-image-lightbox/style.css';

const propTypes = {
  imageUrl: PropTypes.string,
  toggle: PropTypes.func,
};

function CommentImagePreviewer(props) {
  const { t } = useTranslation('sdoc-editor');
  const mainSrc = props.imageUrl;
  let imageTitle = '';
  try {
    imageTitle = mainSrc ? decodeURI(mainSrc.slice(mainSrc.lastIndexOf('/') + 1)) : '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return (
    <Lightbox
      wrapperClassName="sf-editor-image-previewer"
      imageTitle={<span className="d-flex"><span className="text-truncate">{imageTitle}</span></span>}
      mainSrc={mainSrc}
      toolbarButtons={[]}
      nextSrc={mainSrc}
      prevSrc={mainSrc}
      onCloseRequest={props.toggle}
      onMovePrevRequest={() => {}}
      onMoveNextRequest={() => {}}
      reactModalProps={{
        shouldReturnFocusAfterClose: false,
      }}
      zoomInTip={t('Enlarge: ⌘ + Wheel')}
      zoomOutTip={t('Shrink: ⌘ + Wheel')}
    />
  );
}

CommentImagePreviewer.propTypes = propTypes;

export default CommentImagePreviewer;
