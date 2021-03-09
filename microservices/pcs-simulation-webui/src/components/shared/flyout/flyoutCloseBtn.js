// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Btn } from '../forms/btn';
import { svgs } from '../../../utilities';

export const FlyoutCloseBtn = (props) => (
  <Btn {...props} svg={svgs.cancelX} className="flyout-close-btn" />
);
