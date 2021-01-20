// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import './modal.scss';

export class Modal extends Component {

  componentDidMount() {
    if (this.props.onClose) {
      window.addEventListener('keydown', this.listenKeyboard, true);
    }
  }

  componentWillUnmount() {
    if (this.props.onClose) {
      window.removeEventListener('keydown', this.listenKeyboard, true);
    }
  }

  listenKeyboard = (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.props.onClose();
    }
  }

  onOverlayClick = () => {
    this.props.onClose();
  }

  onDialogClick = (event) => {
    event.stopPropagation();
  }

  render() {
    return  (
      <div className="modal-container">
        <div className="modal-overlay" />
        <div className="modal-content" onClick={this.onOverlayClick}>
          <div className="modal-dialog" onClick={this.onDialogClick}>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}
