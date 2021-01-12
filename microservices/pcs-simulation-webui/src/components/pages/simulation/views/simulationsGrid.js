// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { PcsGrid } from 'components/shared';
import { simulationsColumnDefs, defaultSimulationsGridProps } from './simulationsGridConfig';
import { isFunc, translateColumnDefs } from 'utilities';

/**
 * A grid for displaying list of simulations
 *
 * Encapsulates the PcsGrid props
 */
export class SimulationsGrid extends Component {
  constructor(props) {
    super(props);

    // Default device grid columns
    this.columnDefs = [
      { ...simulationsColumnDefs.name },
      simulationsColumnDefs.deviceModels,
      simulationsColumnDefs.startTime,
      simulationsColumnDefs.totalDevices,
      simulationsColumnDefs.totalMessages,
      simulationsColumnDefs.averageMessages,
      simulationsColumnDefs.status,
      simulationsColumnDefs.endTime,
      simulationsColumnDefs.duration
    ];
  }

  /**
   * Get the grid api options
   *
   * @param {Object} gridReadyEvent An object containing access to the grid APIs
   */
  onGridReady = gridReadyEvent => {
    this.simulationsGridApi = gridReadyEvent.api;
    gridReadyEvent.api.sizeColumnsToFit();
    // Call the onReady props if it exists
    if (isFunc(this.props.onGridReady)) {
      this.props.onGridReady(gridReadyEvent);
    }
  };

  /**
   * Handles soft select props method
   */
  onSoftSelectChange = (simulation, rowEvent) => {
    const { onSoftSelectChange } = this.props;

    if (isFunc(onSoftSelectChange)) {
      onSoftSelectChange(simulation, rowEvent);
    }
  }

  render() {
    const { t } = this.props;
    const gridProps = {
      /* Grid Properties */
      ...defaultSimulationsGridProps,
      columnDefs: translateColumnDefs(this.props.t, this.columnDefs),
      onRowDoubleClicked: ({ node }) => node.setSelected(!node.isSelected()),
      ...this.props, // Allow default property overrides
      context: { t },
      /* Grid Events */
      onGridReady: this.onGridReady,
      onSoftSelectChange: this.onSoftSelectChange,
    };
    return (
      <PcsGrid {...gridProps} key="simulation-grid-key" />
    );
  }
}
