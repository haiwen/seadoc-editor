import React from 'react';
import processor from '../../../slate-convert/md-to-html';

export const markdownContentRenderer = (content) => {
  if (!content) return '';
  return <div className='md-rendered-html' dangerouslySetInnerHTML={{ __html: content }} />;
};

export const transferredHtml = async (context) => {
  const htmlString = await processor.process(context);
  const formatHtml = String(htmlString).trim();
  return formatHtml;
};
