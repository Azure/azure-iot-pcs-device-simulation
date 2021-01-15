// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { svgs } from 'utilities';
import { Btn, Modal, Svg } from 'components/shared';
import { WelcomeTile } from './welcomeTile';

import './welcomeModal.scss';

export class WelcomeModal extends Component {
  constructor(props) {
    super(props);

    const { cookies } = props.cookies;
    this.state = {
      isChecked: cookies.openWelcomeModal === "false"
    }
  }

  toggleCheckBox = () => {
    this.setState(
      { isChecked: !this.state.isChecked },
      () => this.props.cookies.set('openWelcomeModal', !this.state.isChecked, { path: '/' })
    );
  }

  render() {
    const { t, onClose, preprovisionedIoTHub } = this.props;
    const defaultSimulationTile = preprovisionedIoTHub
      ? {
          title: t('getStarted.sampleSimulation.title'),
          description: t('getStarted.sampleSimulation.description'),
          imgPath: svgs.sampleSimulation,
          link: {
            pathname: '/simulations/1',
            state: {}
          },
          btnName: t('getStarted.sampleSimulation.btnName'),
          onClick: onClose
        }
      : {
          title: t('getStarted.sampleDevices.title'),
          description: t('getStarted.sampleDevices.description'),
          imgPath: svgs.sampleSimulation,
          link: {
            pathname: '/simulations/',
            state: { flyoutOpen: 'new-simulation' }
          },
          btnName: t('getStarted.sampleDevices.btnName'),
          onClick: onClose
        };

    return (
      <Modal onClose={onClose}>
        <div className="welcome-modal-container">
          <div className="welcome-modal-header">
            <div className="title-container">
              <Svg path={svgs.rocket} className="rocket-icon" />
              { t('getStarted.title') }
            </div>
            <Btn svg={svgs.x} className="modal-icon" onClick={onClose} />
          </div>
          <div className="welcome-modal-description">
            { t('getStarted.description') }
          </div>
          <div className="welcome-modal-content">
            {
              [
                defaultSimulationTile,
                {
                  title: t('getStarted.customDevices.title'),
                  description: t('getStarted.customDevices.description'),
                  imgPath: svgs.customDeviceModel,
                  link: {
                    pathname: '/deviceModels',
                    state: {
                      flyoutOpen: 'new-device-model',
                      isBasic: true
                    }
                  },
                  btnName: t('getStarted.customDevices.btnName'),
                  onClick: onClose
                },
                {
                  title: t('getStarted.advancedDevices.title'),
                  description: t('getStarted.advancedDevices.description'),
                  imgPath: svgs.advancedDeviceModel,
                  link: {
                    pathname: '/deviceModels',
                    state: {
                      flyoutOpen: 'new-device-model',
                      isBasic: false
                    }
                  },
                  btnName: t('getStarted.advancedDevices.btnName'),
                  onClick: onClose
                }
              ].map((item, idx) => <WelcomeTile key={`welcome-model-tile-${idx}`} {...item} />)
            }
          </div>
          <div className="welcome-modal-footer">
            <div className="checkbox-container" onClick={this.toggleCheckBox}>
              { t('getStarted.doNotShownAgain') }
              <input
                type="checkbox"
                name="isChecked"
                onChange={this.toggleCheckBox}
                checked={this.state.isChecked} />
              <span className="checkmark"></span>
            </div>
            <div className="find-me">{ t('getStarted.findMe') }</div>
          </div>
        </div>
      </Modal>
    );
  }
}
