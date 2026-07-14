import React from 'react';
import classNames from 'classnames';
import { HEADER_OUTLINE_WIDTH_MAPPING } from '../constants';
import { ADDED_STYLE, DELETED_STYLE } from '../extension/constants';
import { expandCollapsedHeaderAncestors } from '../extension/plugins/header/helpers';

class OutlineItem extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isHighlighted: false
    };
  }

  onItemClick = () => {
    const { item, editor, itemPath } = this.props;
    const { id } = item;

    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView();
    };

    const isExpanded = editor ? expandCollapsedHeaderAncestors(editor, item, itemPath) : false;
    if (!isExpanded) {
      scrollToTarget();
      return;
    }

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(scrollToTarget);
      return;
    }

    setTimeout(scrollToTarget, 0);
  };

  onMouseOver = () => {
    this.setState({ isHighlighted: true });
  };

  onMouseOut = () => {
    this.setState({ isHighlighted: false });
  };

  getOutlineItemClass = () => {
    const { isHighlighted } = this.state;
    const { item, isDisplayHorizontalBar } = this.props;
    const { type, isActive } = item;
    let outlineItemClass = null;

    outlineItemClass = classNames('sdoc-outline-item', {
      'pl-5': type === 'header2',
      'pl-7': type === 'header3',
      'active': isHighlighted,
      'wiki-outline-active': isActive
    });

    if (isDisplayHorizontalBar) {
      outlineItemClass = classNames('sdoc-outline-item', {
        'pl-1': type === 'header2',
        'pl-2': type === 'header3',
        'active': isHighlighted,
      });
    }
    return outlineItemClass;
  };

  render() {
    const { item, isDisplayHorizontalBar, isSdocRevision } = this.props;
    const { type, children, isActive } = item;
    const outlineItemClass = this.getOutlineItemClass();

    if (isDisplayHorizontalBar) {
      return (
        <div className={outlineItemClass}>
          <div className={classNames('wiki-outline-context', { 'active': isActive })} style={{ width: HEADER_OUTLINE_WIDTH_MAPPING[type] }}/>
        </div>
      );
    }

    return (
      <div
        className={outlineItemClass}
        onClick={this.onItemClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        {!isSdocRevision && children.map(child => child.text || child.title).join('')}
        {isSdocRevision && children.map(child => {
          const text = child.text || child.title;
          const style = {
            ...(child.add && ADDED_STYLE),
            ...(child.delete && DELETED_STYLE),
            backgroundColor: child.computed_background_color || undefined
          };
          const key = child.id;
          const content = (
            <span style={style} key={key}>
              {text}
            </span>
          );

          return child.delete ? <del key={key}>{content}</del> : content;
        })}
      </div>
    );
  }
}

export default OutlineItem;
