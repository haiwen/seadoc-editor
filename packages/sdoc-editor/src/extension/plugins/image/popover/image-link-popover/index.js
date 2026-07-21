import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'reactstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { WIKI_EDITOR } from '../../../../../constants';
import context from '../../../../../context';
import { getWikiPageLinkOptions, isValidWebUrl } from './helpers';

import './index.css';

const ImageLinkPopover = ({ editor, href = '', linkedPageId = '', linkedWikiId = '', onRemove, onSelectPage, onSubmit }) => {
  const { t } = useTranslation('sdoc-editor');
  const isWiki = editor.editorType === WIKI_EDITOR;
  const currentWikiId = context.getSetting('wikiId');
  const isCurrentWikiPageLink = isWiki && linkedWikiId === currentWikiId && Boolean(linkedPageId);
  const [url, setUrl] = useState(isCurrentWikiPageLink ? '' : href);
  const resultsRef = useRef(null);
  const hasLink = Boolean(href);
  const isValidUrl = isValidWebUrl(url);
  const wikiPages = useMemo(() => isWiki ? context.getSetting('navConfig')?.pages || [] : [], [isWiki]);
  const { linkedPage, pageResults, hasPageMatch } = useMemo(
    () => getWikiPageLinkOptions(wikiPages, url, isCurrentWikiPageLink ? linkedPageId : ''),
    [isCurrentWikiPageLink, linkedPageId, url, wikiPages]
  );
  const showNoPageResults = isWiki && Boolean(url) && !isValidUrl && !hasPageMatch;
  const showResults = hasLink || Boolean(linkedPage) || pageResults.length > 0 || showNoPageResults;

  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }, [url]);

  const submit = useCallback(() => {
    if (!isValidUrl) return;
    onSubmit(url.trim());
  }, [isValidUrl, onSubmit, url]);

  const onKeyDown = useCallback((event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    submit();
  }, [submit]);

  return (
    <div
      className='sdoc-image-link-popover sdoc-popover-box-shadow'
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className='sdoc-image-link-input-row'>
        <div className='sdoc-image-link-input-wrapper'>
          <label htmlFor='sdoc-image-link-input'>
            {isWiki
              ? `${t(hasLink ? 'Edit_link' : 'Insert_link')} / ${t('Page')}`
              : t(hasLink ? 'Edit_link' : 'Insert_link')}
          </label>
          <input
            autoFocus
            id='sdoc-image-link-input'
            className='form-control sdoc-image-link-input'
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder='https://example.com'
            type={isWiki ? 'text' : 'url'}
            value={url}
          />
        </div>
        <Button className='sdoc-image-link-submit' color='primary' disabled={!isValidUrl} onClick={submit}>
          {t('Submit')}
        </Button>
      </div>

      {showResults && (
        <div className='sdoc-image-link-results' ref={resultsRef}>
          {hasLink && (
            <button className='sdoc-image-link-result is-remove' onClick={onRemove} type='button'>
              <span className='sdoc-image-link-result-icon'><i className='sdocfont sdoc-unlink'/></span>
              <span className='sdoc-image-link-result-content'>
                <span className='sdoc-image-link-result-name'>{t('Remove_link')}</span>
              </span>
            </button>
          )}
          {isWiki && linkedPage && (
            <div
              className='sdoc-image-link-result is-active'
            >
              <span className='sdoc-image-link-result-icon'>
                {linkedPage?.icon || <i className={classNames('sdocfont', linkedPage?.isDir ? 'sdoc-wiki-files' : 'sdoc-wiki-file')}/>}
              </span>
              <span className='sdoc-image-link-result-content'>
                <span className='sdoc-image-link-result-name'>{linkedPage.name}</span>
              </span>
            </div>
          )}
          {isWiki && pageResults.length > 0 && (
            <>
              <div className='sdoc-image-link-results-title'>{t('Link_to_page')}</div>
              {pageResults.map((page) => (
                <button
                  className='sdoc-image-link-result'
                  key={page.id}
                  onClick={() => onSelectPage(page.id, currentWikiId)}
                  type='button'
                >
                  <span className='sdoc-image-link-result-icon'>
                    {page.icon || <i className={classNames('sdocfont', page.isDir ? 'sdoc-wiki-files' : 'sdoc-wiki-file')}/>}
                  </span>
                  <span className='sdoc-image-link-result-content'>
                    <span className='sdoc-image-link-result-name'>{page.name}</span>
                  </span>
                </button>
              ))}
            </>
          )}
          {showNoPageResults && (
            <div className='sdoc-image-link-no-results'>{t('No_page_results')}</div>
          )}
        </div>
      )}
    </div>
  );
};

ImageLinkPopover.propTypes = {
  editor: PropTypes.object.isRequired,
  href: PropTypes.string,
  linkedPageId: PropTypes.string,
  linkedWikiId: PropTypes.string,
  onRemove: PropTypes.func.isRequired,
  onSelectPage: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ImageLinkPopover;
