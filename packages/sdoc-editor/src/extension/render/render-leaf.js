import React from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import { TextPlugin } from '../plugins';

const CustomLeaf = (props) => {
  const editor = useSlateStatic();
  const [renderText] = TextPlugin.renderElements;
  return renderText(props, editor);
};

const renderLeaf = (props) => {
  return <CustomLeaf {...props} />;
};

export default renderLeaf;

