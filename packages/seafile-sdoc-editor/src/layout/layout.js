import React, { useEffect } from 'react';
import { context, LocalStorage } from '@seafile/sdoc-editor';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const Layout = ({ children, className, ...restProps }) => {

  const cacheHistoryFiles = () => {
    const isPublished = context.getSetting('isPublished') || false;
    const isSdocRevision = context.getSetting('isSdocRevision') || false;
    if (isPublished) return;
    if (isSdocRevision) return;

    const docUuid = context.getSetting('docUuid');
    const docName = context.getSetting('docName');
    const recentFiles = LocalStorage.getItem('sdoc-recent-files', []);
    let arr = [];
    const newFile = { doc_uuid: docUuid, name: docName };
    if (recentFiles.length > 0) {
      const isExist = recentFiles.find((item) => item.doc_uuid === docUuid);
      if (isExist) return;
      if (!isExist) {
        let newRecentFiles = recentFiles.slice(0);
        if (recentFiles.length === 10) {
          newRecentFiles.shift();
        }
        arr = [newFile, ...newRecentFiles];
      }
    } else {
      arr.push(newFile);
    }
    LocalStorage.setItem('sdoc-recent-files', arr);
  };

  useEffect(() => {
    setTimeout(() => {
      const url = window.location.href;
      const id = url.slice(url.indexOf('#') + 1);
      if (id) {
        const element = document.getElementById(id);
        element && element.scrollIntoView(true);
      }
    }, 500);

    cacheHistoryFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classnames('sdoc-editor-page-wrapper', className)} {...restProps}>
      {children}
    </div>
  );
};

Layout.propTypes = propTypes;

export default Layout;
