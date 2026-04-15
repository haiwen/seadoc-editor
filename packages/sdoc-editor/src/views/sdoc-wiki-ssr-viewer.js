import React, { useRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Loading from '../components/loading';
import { MATH_JAX_SOURCE_RUL } from '../constants';
import context from '../context';
import { createDefaultEditor } from '../extension';
import { ColorProvider } from '../hooks/use-color-context';
import useMathJax from '../hooks/use-mathjax';
import { ScrollContext } from '../hooks/use-scroll-context';
import { EditorContainer } from '../layout';
import withNodeId from '../node-id';
import WikiOutline from '../outline/wiki-outline';
import { generateDefaultDocContent } from '../utils/document-utils';
import ReadOnlyArticle from './readonly-article';

import '../assets/css/sdoc-wiki-ssr-viewer.css';


// maybe can be deleted in the future
const SDocWikiSSRViewer = ({
  settings,
  editor,
  document,
  scrollRef: propsScrollRef,
  mathJaxSource = MATH_JAX_SOURCE_RUL,
}) => {
  const { isLoadingMathJax } = useMathJax(mathJaxSource);
  const validEditor = editor || withNodeId(createDefaultEditor());
  const slateValue = (document || generateDefaultDocContent()).children;
  const scrollRef = useRef(null);

  const currentScrollRef = propsScrollRef || scrollRef;

  context.initSSRSettings(settings);

  if (isLoadingMathJax) {
    return <Loading />;
  }

  return (
    <EditorContainer editor={validEditor} readonly={true}>
      <ColorProvider>
        <div className="sdoc-content-wrapper">
          <ScrollContext.Provider value={{ scrollRef: currentScrollRef }}>
            <div className={classNames('sdoc-editor-content readonly')}>
              <ReadOnlyArticle editor={validEditor} slateValue={slateValue} showComment={false} />
            </div>
            <WikiOutline doc={slateValue} />
          </ScrollContext.Provider>
        </div>
      </ColorProvider>
    </EditorContainer>
  );

};

SDocWikiSSRViewer.propTypes = {
  showOutline: PropTypes.bool,
  document: PropTypes.object,
  editor: PropTypes.object,
};

export default SDocWikiSSRViewer;
