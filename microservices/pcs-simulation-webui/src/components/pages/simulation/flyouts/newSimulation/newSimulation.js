// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import Flyout from 'components/shared/flyout';
import SimulationForm from '../../views/simulationForm';

export const NewSimulation = (props) => (
  <Flyout.Container>
    <Flyout.Header>
      <Flyout.Title>
        {props.t('simulation.simSetup')}
      </Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      <SimulationForm {...props} />
    </Flyout.Content>
  </Flyout.Container>
);
