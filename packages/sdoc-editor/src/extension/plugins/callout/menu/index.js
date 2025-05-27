import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import toaster from '../../../../components/toast';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import { MenuItem } from '../../../commons';
import { MENUS_CONFIG_MAP } from '../../../constants';
import { CALL_OUT } from '../../../constants/element-type';
import { isMenuActive, isMenuDisabled, unwrapCallout, wrapCallout } from '../helper';

const propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

const menuConfig = MENUS_CONFIG_MAP[CALL_OUT];

const CalloutMenu = ({ editor, isRichEditor, className, readonly }) => {
  const { t } = useTranslation('sdoc-editor');

  const handleDisplayAlert = useCallback((type) => {
    setTimeout(() => {
      toaster.warning(`${t('The_current_location_does_not_support_pasting')}${t(type && type.at(0).toUpperCase() + type.slice(1))}`);
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.DISPLAY_CALLOUT_UNSUPPORT_ALERT, handleDisplayAlert);
    return unsubscribe;
  }, [handleDisplayAlert]);

  const handleClick = useCallback((e) => {
    isMenuActive(editor) ? unwrapCallout(editor) : wrapCallout(editor);
  }, [editor]);

  return (
    <>
      <MenuItem
        isRichEditor={isRichEditor}
        className={className}
        ariaLabel='callout'
        disabled={isMenuDisabled(editor, readonly)}
        isActive={isMenuActive(editor)}
        onMouseDown={handleClick}
        {...menuConfig}
      />
    </>
  );
};

CalloutMenu.propTypes = propTypes;

export default CalloutMenu;
