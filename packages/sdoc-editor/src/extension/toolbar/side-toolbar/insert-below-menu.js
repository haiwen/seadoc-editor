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
      className="sdoc-side-menu-insert-below-popover sdoc-sub-dropdown-menu"
      popperClassName='sdoc-popover-box-shadow'
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
      offset={[0, 6]}
    >
      <div className="sdoc-dropdown-menu">
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
