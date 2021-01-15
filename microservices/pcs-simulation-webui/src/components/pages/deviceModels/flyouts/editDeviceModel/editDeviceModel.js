// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { svgs } from 'utilities';
import Flyout from 'components/shared/flyout';
import DeviceModelForm from '../views/deviceModelForm';
import DeviceModelUploadForm from '../views/deviceModelUploadForm';
import { Svg } from 'components/shared';

export const EditDeviceModel = (props) => (
  <Flyout.Container className="device-model-flyout-container">
    <Flyout.Header>
      <Flyout.Title>
        <Svg path={svgs.edit} className="flyout-title-icon" />
        {props.t('deviceModels.flyouts.edit.title')}
      </Flyout.Title>
      <Flyout.CloseBtn onClick={props.onClose} />
    </Flyout.Header>
    <Flyout.Content >
      {
        props.isBasic
          ? <DeviceModelForm {...props} />
          : <DeviceModelUploadForm {...props} />
      }
    </Flyout.Content>
  </Flyout.Container>
);
