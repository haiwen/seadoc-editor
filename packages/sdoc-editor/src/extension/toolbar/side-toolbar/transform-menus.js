import React from 'react';
import { withTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import DropdownMenuItem from '../../commons/dropdown-menu-item';
import { getTransformMenusConfig } from './helpers';

const TransformMenus = ({ editor, slateNode, target, onSetType }) => {

  return (
    <UncontrolledPopover
      boundariesElement='viewport'
      target={target}
      className="sdoc-side-operation-translate-popover sdoc-sub-dropdown-menu sdoc-dropdown-menu"
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
    >
      <div className="sdoc-dropdown-menu-container">
        {getTransformMenusConfig(editor, slateNode).map((item) => {
          return (
            <DropdownMenuItem key={item.id} menuConfig={item} onClick={() => onSetType(item.type)} />
          );
        })}
      </div>
    </UncontrolledPopover>
  );
};

TransformMenus.propTypes = {
  target: PropTypes.string.isRequired,
  slateNode: PropTypes.object,
  onSetType: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default withTranslation('sdoc-editor')(TransformMenus);
