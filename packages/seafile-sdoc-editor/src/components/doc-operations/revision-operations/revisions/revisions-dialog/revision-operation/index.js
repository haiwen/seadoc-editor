import React, { useCallback, useRef, useState } from 'react';
import { UncontrolledPopover } from 'reactstrap';
import { DropdownMenuItem } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';

import './index.css';

const RevisionOperation = ({ isActive, isOperating, revision, updateOperatingRevision, onDeleteOtherRevision }) => {
  const targetId = `sdoc-revision-${revision.id}`;
  const popoverRef = useRef(null);
  const [isPopoverShow, setPopoverShow] = useState(false);

  const toggle = useCallback(() => {
    popoverRef.current.toggle();
    const nextPopoverShow = !isPopoverShow;
    setPopoverShow(nextPopoverShow);
    updateOperatingRevision(nextPopoverShow ? revision.id : '');
  }, [isPopoverShow, updateOperatingRevision, revision]);

  const deleteRevision = useCallback((event) => {
    event.stopPropagation();
    event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();

    onDeleteOtherRevision();
    popoverRef.current.toggle();

  }, [onDeleteOtherRevision]);

  if (!isActive && !isOperating) return null;

  return (
    <div className='sdoc-revision-operation-toggle-container'>
      <i className="sdocfont sdoc-more sdoc-revision-operation-toggle" id={targetId}></i>
      <UncontrolledPopover
        target={targetId}
        className="sdoc-menu-popover sdoc-dropdown-menu sdoc-revision-menu-popover"
        trigger="legacy"
        placement="bottom-start"
        hideArrow={true}
        toggle={toggle}
        fade={false}
        modifiers={[
          {
            name: 'preventOverflow',
            options: {
              boundariesElement: document.body
            }
          }
        ]}
        ref={popoverRef}
      >
        <div className="sdoc-dropdown-menu-container">
          <DropdownMenuItem onClick={deleteRevision} menuConfig={{ iconClass: 'sdocfont sdoc-delete', text: 'Delete' }} />
        </div>
      </UncontrolledPopover>
    </div>
  );
};

RevisionOperation.propTypes = {
  isActive: PropTypes.bool,
  isOperating: PropTypes.bool,
  revision: PropTypes.object.isRequired,
  onDeleteOtherRevision: PropTypes.func,
};

export default RevisionOperation;
