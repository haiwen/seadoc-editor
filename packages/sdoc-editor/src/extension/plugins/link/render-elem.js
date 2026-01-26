import React from 'react';
import { Range } from '@seafile/slate';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../constants';
import { ScrollContext } from '../../../hooks/use-scroll-context';
import { isMac } from '../../../utils/common-utils';
import EventBus from '../../../utils/event-bus';
import InlineBugFixer from '../../commons/Inline-bug-fix-wrapper';
import { ELEMENT_TYPE } from '../../constants';
import { getMenuPosition, unWrapLinkNode } from './helpers';
import LinkHover from './hover';

const propTypes = {
  children: PropTypes.array,
  element: PropTypes.object,
  editor: PropTypes.object,
  attributes: PropTypes.object,
};

class Link extends React.Component {

  static contextType = ScrollContext;
  resizeObserver = null;

  constructor(props) {
    super(props);
    this.state = {
      isShowLinkMenu: false,
      menuPosition: null,
    };
    this.eventBus = EventBus.getInstance();
  }

  componentWillUnmount() {
    this.unregisterEventHandle();
  }

  registerEventHandle = () => {
    document.addEventListener('click', this.onHideLinkMenu);
    const { scrollRef } = this.context;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', this.onScroll);

      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          this.onScroll();
        }
      });
      this.resizeObserver.observe(scrollRef.current);
    }
  };

  unregisterEventHandle = () => {
    document.removeEventListener('click', this.onHideLinkMenu);
    const { scrollRef } = this.context;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', this.onScroll);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  };

  onHideLinkMenu = () => {
    this.setState({ isShowLinkMenu: false }, () => {
      this.unregisterEventHandle();
    });
  };

  onScroll = (e) => {
    this.setPosition(this.linkRef);
  };

  setPosition = (element) => {
    const { editor } = this.props;
    const menuPosition = getMenuPosition(element, editor);
    this.setState({ menuPosition });
  };

  onLinkClick = (e) => {
    const isModClick = isMac() ? e.metaKey : e.ctrlKey;
    const { linked_id, linked_wiki_page_id, href } = this.props.element;
    // mod + click
    if (isModClick && !linked_id && !linked_wiki_page_id) {
      window.open(href, '_blank', 'noreferrer');
      return;
    }
    // mod + click on linked wiki page
    if (isModClick && linked_wiki_page_id) {
      const { href } = window.location;

      const parts = href.split('/');
      parts[parts.length - 2] = linked_wiki_page_id;
      const newHref = parts.join('/');
      window.open(newHref, '_blank', 'noreferrer');
      return;
    }

    this.setPosition(e.target);
    this.setState({ isShowLinkMenu: true });
    setTimeout(() => {
      this.registerEventHandle();
    }, 0);
  };

  deleteLink = (event) => {
    event.stopPropagation();
    const { editor } = this.props;
    unWrapLinkNode(editor);
  };

  openDialog = () => {
    const { element } = this.props;
    this.eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, element });
  };

  setRef = (ref) => {
    this.linkRef = ref;
  };

  render() {
    const { attributes, children, element, editor, readonly } = this.props;
    const { isShowLinkMenu, menuPosition } = this.state;
    const className = isShowLinkMenu ? 'seafile-ed-hovermenu-mouseclick' : null;

    if (readonly) {
      return (
        <span className={classnames(className, 'virtual-link')} {...attributes}>
          <a href={element.href} title={element.children[0]?.text} target='_blank' rel="noreferrer">{children}</a>
        </span>
      );
    }

    return (
      <>
        <span className={className} {...attributes} onClick={this.onLinkClick}>
          <span ref={this.setRef} className='virtual-link' title={element.children[0]?.text}>
            <InlineBugFixer />
            {children}
            <InlineBugFixer />
          </span>
        </span>
        {(isShowLinkMenu && (this.props.readonly || Range.isCollapsed(editor.selection)) &&
          <LinkHover editor={editor} menuPosition={menuPosition} element={element} onDeleteLink={this.deleteLink} onEditLink={this.openDialog} />
        )}
      </>
    );
  }
}

Link.propTypes = propTypes;

const renderLink = (props, editor, readonly) => {
  return <Link {...props} editor={editor} readonly={readonly} />;
};

export default renderLink;
