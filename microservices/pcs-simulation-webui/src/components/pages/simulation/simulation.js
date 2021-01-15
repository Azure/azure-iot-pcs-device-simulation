// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import SimulationDetails from './views/simulationDetails';
import { SimulationDashboard } from './views/simulationDashboard';

import './simulation.scss';

export class Simulation extends Component {

  render () {
    return (
      <div className="simulation-container">
        <Switch>
          <Route exact path={'/simulations'}
            render={ (routeProps) => <SimulationDashboard {...routeProps} {...this.props} /> } />
          <Route path={'/simulations/:id/:modelId?'}
            render={ (routeProps) => <SimulationDetails {...routeProps} {...this.props} /> } />
        </Switch>
      </div>
    );
  }
}
