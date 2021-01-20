// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import Config from 'app.config';
import { Observable } from 'rxjs';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import configureStore from 'store/configureStore';
import diagnosticsEvent from 'store/logEventUtil';
import AppContainer from 'components/app/app.container';
import registerServiceWorker from 'registerServiceWorker';
import { AuthService } from 'services';
import { epics as appEpics } from 'store/reducers/appReducer';

// Initialize internationalization
import './i18n';

// Include cross browser polyfills
import './polyfills';

// Include base page css
import './index.scss';

// Initialize the user authentication
AuthService.onLoad(() => {
  // Create the redux store and redux-observable streams
  const store = configureStore();

  // Creating variables for Session Management
  let logSessionStart = true;

  // Initialize the app redux data
  store.dispatch(appEpics.actions.initializeApp());

  const userActivityEvents = ['mousemove', 'keydown']; // The list of all window events that would constitute user activity
  Observable.from(userActivityEvents)
    .flatMap(event => Observable.fromEvent(window, event))
    .map(_ => {
      if (logSessionStart === true) {
        const sessionStartEvent = diagnosticsEvent('SessionStart', {});
        store.dispatch(appEpics.actions.updateSession(true))
        store.dispatch(appEpics.actions.logEvent(sessionStartEvent))
        logSessionStart = false;
      }

      return Observable.empty()
    })
    .debounceTime(Config.sessionTimeout)
    .subscribe(() => {
      logSessionStart = true;
      return Observable.empty()
  });


  // Create the React app
  ReactDOM.render(
    <CookiesProvider>
      <Provider store={store}>
        <Router>
          <AppContainer />
        </Router>
      </Provider>
    </CookiesProvider>,
    document.getElementById('root')
  );

  registerServiceWorker();
});
