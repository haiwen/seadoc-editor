import React from 'react';

export const PageDisplay = ({ pageId, wikiPageList }) => {
  const page = wikiPageList.find(p => p.id === pageId);

  if (!page) return null;

  return (
    <>
      {page.icon && <span className="sdoc-linked-page-icon">{page.icon}</span>}
      {!page.icon && (
        <>
          {page.isDir ? <span className='sdoc-linked-page-icon sdocfont sdoc-wiki-files'/> : <span className='sdoc-linked-page-icon sdocfont sdoc-wiki-file'/>}
        </>
      )}
      <span className="sdoc-linked-page-name">{page.name}</span>
    </>
  );
};
