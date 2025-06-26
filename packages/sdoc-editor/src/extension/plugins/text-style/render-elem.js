import React from 'react';
import { TEXT_STYLE_MAP } from '../../constants';
import { generatorFontFamily } from '../font/helpers';
import Caret from './caret';

const renderText = (props) => {
  const { attributes, children, leaf } = props;
  let { text, ...rest } = leaf;

  let markedChildren = React.cloneElement(children);
  let style = {};
  // The following is a workaround for a Chromium bug where,
  // if you have an inline at the end of a block,
  // clicking the end of a block puts the cursor inside the inline
  // instead of inside the final {text: ''} node
  // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
  if (!text.length) {
    style['paddingLeft'] = '0.1px';
  }
  if (leaf.isCaret) {
    style['position'] = 'relative';
    style['display'] = 'inline-block';
    style['minWidth'] = '2px';
  }

  // Add temporary marks for selection in AI or context comment
  if ((leaf.sdoc_ai || leaf.comment) && leaf.text.trim()) {
    style['padding'] = '3px 0';
    style['backgroundColor'] = '#a9c9ed';
  }

  // Background color overlap for multi comments
  if (Object.keys(leaf).some(key => key.startsWith('sdoc_comment_'))) {
    const commentEntries = Object.entries(leaf).filter(([key]) =>
      key.startsWith('sdoc_comment_')
    );

    for (const [key, value] of commentEntries ) {
      if (value === false && key.startsWith('sdoc_comment_')) {
        const newKey = `removed_${key}`;
        rest[newKey] = true;
        delete rest[key];
      }
    }

    const commentRest = Object.keys(rest).filter(item => item.startsWith('sdoc_comment_'));

    // Multi comment or only one comment
    if (commentRest.length > 1) {
      style['backgroundColor'] = 'rgba(129, 237, 247)';
    }
    if (commentRest.length === 1 ) {
      style['backgroundColor'] = 'rgba(129, 237, 247, 0.5)';
    }
  }

  if (leaf.computed_background_color) {
    style['backgroundColor'] = leaf.computed_background_color;
  }

  if (leaf[TEXT_STYLE_MAP.COLOR]) {
    style['color'] = leaf[TEXT_STYLE_MAP.COLOR];
  }

  if (leaf[TEXT_STYLE_MAP.HIGHLIGHT_COLOR]) {
    style['backgroundColor'] = leaf[TEXT_STYLE_MAP.HIGHLIGHT_COLOR];
  }

  if (leaf[TEXT_STYLE_MAP.FONT_SIZE]) {
    const fontSize = leaf[TEXT_STYLE_MAP.FONT_SIZE];
    if (typeof fontSize === 'number') {
      style['fontSize'] = `${fontSize}pt`;
    }
  }

  if (leaf[TEXT_STYLE_MAP.FONT]) {
    const fontWeight = leaf[TEXT_STYLE_MAP.BOLD] ? 600 : 400;
    style['fontFamily'] = generatorFontFamily(leaf[TEXT_STYLE_MAP.FONT], fontWeight);
  }

  if (leaf[TEXT_STYLE_MAP.BOLD]) {
    markedChildren = <strong>{markedChildren}</strong>;
  }

  if (leaf[TEXT_STYLE_MAP.ITALIC]) {
    markedChildren = <i>{markedChildren}</i>;
  }

  if (leaf[TEXT_STYLE_MAP.UNDERLINE]) {
    markedChildren = <span style={{ textDecoration: 'underline' }}>{markedChildren}</span>;
  }

  if (leaf[TEXT_STYLE_MAP.STRIKETHROUGH]) {
    markedChildren = <span style={{ textDecoration: 'line-through' }}>{markedChildren}</span>;
  }

  if (leaf[TEXT_STYLE_MAP.SUPERSCRIPT]) {
    markedChildren = <sup>{markedChildren}</sup>;
  }

  if (leaf[TEXT_STYLE_MAP.SUBSCRIPT]) {
    markedChildren = <sub>{markedChildren}</sub>;
  }

  if (leaf[TEXT_STYLE_MAP.CODE]) {
    markedChildren = <code>{markedChildren}</code>;
  }

  if (leaf[TEXT_STYLE_MAP.DELETE]) {
    markedChildren = <del>{markedChildren}</del>;
  }

  if (leaf[TEXT_STYLE_MAP.ADD]) {
    markedChildren = <span>{markedChildren}</span>;
  }

  if (leaf.decoration) {
    markedChildren = <span className={`token ${leaf.type}`}>{markedChildren}</span>;
  }

  const GenericLeafStyle = () => {
    return (
      <span data-id={leaf.id} {...attributes} style={style} className={Object.keys(rest).join(' ')}>
        {leaf.isCaret ? <Caret {...leaf} /> : null}
        {leaf.isCaret && <span key={Math.random()} data-slate-zero-width="z" data-slate-length="0">{'\uFEFF'}</span>}
        {!leaf.isCaret && markedChildren}
      </span>
    );
  };

  const CursorPositonFix = () => (
    <span
      contentEditable={false}
      style={{ fontSize: 1 }}
    >
      {String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  );

  const InlineCodeCustomized = () => {
    return (
      <span data-id={leaf.id} {...attributes} style={style} className={Object.keys(rest).join(' ')}>
        {leaf.isCaret ? <Caret {...leaf} /> : null}
        {leaf.isCaret && <span key={Math.random()} data-slate-zero-width="z" data-slate-length="0">{'\uFEFF'}</span>}
        <CursorPositonFix />
        {!leaf.isCaret && markedChildren}
        <CursorPositonFix />
      </span>
    );
  };

  return (
    <>
      {leaf[TEXT_STYLE_MAP.CODE] && <InlineCodeCustomized /> || <GenericLeafStyle />}
    </>
  );
};

export default renderText;
