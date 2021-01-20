// Copyright (c) Microsoft. All rights reserved.

import { withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { AuthService } from 'services';
import { epics as appEpics } from 'store/reducers/appReducer';
import { getPreprovisionedIoTHub } from 'store/reducers/simulationReducer';
import App from './app';

// Pass the simulation status
const mapStateToProps = state => ({
  preprovisionedIoTHub: getPreprovisionedIoTHub(state),
});

// Wrap with the router and wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  registerRouteEvent: pathname => dispatch(appEpics.actions.detectRouteChange(pathname)),
  logout: () => AuthService.logout()
});

const AppContainer = withCookies(withRouter(withNamespaces()(connect(mapStateToProps, mapDispatchToProps)(App))));

export default AppContainer;
