import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import { useSlateStatic } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import PropTypes from 'prop-types';
import toaster from '../../../components/toast';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';
import { ElementPopover } from '../../commons';
import DropdownMenuItem from '../../commons/dropdown-menu-item';
import { HEADER1, HEADER2, HEADER3, INSERT_POSITION, SIDE_INSERT_MENUS_SEARCH_MAP, SIDE_TRANSFORM_MENUS_SEARCH_MAP, SIDE_OTHER_OPERATIONS_MENUS_SEARCH_MAP } from '../../constants';
import { AIDropdownMenu } from '../../plugins/ai/ai-menu';
import { onCopyNode, onDeleteNode, isNotSupportTransform, onSetNodeType, getTransformMenusConfig, getSearchedOperations } from './helpers';
import InsertBelowMenu from './insert-below-menu';
import InsertBlockMenu from './insert-block-menu';
import TransformMenus from './transform-menus';

import './side-menu.css';

const SideMenu = forwardRef(({ slateNode, isNodeEmpty, menuPosition, onReset }, ref) => {
  const { t } = useTranslation('sdoc-editor');
  const sideMenuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState('');
  const [insertMenuSearchMap, setInsertMenuSearchMap] = useState();
  const [transformMenuSearchMap, setTransformMenuSearchMap] = useState(SIDE_TRANSFORM_MENUS_SEARCH_MAP);
  const [insertBelowMenuSearchMap, setInsertBelowMenuSearchMap] = useState(SIDE_INSERT_MENUS_SEARCH_MAP);
  const [otherOperatonsMenuSearchMap, setOtherOperatonsMenuSearchMap] = useState(SIDE_OTHER_OPERATIONS_MENUS_SEARCH_MAP);
  const editor = useSlateStatic();
  const enableSeafileAI = context.getSetting('enableSeafileAI');

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeChange = eventBus.subscribe('change', onReset);
    return unsubscribeChange;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopy = useCallback(() => {
    onCopyNode(editor, slateNode);
    onReset();
  }, [editor, onReset, slateNode]);

  const onCut = useCallback(() => {
    onCopyNode(editor, slateNode);
    onDeleteNode(editor, slateNode);
    onReset();
  }, [editor, onReset, slateNode]);

  const onDelete = useCallback(() => {
    onDeleteNode(editor, slateNode);
    onReset();
  }, [editor, onReset, slateNode]);

  const onCopyHeaderLink = useCallback(() => {
    const serviceUrl = context.getSetting('serviceUrl');
    const sdocUuid = context.getSetting('docUuid');
    const href = serviceUrl + `/smart-link/${sdocUuid}/#${slateNode.id}`;
    copy(href);
    toaster.success(t('Copied'), { hasCloseButton: false, duration: 2 });
    onReset();
  }, [onReset, slateNode.id, t]);

  const onUpdateMenuLocation = useCallback(() => {
    let top = menuPosition.top;
    let left = menuPosition.left;
    if (sideMenuRef.current) {
      const overflowY = menuPosition.top + sideMenuRef.current.offsetHeight - document.body.clientHeight;
      if (overflowY > 0) {
        top = menuPosition.top - overflowY - 10;
      }
      const overflowX = menuPosition.left - sideMenuRef.current.offsetWidth;
      if (overflowX < 0) {
        left = sideMenuRef.current.offsetWidth + 10;
      }
    }
    setMenuStyle(`top: ${top}px; left: ${left}px`);
  }, [menuPosition.left, menuPosition.top]);

  useEffect(() => {
    onUpdateMenuLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuPosition, sideMenuRef.current]);

  useImperativeHandle(ref,
    () => {
      return {
        sideMenuDom: sideMenuRef.current,
      };
    }
    , []);

  const onSetType = useCallback((newType) => {
    onSetNodeType(editor, slateNode, newType);
    onReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback((e) => {
    if (!sideMenuRef.current.isInputtingChinese) {

      if (isNodeEmpty) {
        const newMenuSearchMap = getSearchedOperations(SIDE_INSERT_MENUS_SEARCH_MAP, isNodeEmpty, e, t, editor);
        setInsertMenuSearchMap(newMenuSearchMap);
      }

      if (!isNodeEmpty) {
        const newTransformMenuSearchMap = getSearchedOperations(SIDE_TRANSFORM_MENUS_SEARCH_MAP, isNodeEmpty, e, t, editor);
        const newInsertBelowMenuSearchMap = getSearchedOperations(SIDE_INSERT_MENUS_SEARCH_MAP, isNodeEmpty, e, t, editor);
        const newOtherOperationsMenuSearchMap = getSearchedOperations(SIDE_OTHER_OPERATIONS_MENUS_SEARCH_MAP, isNodeEmpty, e, t, editor);
        setTransformMenuSearchMap(newTransformMenuSearchMap);
        setInsertBelowMenuSearchMap(newInsertBelowMenuSearchMap);
        setOtherOperatonsMenuSearchMap(newOtherOperationsMenuSearchMap);

        queueMicrotask(() => {
          // Search content exceeds original height, The original container height is 249
          if (sideMenuRef.current?.offsetHeight > 249) {
            onUpdateMenuLocation();
          }
        });
      }
    }
  }, [isNodeEmpty, t, onUpdateMenuLocation, editor]);

  const onCompositionStart = useCallback(() => {
    sideMenuRef.current.isInputtingChinese = true;
  }, []);

  const onCompositionEnd = useCallback((e) => {
    sideMenuRef.current.isInputtingChinese = false;
    onChange(e);
  }, [onChange]);

  const isDisplayCategoryTitle = useCallback((sourceMap, targetMap) => {
    const keys = Object.keys(sourceMap);
    if (keys.length > 1) {
      const index = keys.findIndex(key => key !== 'searching' && sourceMap[key] === targetMap[key]);
      return index !== -1 ? true : false;
    }
    return false;
  }, []);

  return (
    <ElementPopover className='sdoc-side-menu-popover' style={menuStyle}>
      <div className='sdoc-side-menu sdoc-dropdown-menu' ref={sideMenuRef}>
        <div className='sdoc-side-menu-search-wrapper'>
          <Input
            autoFocus
            placeholder={t('Search_action')}
            onChange={onChange}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
          />
        </div>
        {isNodeEmpty && (
          <div id="sdoc-side-menu-insert-wrapper" className='sdoc-side-menu-insert-wrapper'>
            <InsertBlockMenu isNodeEmpty={isNodeEmpty} slateNode={slateNode} insertMenuSearchMap={insertMenuSearchMap} />
          </div>
        )}
        {!isNodeEmpty && (
          <>
            {/* transform menu */}
            {transformMenuSearchMap['searching'] && isDisplayCategoryTitle(transformMenuSearchMap, insertBelowMenuSearchMap) && (
              <DropdownMenuItem menuConfig={{ text: 'Transform_to' }} className="pr-2 sdoc-dropdown-menu-item-title"></DropdownMenuItem>
            )}
            {transformMenuSearchMap['searching'] && getTransformMenusConfig(editor, slateNode).map((item) => {
              return (
                <DropdownMenuItem isHidden={!transformMenuSearchMap[item.type]} key={item.id} menuConfig={item} onClick={() => onSetType(item.type)} />
              );
            })}
            {!transformMenuSearchMap['searching'] && !isNotSupportTransform(slateNode) && (
              <DropdownMenuItem
                menuConfig={{
                  id: 'sdoc-side-menu-item-transform',
                  text: 'Transform_to',
                  iconClass: 'sdocfont sdoc-table-of-content'
                }}
                className="pr-2"
              >
                <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
                <TransformMenus target='sdoc-side-menu-item-transform' slateNode={slateNode} editor={editor} onSetType={onSetType} />
              </DropdownMenuItem>
            )}

            {/* insert below menu */}
            {insertBelowMenuSearchMap['searching'] && isDisplayCategoryTitle(insertBelowMenuSearchMap, transformMenuSearchMap) && (
              <DropdownMenuItem menuConfig={{ text: 'Insert_below' }} className="pr-2 sdoc-dropdown-menu-item-title"></DropdownMenuItem>
            )}
            {insertBelowMenuSearchMap['searching'] && <InsertBlockMenu insertPosition={INSERT_POSITION.AFTER} slateNode={slateNode} insertMenuSearchMap={insertBelowMenuSearchMap} />}
            <DropdownMenuItem
              menuConfig={{
                id: 'sdoc-side-menu-item-insert-below',
                text: 'Insert_below',
                iconClass: 'sdocfont sdoc-insert'
              }}
              className="pr-2 sdoc-dropdown-menu-item-relative"
              isHidden={insertBelowMenuSearchMap['searching']}
            >
              <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
              <InsertBelowMenu target='sdoc-side-menu-item-insert-below' slateNode={slateNode} />
            </DropdownMenuItem>
            {!insertBelowMenuSearchMap['searching'] && <div className="sdoc-dropdown-menu-divider"></div>}

            {/* other operations menu */}
            {[HEADER1, HEADER2, HEADER3].includes(slateNode?.type) && (
              <>
                <DropdownMenuItem
                  menuConfig={{
                    text: 'Copy_link_of_section',
                    iconClass: 'sdocfont sdoc-link'
                  }}
                  onClick={onCopyHeaderLink}
                  isHidden={!otherOperatonsMenuSearchMap['COPY_LINK_OF_SECTION']}
                />
                {!otherOperatonsMenuSearchMap['searching'] && <div className="sdoc-dropdown-menu-divider"></div>}
              </>
            )}
            {enableSeafileAI && <AIDropdownMenu slateNode={slateNode} />}
            <DropdownMenuItem
              menuConfig={{
                text: 'Copy',
                iconClass: 'sdocfont sdoc-copy'
              }}
              onClick={onCopy}
              isHidden={!otherOperatonsMenuSearchMap['COPY']}
            />
            <DropdownMenuItem
              menuConfig={{
                text: 'Cut',
                iconClass: 'sdocfont sdoc-cut'
              }}
              onClick={onCut}
              isHidden={!otherOperatonsMenuSearchMap['CUT']}
            />
            <DropdownMenuItem
              menuConfig={{
                text: 'Delete',
                iconClass: 'sdocfont sdoc-delete'
              }}
              onClick={onDelete}
              isHidden={!otherOperatonsMenuSearchMap['DELETE']}
            />
            {transformMenuSearchMap['searching'] && Object.keys({ ...transformMenuSearchMap, ...insertBelowMenuSearchMap, ...otherOperatonsMenuSearchMap }).length === 1 && (
              <div className='sdoc-dropdown-menu-item-no-results'>{t('No_results')}</div>
            )}
          </>
        )}
      </div>
    </ElementPopover>
  );
});

SideMenu.propTypes = {
  slateNode: PropTypes.object,
  isNodeEmpty: PropTypes.bool,
  menuPosition: PropTypes.object,
  onReset: PropTypes.func,
  t: PropTypes.func,
};

export default SideMenu;
