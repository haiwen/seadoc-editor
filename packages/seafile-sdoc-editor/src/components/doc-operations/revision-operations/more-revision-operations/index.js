import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { EventBus, toaster, Tooltip, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import { NEW_REVISION } from '../../../../constants';

import './index.css';

const MoreRevisionOperations = ({ t }) => {
  const id = 'sdoc_revisions';
  const eventBus = EventBus.getInstance();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = useCallback((isDropdownOpen) => {
    setIsDropdownOpen(!isDropdownOpen);
  }, []);

  const startRevise = useCallback(() => {
    context.startRevise().then((res) => {
      const repoID = context.getSetting('repoID');
      const siteRoot = context.getSetting('siteRoot');
      const revisionURL = `${siteRoot}lib/${repoID}/revisions/${res.data.revision_id}/`;
      window.open(revisionURL, '_blank');
      eventBus.dispatch(NEW_REVISION);
    }).catch(error => {
      toaster.danger(t('Error'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dropdown isOpen={isDropdownOpen} toggle={() => toggleDropdown(isDropdownOpen)} className="sdoc-more-revision-operations-dropdown" >
      <DropdownToggle id={id} className="ml-4 sdoc-more-revision-operations-toggle" tag="div">
        <i className="sdocfont sdoc-revise" />
        <span className={`sdocfont sdoc-${isDropdownOpen ? 'arrow-up' : 'arrow-down'}`}></span>
      </DropdownToggle>
      <Tooltip target={id}>
        {t('Revise')}
      </Tooltip>
      <DropdownMenu className="sdoc-dropdown-menu" end>
        <DropdownItem className="sdoc-dropdown-menu-item" onClick={startRevise}>
          <div className="sdoc-more-revision-operation">
            <div className="sdoc-more-revision-operation-title">
              <i className="sdocfont sdoc-revise" />
              <span className="sdoc-more-revision-operation-title-name">{t('Revise')}</span>
            </div>
            <div className="sdoc-more-revision-operation-describe">
              {t('Start_revise_tip')}
            </div>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

};

MoreRevisionOperations.propTypes = {
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(MoreRevisionOperations);
