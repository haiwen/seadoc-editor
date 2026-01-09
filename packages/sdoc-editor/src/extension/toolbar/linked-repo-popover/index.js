import React, { useEffect, useState } from 'react';
import { UncontrolledPopover } from 'reactstrap';
import { isOverflowPortByDirection } from '../../utils';
import LinkedRepoList from './link-repo-list';

export default function LinkRepoPopover({ onRepoClick }) {
  const [placement, setPlacement] = useState('right-start');

  useEffect(() => {
    const element = document.getElementById('sdoc-side-menu-item-file-view');
    if (isOverflowPortByDirection(element, 'bottom')) {
      setPlacement('right');
    }
  }, []);

  return (
    <UncontrolledPopover
      target='sdoc-side-menu-item-file-view'
      trigger="hover"
      className="sdoc-menu-popover sdoc-dropdown-menu sdoc-sub-dropdown-menu sdoc-insert-menu-file-view-popover"
      placement={placement}
      hideArrow={true}
      fade={false}
    >
      <LinkedRepoList onRepoClick={onRepoClick} />
    </UncontrolledPopover>
  );
}
