import React from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';

class CheckListItem extends React.PureComponent {

  onChange = (event) => {
    const { editor, element, readOnly } = this.props;
    if (readOnly) return;

    const checked = event.target.checked;
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { checked }, { at: path });
  };

  render() {
    const { attributes, children, element } = this.props;
    const { id, align, checked = false } = element || {};
    const style = { textAlign: align };
    return (
      <div data-id={id} {...attributes} className={`sdoc-checkbox-container ${attributes.className}`} style={style}>
        <div className='sdoc-checkbox-input-wrapper' >
          <input contentEditable={false} className='sdoc-checkbox-input' type="checkbox" onChange={this.onChange} checked={checked}/>
          <p className='sdoc-checkbox-content-container'>{children}</p>
        </div>

      </div>
    );
  }
}

export const renderCheckListItem = (props, editor) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const readOnly = useReadOnly();
  return <CheckListItem {...props} editor={editor} readOnly={readOnly} />;
};
