import React from 'react';
import Lightbox from '@seafile/react-image-lightbox';
import PropTypes from 'prop-types';
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
    while (nodes && nodeIndex <= nodes.length - 1) {
      const currentNode = nodes[nodeIndex];
      if (currentNode.type === 'image') {
        const url = getImageURL(currentNode.data);
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

  render() {
    const { imageIndex } = this.state;
    const imageItemsLength = this.images.length;
    const mainSrc = this.images[imageIndex] || '';
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
      />
    );
  }
}

ImagePreviewer.propTypes = propTypes;

export default ImagePreviewer;
