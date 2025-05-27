import React from 'react';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const ColorItem = ({ t, color, lastUsedColor }) => {
  return (
    <div
      className={classnames('sdoc-color-item', { 'selected': lastUsedColor === color.value })}
      style={{ backgroundColor: color.value }}
      color={color.value}
      data-color={color.value}
      title={color.index ? t(color.name, { value: color.index }) : t(color.name) }
    >
    </div>
  );
};

ColorItem.propTypes = {
  color: PropTypes.object,
  lastUsedColor: PropTypes.string,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(ColorItem);
