// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Simulation } from './simulation';
import { shallow } from 'enzyme';
import { I18n } from 'react-i18next';

import 'polyfills';

describe('Simulation Component', () => {
  let wrapper;
  const mockProps = {
    simulationList: [{
      eTag: `"2600c470-0000-0000-0000-5a15e4d60000"`,
      name: 'test1',
      id: '1',
      enabled: false,
      startTime: '2017-11-22T00:15:58+00:00',
      endTime: '2017-11-29T00:15:58+00:00',
      stopTime: '2017-11-29T00:15:58+00:00',
      id: '1',
      deviceModels: [
        { Id: 'chiller-01', Count: 100 }
      ],
      statistics: {
        activeDevicesCount: 0,
        averageMessagesPerSecond: 0,
        failedDeviceConnectionsCount: 0,
        failedDeviceTwinUpdatesCount: 0,
        failedMessagesCount: 0,
        simulationErrorsCount: 0,
        totalDevicesCount: undefined,
        totalMessagesSent: undefined
      }
    }],
    deviceModelEntities: {
      'chiller-01': {
        cloudToDeviceMethods: {},
        eTag: '',
        id: 'chiller-01'
      }
    },
    deviceModels: [{
      id: 'chiller-01'
    }],
    error: {},
    preprovisionedIoTHub: {},
    stopSimulation: () => {},
    createSimulation: () => {},
    fetchSimulationList: () => {},
    refresh: () => {},
    // Fake the internationalization
    t: () => ''
  };
  it('Renders without crashing', () => {
    wrapper = shallow(
      <Simulation {...mockProps} />
    );
  });
});
