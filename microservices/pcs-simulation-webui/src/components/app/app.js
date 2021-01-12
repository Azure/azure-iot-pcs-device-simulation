// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

// App Components
import Header from './header/header';
import Navigation from './navigation/navigation';
import Main from './main/main';
import { PageContent } from 'components/shared';

// Page Components
import  {
  SimulationContainer as SimulationPage,
  DeviceModelsContainer as DeviceModelsPage,
  PageNotFound
} from 'components/pages';

import './app.scss';

const crumbsConfig = [
  {
    path: '/simulations', crumbs: [
      { to: '/simulations', labelId: 'Simulations' }
    ]
  },
  {
    path: '/deviceModels', crumbs: [
      { to: '/devicemodels', labelId: 'Device Models' }
    ]
  }
];

/** The base component for the app */
class App extends Component {

  componentDidMount() {
    const { history, registerRouteEvent } = this.props;
    // Initialize listener to inject the route change event into the epic action stream
    history.listen(({ pathname }) => registerRouteEvent(pathname));
  }

  redirectToSimulation = () => <Redirect to="/simulations" push={true} />;

  render() {
    return (
      <div className="app">
        <Navigation />
        <Main>
          <Header {...this.props} crumbsConfig={crumbsConfig} />
          <PageContent>
            <Switch>
              <Route exact path="/" render={this.redirectToSimulation} />
              <Route path="/simulations" component={SimulationPage} />
              <Route exact path="/devicemodels" component={DeviceModelsPage} />
              <Route component={PageNotFound} />
            </Switch>
          </PageContent>
        </Main>
      </div>
    );
  }

}

export default App;
