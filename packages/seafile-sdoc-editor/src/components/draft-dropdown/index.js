import React from 'react';
import { withTranslation } from 'react-i18next';
import { EventBus } from '@seafile/sdoc-editor';
import { EXTERNAL_EVENT } from '../../constants';

import './style.css';

class DraftDropdownMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDropdownMenuOpen: false
    };
  }

  registerEventHandler = () => {
    document.addEventListener('click', this.onHideDraftDropdownMenu);
  };

  unregisterEventHandler = () => {
    document.removeEventListener('click', this.onHideDraftDropdownMenu);
  };

  onHideDraftDropdownMenu = () => {
    this.setState({ isDropdownMenuOpen: false }, () => {
      this.unregisterEventHandler();
    });
  };

  onToggleClick = (event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const isDropdownMenuOpen = !this.state.isDropdownMenuOpen;
    if (isDropdownMenuOpen) {
      this.setState({ isDropdownMenuOpen }, () => {
        this.registerEventHandler();
      });
    } else {
      this.setState({ isDropdownMenuOpen }, () => {
        this.unregisterEventHandler();
      });
    }
  };

  unmark = () => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.UNMARK_AS_DRAFT);
  };

  render() {
    const { isDropdownMenuOpen } = this.state;
    const { t } = this.props;

    return (
      <div className="sdoc-draft-menu">
        <span
          className="draft-toggle sdoc-draft-identifier"
          onClick={this.onToggleClick}
        >
          {t('Draft')}
        </span>
        {isDropdownMenuOpen && (
          <ul className="draft-popover list-unstyled m-0">
            <li className="draft-menu-item" onClick={this.unmark}>{t('Unmark_as_draft')}</li>
          </ul>
        )}
      </div>
    );
  }
}

export default withTranslation('sdoc-editor')(DraftDropdownMenu);
