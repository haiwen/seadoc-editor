import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { useSlateStatic } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { REBASE_MARKS } from '../../../../constants';
import { ELEMENT_TYPE } from '../../../constants';
import { findPath, deleteRebaseNodeMark, updateRebaseParentNodeByPath } from '../../../core';

const RebaseModifyDeleteDecorate = ({ element, children }) => {
  const { t } = useTranslation('sdoc-editor');
  const editor = useSlateStatic();

  const deleteElement = useCallback(() => {
    const path = findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });

    if (element.type === ELEMENT_TYPE.LIST_ITEM) {
      updateRebaseParentNodeByPath(editor, path);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element]);

  const deleteMark = useCallback(() => {
    const path = findPath(editor, element);
    deleteRebaseNodeMark(editor, path, element, REBASE_MARKS);

    if (element.type === ELEMENT_TYPE.LIST_ITEM) {
      updateRebaseParentNodeByPath(editor, path);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element]);

  return (
    <>
      <div className="sdoc-rebase-btn-group" contentEditable={false}>
        <div className="sdoc-rebase-btn" onClick={deleteMark}>{t('Keep_other_modification')}</div>
        <div className="mr-2 ml-2">{'|'}</div>
        <div className="sdoc-rebase-btn" onClick={deleteElement}>{t('Keep_my_modification')}</div>
        <div className="mr-2 ml-2">{'|'}</div>
        <div className="sdoc-rebase-btn" onClick={deleteMark}>{t('Keep_both_modification')}</div>
      </div>
      <div className="sdoc-rebase-other-changes-title" contentEditable={false}>{t('Other_modification')}</div>
      <div className="w-100 sdoc-rebase-my-changes" contentEditable={false}>
        {children}
      </div>
      <div className="sdoc-rebase-my-changes-title" contentEditable={false}>{t('My_modification')}</div>
      <div className="sdoc-rebase-my-changes empty" contentEditable={false}></div>
    </>
  );
};

RebaseModifyDeleteDecorate.propTypes = {
  element: PropTypes.object.isRequired,
  children: PropTypes.any,
};

export default RebaseModifyDeleteDecorate;
