import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { useSlateStatic } from '@seafile/slate-react';
import deepCopy from 'deep-copy';
import PropTypes from 'prop-types';
import { REBASE_MARKS, REBASE_MARK_KEY, REBASE_ORIGIN } from '../../../../constants';
import { ELEMENT_TYPE } from '../../../constants';
import { findPath, getNode, deleteRebaseNodeMark, updateRebaseParentNodeByPath, replaceRebaseNode, rebaseNode } from '../../../core';

const RebaseModifyModifyDecorate = ({ element, children }) => {
  const { t } = useTranslation('sdoc-editor');
  const editor = useSlateStatic();

  const useMasterChanges = useCallback(() => {
    rebaseNode(editor, () => {
      const path = findPath(editor, element);

      // delete my changes
      const nextElementPath = [...path];
      nextElementPath[path.length - 1] = path[path.length - 1] + 1;
      Transforms.removeNodes(editor, { at: nextElementPath });

      // update master changes
      if (element.type === ELEMENT_TYPE.GROUP) {
        replaceRebaseNode(editor, { at: path, nodes: element.children });
      } else {
        deleteRebaseNodeMark(editor, path, element[REBASE_MARK_KEY.OLD_ELEMENT], REBASE_MARKS);
      }

      updateRebaseParentNodeByPath(editor, path);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element]);

  const useMyChanges = useCallback(() => {
    rebaseNode(editor, () => {
      const path = findPath(editor, element);
      const currentElementPath = [...path];
      currentElementPath[path.length - 1] = path[path.length - 1] + 1;
      const currentElement = getNode(editor, currentElementPath);
      const newCurrentElement = deepCopy(currentElement);
      if (element.type === ELEMENT_TYPE.GROUP) {
        replaceRebaseNode(editor, { at: currentElementPath, nodes: newCurrentElement.children });
      } else {
        deleteRebaseNodeMark(editor, currentElementPath, newCurrentElement, REBASE_MARKS);
      }

      Transforms.removeNodes(editor, { at: path });
      updateRebaseParentNodeByPath(editor, path);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element]);

  const useBothChanges = useCallback(() => {
    rebaseNode(editor, () => {
      const path = findPath(editor, element);
      const nextElementPath = [...path.slice(0, -1), path[path.length - 1] + 1];
      const nextElement = getNode(editor, nextElementPath);

      if (element.type === ELEMENT_TYPE.GROUP) {
        // replace next element
        replaceRebaseNode(editor, { at: nextElementPath, nodes: nextElement.children });

        // replace current element
        replaceRebaseNode(editor, { at: path, nodes: element.children });
      } else {
        // delete element marks
        deleteRebaseNodeMark(editor, path, element, REBASE_MARKS);

        // delete next element marks
        deleteRebaseNodeMark(editor, nextElementPath, nextElement, REBASE_MARKS);
      }

      updateRebaseParentNodeByPath(editor, path);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element]);

  if (element[REBASE_MARK_KEY.ORIGIN] === REBASE_ORIGIN.OTHER) {
    return (
      <>
        <div className="sdoc-rebase-btn-group" contentEditable={false}>
          {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
          <div className="sdoc-rebase-btn" onClick={useMasterChanges}>{t('Keep_other_modification')}</div>
          <div className="mr-2 ml-2">{'|'}</div>
          {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
          <div className="sdoc-rebase-btn" onClick={useMyChanges}>{t('Keep_my_modification')}</div>
          <div className="mr-2 ml-2">{'|'}</div>
          {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
          <div className="sdoc-rebase-btn" onClick={useBothChanges}>{t('Keep_both_modification')}</div>
        </div>
        <div className="sdoc-rebase-other-changes-title" contentEditable={false}>{t('Other_modification')}</div>
        <div className="sdoc-rebase-other-changes" contentEditable={false}>
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sdoc-rebase-my-changes-title" contentEditable={false}>{t('My_modification')}</div>
      <div className="sdoc-rebase-my-changes" contentEditable={false}>
        {children}
      </div>
    </>
  );
};

RebaseModifyModifyDecorate.propTypes = {
  element: PropTypes.object.isRequired,
  children: PropTypes.any,
};

export default RebaseModifyModifyDecorate;
