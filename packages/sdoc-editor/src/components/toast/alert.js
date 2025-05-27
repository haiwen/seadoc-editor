import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  intent: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onRemove: PropTypes.func.isRequired,
  children: PropTypes.string,
  isRemovable: PropTypes.bool,
};

class Alert extends React.PureComponent {

  getIconClass(intent) {
    switch (intent) {
      case 'success':
        return 'sdocfont sdoc-check-circle';
      case 'warning':
        return 'sdocfont sdoc-exclamation-triangle';
      case 'none':
        return 'sdocfont sdoc-exclamation-circle';
      case 'danger':
        return 'sdocfont sdoc-exclamation-circle';
      default:
        return 'sdocfont sdoc-check-circle';
    }
  }

  render() {
    const { intent, title, children, isRemovable, onRemove } = this.props;
    const iconClass = this.getIconClass(intent);
    return (
      <div className={`sdoc-toast-alert-container ${intent || 'success'}`}>
        <div className="toast-alert-icon"><i className={iconClass} /></div>
        <div className="toast-text-container">
          <p className="toast-text-title">{title}</p>
          {children ? <p className="toast-text-child">{children}</p> : null}
        </div>
        {isRemovable && (
          <div onClick={onRemove} className="toast-close">
            <span>&times;</span>
          </div>
        )}
      </div>
    );
  }
}

Alert.propTypes = propTypes;

export default Alert;
