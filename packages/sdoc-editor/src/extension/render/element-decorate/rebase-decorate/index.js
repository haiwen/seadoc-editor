import React from 'react';
import PropTypes from 'prop-types';
import { REBASE_MARK_KEY, REBASE_TYPE } from '../../../../constants';
import RebaseDeleteModifyDecorate from './rebase-delete-modify-decorate';
import RebaseModifyDeleteDecorate from './rebase-modify-delete-decorate';
import RebaseModifyModifyDecorate from './rebase-modify-modify-decorate';

import './index.css';

const RebaseDecorate = ({ element, children }) => {
  const rebaseType = element[REBASE_MARK_KEY.REBASE_TYPE];
  if (!rebaseType) return <>{children}</>;
  if (rebaseType === REBASE_TYPE.MODIFY_DELETE) {
    return <RebaseModifyDeleteDecorate element={element}>{children}</RebaseModifyDeleteDecorate>;
  }

  if (rebaseType === REBASE_TYPE.DELETE_MODIFY) {
    return <RebaseDeleteModifyDecorate element={element}>{children}</RebaseDeleteModifyDecorate>;
  }

  if (rebaseType === REBASE_TYPE.MODIFY_MODIFY) {
    return <RebaseModifyModifyDecorate element={element}>{children}</RebaseModifyModifyDecorate>;
  }

  return <>{children}</>;
};

RebaseDecorate.propTypes = {
  element: PropTypes.object.isRequired,
  children: PropTypes.any,
};

export default RebaseDecorate;
