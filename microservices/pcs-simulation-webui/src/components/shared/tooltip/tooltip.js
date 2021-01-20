// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import './tooltip.scss';

export class Tooltip extends Component {
  constructor(props) {
    super(props)

    this.state = {
      displayTooltip: false
    }
  }

  hideTooltip = () => this.setState({ displayTooltip: false });

  showTooltip = () => this.setState({ displayTooltip: true });

  render() {
    const { message, position } = this.props;

    return (
      <span className='tooltip' onMouseLeave={this.hideTooltip}>
        {
          this.state.displayTooltip &&
          <div className={`tooltip-bubble tooltip-${position}`}>
            <div className='tooltip-message'>{message}</div>
          </div>
        }
        <span className='tooltip-trigger' onMouseOver={this.showTooltip}>
          {this.props.children}
        </span>
      </span>
    )
  }
}
