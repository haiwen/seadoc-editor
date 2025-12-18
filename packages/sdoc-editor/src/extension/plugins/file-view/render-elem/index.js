import React, { useEffect, useMemo } from 'react';
import { Database } from '@seafile/seatable-database';
import { useSelected, useSlateStatic } from '@seafile/slate-react';
import classNames from 'classnames';
import toaster from '../../../../components/toast';
import context from '../../../../context';
import { getErrorMsg } from '../../../../utils/common-utils';
import LocalStorage from '../../../../utils/local-storage-utils';
import { RECENT_COPY_CONTENT } from '../../../constants';
import { updateFileView } from '../helpers';

import './index.css';

const FileView = ({ element, children, attributes }) => {
  const { data } = element;

  const editor = useSlateStatic();
  const isSelected = useSelected();
  const viewSettings = useMemo(() => {
    const settings = context.getFileViewSetting();
    const viewSettings = {
      ...settings,
      repoID: data.link_repo_id,
      view_data: {
        view_id: data.view_id,
        wiki_id: data.wiki_id,
      },
    };
    return viewSettings;
  }, [data.link_repo_id, data.view_id, data.wiki_id]);


  useEffect(() => {
    const copyContent = LocalStorage.getItem(RECENT_COPY_CONTENT);
    const wikiId = context.getSetting('wikiId');
    if (wikiId !== data.wiki_id) return;
    if (!copyContent) return;
    const stringContent = JSON.stringify(copyContent);
    if (stringContent.indexOf(data.wiki_id) > -1 && stringContent.indexOf(data.view_id) > -1) {
      context.duplicateWikiView(data.view_id).then(res => {
        const { view } = res.data;
        const newData = { ...data, view_id: view._id, view_name: view.name };
        updateFileView(newData, editor, element);
      }).catch(error => {
        const errorMessage = getErrorMsg(error);
        toaster.danger(errorMessage);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-id={element.id} {...attributes} className={classNames('sdoc-file-view-container', { 'is-selected': isSelected })} contentEditable='false' suppressContentEditableWarning>
      <div className='sdoc-file-view-title'>{data.view_name}</div>
      <div className='sdoc-file-view-content'>
        <Database settings={viewSettings} />
      </div>
      {children}
    </div>
  );
};

export const renderFileView = (props) => {
  return <FileView {...props} />;
};
