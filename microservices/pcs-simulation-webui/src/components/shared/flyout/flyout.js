// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

import './flyout.scss';

export const Flyout = ({ className, children }) => (
  <div className={joinClasses('flyout-container', className)}>
    { children }
  </div>
);
