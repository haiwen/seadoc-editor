import React from 'react';
import { Path, Text, Transforms } from '@seafile/slate';
import { PARAGRAPH } from '../../../constants';
import { generateEmptyElement } from '../../../core';

export const removeMarks = (editor) => {
  const { selection } = editor;

  Transforms.unsetNodes(editor, 'sdoc_ai', {
    at: [],
    match: n => Text.isText(n) && n.sdoc_ai === true
  });

  Transforms.unsetNodes(editor, 'comment', {
    at: [],
    match: n => Text.isText(n) && n.comment === true
  });

  if (selection) {
    Transforms.select(editor, selection);
  } else {
    Transforms.deselect(editor);
  }
};

export const markdownTableRenderer = (searchResult) => {
  if (!searchResult) return '';
  return <div className='md-rendered-html' dangerouslySetInnerHTML={{ __html: searchResult }} />;
};

export const insertHtmlTransferredNodes = (slateNodeList, nextPath, editor) => {
  slateNodeList.forEach((childNode) => {
    // Insert paragraph nodes
    if (childNode.type === PARAGRAPH) {
      if (childNode.children.length > 1) {
        childNode.children.forEach((textNode, index) => {
          if (!textNode.text.trim()) return;
          const p = generateEmptyElement(PARAGRAPH);
          p.children.push(textNode);
          Transforms.insertNodes(editor, p, { at: nextPath });
          nextPath = Path.next(nextPath);
        });
      } else {
        Transforms.insertNodes(editor, childNode, { at: nextPath });
        nextPath = Path.next(nextPath);
      }
    }

    // Insert non-paragraph nodes
    if (childNode.type !== PARAGRAPH) {
      Transforms.insertNodes(editor, childNode, { at: nextPath });
      nextPath = Path.next(nextPath);
    }
  });
};
