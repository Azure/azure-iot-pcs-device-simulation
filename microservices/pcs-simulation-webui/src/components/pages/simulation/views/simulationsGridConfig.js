// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';

import { gridValueFormatters } from 'components/shared/pcsGrid/pcsGridConfig';

const { checkForEmpty } = gridValueFormatters;

/** A collection of column definitions for the device models grid */
export const simulationsColumnDefs = {
  name: {
    headerName: 'simulation.grid.name',
    field: 'name',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  deviceModels: {
    headerName: 'simulation.grid.deviceModels',
    field: 'deviceModels',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  startTime: {
    headerName: 'simulation.grid.startTime',
    field: 'startTime',
    valueFormatter: ({ value }) => checkForEmpty(value),
    sort: 'desc'
  },
  totalDevices: {
    headerName: 'simulation.grid.totalDevices',
    field: 'totalDevices',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  totalMessages: {
    headerName: 'simulation.grid.totalMessages',
    field: 'totalMessages',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  averageMessages: {
    headerName: 'simulation.grid.averageMessages',
    field: 'averageMessages',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  status: {
    headerName: 'simulation.grid.status',
    field: 'status',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  endTime: {
    headerName: 'simulation.grid.endTime',
    field: 'endTime',
    valueFormatter: ({ value }) => checkForEmpty(value)
  },
  duration: {
    headerName: 'simulation.grid.duration',
    field: 'duration',
    valueFormatter: ({ value }) => checkForEmpty(value)
  }
};

/** Given a simulation object, extract and return the device Id */
// export const getSoftSelectId = ({ Id }) => Id;

/** Shared simulations grid AgGrid properties */
export const defaultSimulationsGridProps = {
  enableColResize: false,
  multiSelect: false,
  pagination: true,
  paginationPageSize: Config.paginationPageSize,
  rowSelection: 'single'
};
