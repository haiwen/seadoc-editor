import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { createDefaultEditor } from '../extension';
import { ColorProvider } from '../hooks/use-color-context';
import { ScrollContext } from '../hooks/use-scroll-context';
import { EditorContainer } from '../layout';
import withNodeId from '../node-id';
import { generateDefaultDocContent } from '../utils/document-utils';
import Outline from '../wiki-outline';
import ReadOnlyArticle from './readonly-article';

import '../assets/css/sdoc-wiki-viewer.css';

// maybe can be deleted in the future
const SDocMdViewer = ({
  editor,
  document,
  showOutline = false,
  scrollRef: propsScrollRef
}) => {
  const validEditor = editor || withNodeId(createDefaultEditor());
  const slateValue = (document || generateDefaultDocContent()).children;
  const scrollRef = useRef(null);

  const currentScrollRef = propsScrollRef || scrollRef;

  return (
    <EditorContainer editor={validEditor} readonly={true}>
      <ColorProvider>
        <div ref={scrollRef} className="sdoc-wiki-scroll-container">
          <ScrollContext.Provider value={{ scrollRef: currentScrollRef }}>
            <ReadOnlyArticle editor={validEditor} slateValue={slateValue} showComment={false} />
            {showOutline && (
              <div className='sdoc-wiki-outline-container'>
                <Outline editor={validEditor} />
              </div>
            )}
          </ScrollContext.Provider>
        </div>
      </ColorProvider>
    </EditorContainer>
  );

};

SDocMdViewer.propTypes = {
  showOutline: PropTypes.bool,
  document: PropTypes.object,
  editor: PropTypes.object,
};

export default SDocMdViewer;
