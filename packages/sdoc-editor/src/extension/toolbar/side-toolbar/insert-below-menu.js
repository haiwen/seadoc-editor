import React from 'react';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import { INSERT_POSITION } from '../../constants';
import InsertBlockMenu from './insert-block-menu';

const InsertBelowMenu = ({ target, slateNode }) => {

  return (
    <UncontrolledPopover
      boundariesElement='viewport'
      target={target}
      className="sdoc-side-menu-insert-below-popover sdoc-sub-dropdown-menu sdoc-dropdown-menu"
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
    >
      <div className="sdoc-dropdown-menu-container">
        <InsertBlockMenu insertPosition={INSERT_POSITION.AFTER} slateNode={slateNode} />
      </div>
    </UncontrolledPopover>
  );
};

InsertBelowMenu.propTypes = {
  slateNode: PropTypes.object,
  target: PropTypes.string.isRequired,
};

export default InsertBelowMenu;
