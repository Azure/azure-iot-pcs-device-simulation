// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import './settings.scss';

/** The settings component */
class Settings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      diagnosticsOptOutChecked: !((this.props || {}).settings || {}).diagnosticsOptOut
    };
  }

  componentWillReceiveProps(nextProps) {
    const { settings: {diagnosticsOptOut} } = nextProps;
    this.setState({ diagnosticsOptOutChecked: !diagnosticsOptOut });
  }

  toggleCheckbox = () => {
    this.setState({ diagnosticsOptOutChecked: !this.state.diagnosticsOptOutChecked },
      () => this.props.updateSolutionSettings({
        ...this.props.settings,
        diagnosticsOptOut: !this.state.diagnosticsOptOutChecked
      })
    );
  };

  render() {
    return (
      <div className="consent">
        <h2 className="dropdown-item">{ this.props.t('header.sendDiagnosticsHeader') }</h2>
        <label className="dropdown-item">{ this.props.t('header.sendDiagnosticsText') }</label><br/>
        <a className="dropdown-item" href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">{ this.props.t('header.sendDiagnosticsMicrosoftPrivacyUrl') }</a><br/><br/>
        <input type="checkbox" className="dropdown-item" checked={this.state.diagnosticsOptOutChecked} onChange={this.toggleCheckbox}/>
        <label className="dropdown-item">{ this.props.t('header.sendDiagnosticsCheckbox') }</label>
      </div>
    );
  }
};

export default Settings;
