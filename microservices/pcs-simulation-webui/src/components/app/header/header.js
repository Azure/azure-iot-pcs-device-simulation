// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { SettingsContainer } from './settingsContainer';
import { Svg } from 'components/shared';
import { svgs, isDef } from 'utilities';
import ProfileImagePath from 'assets/images/profile.png';
import { WelcomeModal } from '../welcomeModal/welcomeModal';
import { Breadcrumbs } from './breadcrumbs';

import './header.scss';

const docsDropdown = 'docsDropdown';
const profileDropdown = 'profileDropdown';

const parentHasClass = (element, ...searchClasses) => {
  if (
    typeof element.className === 'string' &&
    element.className
      .split(' ')
      .some(classname =>
        searchClasses.some(searchClass => searchClass === classname)
      )
  ) return true;
  return element.parentNode && parentHasClass(element.parentNode, ...searchClasses);
};

const docLinks = [
  {
    translationId: 'header.documentation',
    url: 'https://docs.microsoft.com/en-us/azure/iot-accelerators/quickstart-device-simulation-deploy '
  },
  {
    translationId: 'header.sourceCode',
    url: 'https://github.com/Azure/azure-iot-pcs-device-simulation '
  },
  {
    translationId: 'header.sendSuggestion',
    url: 'https://feedback.azure.com/forums/916438-azure-iot-solution-accelerators'
  }
];

const closeModal = { openWelcomeModal: false };

/** The header component for the top of the page */
class Header extends Component {

  constructor(props) {
    super(props);

    this.state = {
      openDropdown: '',
      openWelcomeModal: false
    };
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handleWindowMousedown);
    const { cookies } = this.props.cookies;
    const openWelcomeModal =  !cookies.openWelcomeModal || cookies.openWelcomeModal === "true";
    this.setState({ openWelcomeModal });
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleWindowMousedown);
  }

  handleWindowMousedown = ({ target }) => {
    const isMenuTrigger = parentHasClass(target, 'menu-item', 'menu-trigger');
    if (!isMenuTrigger && this.state.openDropdown !== '') {
      this.setState({ openDropdown: '' });
    }
  }

  logout = () => {
    this.setState({ openDropdown: '' });
    this.props.logout();
  }

  toggleDropdown = (openDropdown) => () => this.setState({ openDropdown });

  openModal = () => this.setState({
    openWelcomeModal: true,
    openDropdown: ''
  });

  closeModal = () => this.setState(closeModal);

  render() {
    const { t, cookies, preprovisionedIoTHub } = this.props;

    return (
      <header className="app-header">
        <div className="breadcrumbs"><Breadcrumbs t={this.props.t} crumbsConfig={this.props.crumbsConfig} /></div>
        <div className="label">{ this.props.t('header.appName') }</div>
        <div className="items-container">
          <div className="menu-container">
            <button className="menu-trigger" onClick={this.toggleDropdown(docsDropdown)}>
              <Svg path={svgs.questionMark} className="item-icon" />
            </button>
            {
              this.state.openDropdown === docsDropdown &&
              <div className="menu">
                <div className="menu-item" onClick={this.openModal}>{ t('getStarted.title') }</div>
                {
                  docLinks.map(({ url, translationId }) =>
                    <Link key={translationId}
                      className="menu-item"
                      target="_blank"
                      to={url}>
                      { t(translationId) }
                    </Link>
                  )
                }
              </div>
            }
          </div>
          <div className="menu-container">
            <button className="item-icon profile menu-trigger" onClick={this.toggleDropdown(profileDropdown)}>
              <img src={ProfileImagePath} alt={ this.props.t('header.logout') } />
            </button>
            {
              this.state.openDropdown === profileDropdown &&
              <div className="profile-dropdown">
                <SettingsContainer />
                <button className="dropdown-item" onClick={this.logout}>
                  { this.props.t('header.logout') }
                </button>
              </div>
            }
          </div>
        </div>
        {
          this.state.openWelcomeModal &&
          isDef(preprovisionedIoTHub) &&
          <WelcomeModal
            onClose={this.closeModal}
            cookies={cookies}
            preprovisionedIoTHub={preprovisionedIoTHub}
            t={t} />
        }
      </header>
    );
  }
};

export default Header;
