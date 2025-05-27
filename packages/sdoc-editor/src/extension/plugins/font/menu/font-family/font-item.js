import React from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { DEFAULT_FONT } from '../../../../constants';
import { hasFontLoaded, generatorFontFamily } from '../../helpers';

const FontItem = ({ selectedFont, fontObject, setFont }) => {
  const { t } = useTranslation('sdoc-editor');
  const fontName = fontObject.name;
  const isSelected = selectedFont === fontName;
  const isFontLoad = hasFontLoaded(fontObject, 400);
  const style = isFontLoad ? { fontFamily: generatorFontFamily(fontName, 400) } : {};
  return (
    <div
      className={classnames('sdoc-dropdown-menu-item', { 'position-relative': isSelected } )}
      onClick={() => setFont(fontName)}
    >
      {isSelected && (<i className="sdocfont sdoc-check-mark"></i>)}
      <span style={style}>{fontName === DEFAULT_FONT ? t('Default_font') : fontName}</span>
    </div>
  );
};

FontItem.propTypes = {
  selectedFont: PropTypes.string,
  fontObject: PropTypes.object.isRequired,
  index: PropTypes.number,
  setFont: PropTypes.func.isRequired,
};

export default FontItem;
