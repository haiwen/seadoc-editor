import React from 'react';

export const PageDisplay = ({ pageId, wikiPageList }) => {
  const page = wikiPageList.find(p => p.id === pageId);

  if (!page) return null;

  return (
    <>
      {page.icon && <span className="page-icon">{page.icon}</span>}
      {!page.icon && (
        <>
          {page.isDir ? <span className='page-icon sf3-font sf3-font-files2'/> : <span className='page-icon sf3-font sf3-font-file'/>}
        </>
      )}
      <span className="page-name">{page.name}</span>
    </>
  );
};
