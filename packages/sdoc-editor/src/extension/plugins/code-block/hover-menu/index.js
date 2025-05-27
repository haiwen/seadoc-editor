
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation, withTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import { ElementPopover } from '../../../commons/';
import { getSelectedLangOption } from '../helpers';
import { genCodeLangs } from '../prismjs';

import './index.css';

const propTypes = {
  style: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  menuPosition: PropTypes.object.isRequired,
  onChangeLanguage: PropTypes.func.isRequired,
  onChangeAutoLineWrap: PropTypes.func.isRequired,
  onCopyCodeBlock: PropTypes.func.isRequired,
  onDeleteCodeBlock: PropTypes.func.isRequired,
};

const LangList = React.forwardRef(({ langsData, onSelectLang, selectedLanguageText, selectedIndex }, ref) => {
  const { t } = useTranslation('sdoc-editor');

  if (!langsData.length) {
    return (
      <div className='langs-list-empty'>
        <span>{ t('Search_not_found')}</span>
      </div>
    );
  }

  return (
    <ul className='langs-list-ul'>
      {langsData.map((item, index) => {
        return (
          <li
            ref={el => ref.current[index] = el}
            className={`langs-list-li ${selectedLanguageText === item.text ? 'active' : ''} ${selectedIndex === index ? 'hover' : ''}`}
            id={item.value}
            key={item.value}
            onClick={() => {
              onSelectLang(item, index);
            }}
          >
            {item.text}
            <span className={`li-check-mark ${selectedLanguageText === item.text ? 'li-checked' : ''}`}>
              <i className='sdocfont sdoc-check-mark icon-font'></i>
            </span>
          </li>
        );
      })}
    </ul>
  );
});

const CodeBlockHoverMenu = ({ style, language, menuPosition, onChangeLanguage, onChangeAutoLineWrap, onCopyCodeBlock, onDeleteCodeBlock, t }) => {
  const { white_space = 'nowrap' } = style;
  const [isShowlangsList, setIsShowlangsList] = useState(false);
  const [selectedLanguageText, setSelectedLanguageText] = useState('');
  const [langsData, setLangsData] = useState(genCodeLangs());
  const [isShowTooltip, setIsShowTooltip] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const langRefs = useRef([]);

  useEffect(() => {
    langRefs.current = Array(langsData.length).fill().map((_, i) => langRefs.current[i] || React.createRef());
  }, [langsData]);

  const onHiddenLangsList = useCallback((e) => {
    if (!e.target.parentNode.className.includes('sdoc-search-langs')) {
      setIsShowlangsList(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsShowTooltip(true);
    window.addEventListener('click', onHiddenLangsList);
    return () => {
      window.removeEventListener('click', onHiddenLangsList);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShowLangs = useCallback((e) => {
    e.stopPropagation();
    setSelectedIndex(langsData.findIndex(lang => lang.text === selectedLanguageText));
    setIsShowlangsList(!isShowlangsList);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowlangsList, selectedLanguageText]);

  const onAutoLineWrap = useCallback(() => {
    if (white_space === 'normal') {
      onChangeAutoLineWrap('nowrap');
    } else {
      onChangeAutoLineWrap('normal');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [white_space]);

  const onDelete = useCallback(() => {
    onDeleteCodeBlock();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectLang = useCallback((lang, index) => {
    const { text } = lang;
    setSelectedLanguageText(text);
    setSelectedIndex(index);
    onChangeLanguage(lang);
    const selectedLangRef = langRefs.current[index];
    if (selectedLangRef) {
      selectedLangRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChangeLanguage]);

  useEffect(() => {
    // Compatible with legacy code
    let selectedLanguage = language;
    if (language === 'text') {
      selectedLanguage = 'plaintext';
    }

    const selectedLanguageOption = getSelectedLangOption(selectedLanguage);
    setSelectedLanguageText(selectedLanguageOption.text);
  }, [language]);

  const onChange = useCallback((e) => {
    // Escapes all special characters in a string for safe use in regular expressions.
    const escapeRegExp = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const filterData = [];
    const value = e.currentTarget.value.toLowerCase().trim();
    // Generate a RegExp object and perform case-insensitive matching thereafter.
    const regex = new RegExp(escapeRegExp(value), 'i');
    genCodeLangs().forEach((item) => {
      if (regex.test(item.value)) {
        filterData.push(item);
      }
    });
    setLangsData(filterData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = useCallback((e) => {
    const { key } = e;
    switch (key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prevIndex) => {
          const newIndex = Math.max(prevIndex - 1, 0);
          scrollToLang(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prevIndex) => {
          const newIndex = Math.min(prevIndex + 1, langsData.length - 1);
          scrollToLang(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
        onSelectLang(langsData[selectedIndex], selectedIndex);
        break;
      default:
        break;
    }
  }, [langsData, selectedIndex, onSelectLang]);

  const scrollToLang = (index) => {
    const selectedLangRef = langRefs.current[index];
    if (selectedLangRef) {
      selectedLangRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <ElementPopover>
      <div className="sdoc-code-block-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          <div className="sdoc-code-block-hover-operation-item sdoc-code-block-hover-operation-lang">
            <div role="button" className={`op-item ${isShowlangsList ? 'active' : ''}`} onClick={onShowLangs}>
              <span>{selectedLanguageText}</span>
              <i className='sdocfont sdoc-drop-down icon-font'></i>
            </div>
          </div>
          <div className="sdoc-code-block-hover-operation-divider"></div>
          <div id='sdoc_code_block_auto_wrap' className="sdoc-code-block-hover-operation-item">
            <div role="button" className={`op-item ${white_space === 'normal' ? 'active' : ''}`} onClick={onAutoLineWrap}>
              <i className='sdocfont sdoc-auto-linefeed icon-font'></i>
            </div>
            {isShowTooltip && (
              <Tooltip target='sdoc_code_block_auto_wrap' placement='top' fade={true}>
                {t('Auto_wrap')}
              </Tooltip>
            )}
          </div>
          <div className="sdoc-code-block-hover-operation-divider"></div>
          <div id='sdoc_code_block_copy' className="sdoc-code-block-hover-operation-item">
            <div role="button" className="op-item" onClick={onCopyCodeBlock}>
              <i className='sdocfont sdoc-copy icon-font'></i>
            </div>
            {isShowTooltip && (
              <Tooltip target='sdoc_code_block_copy' placement='top' fade={true}>
                {t('Copy')}
              </Tooltip>
            )}
          </div>
          <div className="sdoc-code-block-hover-operation-divider"></div>
          <div id='sdoc_code_block_delete' className="sdoc-code-block-hover-operation-item">
            <div role="button" className="op-item" onClick={onDelete}>
              <i className='sdocfont sdoc-delete icon-font'></i>
            </div>
            {isShowTooltip && (
              <Tooltip target='sdoc_code_block_delete' placement='top' fade={true}>
                {t('Delete')}
              </Tooltip>
            )}
          </div>
          {isShowlangsList && (
            <div className='sdoc-langs-list-container'>
              <div className='sdoc-search-langs'>
                <Input autoFocus placeholder={t('Search_language')} onChange={onChange} onKeyDown={onKeyDown} />
              </div>
              <LangList langsData={langsData} onSelectLang={onSelectLang} selectedLanguageText={selectedLanguageText} selectedIndex={selectedIndex} ref={langRefs} />
            </div>
          )}
        </div>
      </div>
    </ElementPopover>
  );
};

CodeBlockHoverMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(CodeBlockHoverMenu);
