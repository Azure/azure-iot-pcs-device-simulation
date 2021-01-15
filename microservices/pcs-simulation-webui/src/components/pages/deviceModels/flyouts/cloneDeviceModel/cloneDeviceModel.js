// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { svgs } from 'utilities';
import Flyout from 'components/shared/flyout';
import { Svg } from 'components/shared';
import DeviceModelForm from '../views/deviceModelForm';

export const CloneDeviceModel = (props) => (
  <Flyout.Container className="device-model-flyout-container">
    <Flyout.Header>
      <Flyout.Title>
        <Svg path={svgs.copy} className="flyout-title-icon" />
        {props.t('deviceModels.flyouts.clone.title')}
      </Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      <DeviceModelForm {...props} />
    </Flyout.Content>
  </Flyout.Container>
);
