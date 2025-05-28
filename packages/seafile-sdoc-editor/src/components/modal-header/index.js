import React from 'react';
import { ModalHeader } from 'reactstrap';
import './index.css';

export default function SdocModalHeader({ toggle, children }) {
  let close = null;
  if (toggle) {
    close = (
      <span className="sdoc-add-link-close-icon" onClick={toggle}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }
  return (
    <ModalHeader close={close}>
      {children}
    </ModalHeader>
  );
}
