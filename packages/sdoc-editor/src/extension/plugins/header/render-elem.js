import React from 'react';
import { Node } from '@seafile/slate';
import { SDOC_FONT_SIZE } from '../../constants';
import { isEmptyNode } from '../paragraph/helper';
import Placeholder from './placeholder';

export const renderTitle = (props, editor) => {
  const { element, attributes, children } = props;
  const style = {
    fontSize: `${SDOC_FONT_SIZE[element.type]}pt`,
    textAlign: element.align,
  };

  return (
    <div data-id={element.id} {...attributes} className={`sdoc-header-title ${attributes.className}`} style={{ ...style }}>
      {children}
    </div>
  );
};

export const renderSubtitle = (props, editor) => {
  const { element, attributes, children } = props;
  const style = {
    color: '#888',
    fontSize: `${SDOC_FONT_SIZE[element.type]}pt`,
    textAlign: element.align
  };
  return (
    <div data-id={element.id} {...attributes} className='sdoc-header-subtitle' style={{ ...style }}>
      {children}
    </div>
  );
};

export const renderHeader = (props, editor) => {
  const { element, attributes, children, isComposing } = props;
  const { type } = element;
  const level = type.split('header')[1];

  const style = {
    textAlign: element.align,
    fontSize: `${SDOC_FONT_SIZE[element.type]}pt`,
    ...(level === '6' && { fontStyle: 'italic' }),
  };

  let isShowPlaceHolder = false;

  if (isEmptyNode(element) && Node.string(element) === '' && !isComposing) {
    isShowPlaceHolder = true;
  }

  return (
    <div
      data-id={element.id}
      id={element.id} // used for click left outline item, page scroll this element
      {...attributes}
      className={`sdoc-header-${level}`}
      style={{ position: isShowPlaceHolder ? 'relative' : '', ...style }}
    >
      {isShowPlaceHolder && <Placeholder title={'Header'} top={0} />}
      {children}
    </div>
  );
};
