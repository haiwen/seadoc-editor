import React from 'react';
import Lightbox from '@seafile/react-image-lightbox';
import PropTypes from 'prop-types';
import { isMac } from '../../../../utils/common-utils';
import { getImageURL } from '../helpers';

import '@seafile/react-image-lightbox/style.css';

const propTypes = {
  imageUrl: PropTypes.string,
  editor: PropTypes.object,
  toggleImagePreviewer: PropTypes.func,
};

class ImagePreviewer extends React.Component {

  constructor(props) {
    super(props);
    const { editor, imageUrl } = props;
    this.images = this.getImageNodes(editor.children);
    this.state = {
      imageIndex: this.images.findIndex((item) => item === imageUrl)
    };
  }

  getImageNodes = (nodes) => {
    let nodeIndex = 0;
    const list = [];
    const { editor } = this.props;
    while (nodes && nodeIndex <= nodes.length - 1) {
      const currentNode = nodes[nodeIndex];
      if (currentNode.type === 'image') {
        const url = getImageURL(currentNode.data, editor);
        url && list.push(url);
      } else {
        list.push(...this.getImageNodes(currentNode.children));
      }
      nodeIndex++;
    }
    return list;
  };

  moveToPrevImage = () => {
    this.setState(prevState => ({
      imageIndex: (prevState.imageIndex + this.images.length - 1) % this.images.length,
    }));
  };

  moveToNextImage = () => {
    this.setState(prevState => ({
      imageIndex: (prevState.imageIndex + 1) % this.images.length,
    }));
  };

  setImageIndex = (index) => {
    this.setState({ imageIndex: index });
  };

  render() {
    const { imageIndex } = this.state;
    const imageItemsLength = this.images.length;
    const mainSrc = this.images[imageIndex] || '';
    const shortcutMain = isMac() ? '⌘' : 'Ctrl';
    let imageTitle = '';
    try {
      imageTitle = mainSrc ? decodeURI(mainSrc.slice(mainSrc.lastIndexOf('/') + 1)) : '';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    const imageTitleEl = (
      <span className="d-flex">
        <span className="text-truncate">{imageTitle}</span>
        <span className="flex-shrink-0">({imageIndex + 1}/{this.images.length})</span>
      </span>
    );
    return (
      <Lightbox
        imageItems={this.images}
        currentIndex={imageIndex}
        setImageIndex={index => this.setImageIndex(index)}
        wrapperClassName="sf-editor-image-previewer"
        imageTitle={imageTitleEl}
        mainSrc={mainSrc}
        toolbarButtons={[]}
        nextSrc={this.images[(imageIndex + 1) % imageItemsLength]}
        prevSrc={this.images[(imageIndex + imageItemsLength - 1) % imageItemsLength]}
        onCloseRequest={this.props.toggleImagePreviewer}
        onMovePrevRequest={this.moveToPrevImage}
        onMoveNextRequest={this.moveToNextImage}
        reactModalProps={{
          shouldReturnFocusAfterClose: false,
        }}
        zoomInTip={this.props.t('Enlarge: Ctrl + Wheel').replace('Ctrl', shortcutMain)}
        zoomOutTip={this.props.t('Shrink: Ctrl + Wheel').replace('Ctrl', shortcutMain)}
      />
    );
  }
}

ImagePreviewer.propTypes = propTypes;

export default ImagePreviewer;
