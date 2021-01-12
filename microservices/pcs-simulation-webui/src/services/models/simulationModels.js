// Copyright (c) Microsoft. All rights reserved.
import Config from 'app.config';
import { stringToBoolean } from 'utilities';

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationRunning: stringToBoolean((response.Properties || {}).SimulationRunning),
  preprovisionedIoTHub: stringToBoolean((response.Properties || {}).PreprovisionedIoTHub),
});

export const toSimulationModel = (response = {}) => ({
  eTag: response.ETag,
  enabled: response.Enabled,
  isRunning: response.Running,
  isActive: response.ActiveNow,
  startTime: response.StartTime,
  endTime: response.EndTime,
  stopTime: response.StoppedTime,
  id: response.Id,
  name: response.Name,
  description: response.Description,
  statistics: {
    averageMessagesPerSecond: (response.Statistics || {}).AverageMessagesPerSecond,
    totalMessagesSent: (response.Statistics || {}).TotalMessagesSent,
    failedMessagesCount: (response.Statistics || {}).FailedMessagesCount,
    totalDevicesCount: (response.Statistics || {}).TotalDevicesCount,
    activeDevicesCount: (response.Statistics || {}).ActiveDevicesCount,
    failedDeviceConnectionsCount: (response.Statistics || {}).FailedDeviceConnectionsCount,
    failedDeviceTwinUpdatesCount: (response.Statistics || {}).FailedDeviceTwinUpdatesCount,
    simulationErrorsCount: (response.Statistics || {}).SimulationErrorsCount
  },
  deviceModels: (response.DeviceModels || []).map(({ Id, Count, Override }) => ({
    id: Id,
    count: Count,
    interval: ((Override || {}).Simulation || {}).Interval,
    sensors: (((Override || {}).Simulation || {}).Scripts || [])
      .map(({ Params, Path, Type }) => Object.keys(Params || {}).map(key => {
        const { Max, Min, Step, Unit } = Params[key];
        const [, path] = Path.split('.');
        return {
          name: key,
          min: Min,
          max: Max,
          step: Step,
          unit: Unit,
          path: mapToBehavior(path),
          type: Type
        }
      }))
      .reduce((acc, obj) => [...acc, ...obj], [])
  })),
  iotHubs: (response.IoTHubs || []).map(({ ConnectionString, PreprovisionedIoTHub, PreprovisionedIoTHubInUse, PreprovisionedIoTHubMetricsUrl, Sku }) => ({
    connectionString: ConnectionString === 'default' ? '' : ConnectionString,
    preprovisionedIoTHub: PreprovisionedIoTHub,
    preprovisionedIoTHubInUse: ConnectionString === 'default',
    preprovisionedIoTHubMetricsUrl: PreprovisionedIoTHubMetricsUrl
  })),
  rateLimits: {
    deviceMessagesPerSecond: (response.RateLimits || {}).DeviceMessagesPerSecond
  },
  devicesDeletionRequired: response.DeleteDevicesWhenSimulationEnds,
  deleteDevicesOnce: response.DeleteDevicesOnce,
  devicesDeletionCompleted: response.DevicesDeletionComplete
});

export const toSimulationListModel = (response = {}) => (response.Items || []).map(toSimulationModel);

const mapToBehavior = path => {
  switch (path) {
    case 'Increasing':
      return 'Increment';
    case 'Decreasing':
      return 'Decrement';
    default:
      return path;
  }
}

// Request models
export const toSimulationRequestModel = (request = {}) => ({
  ETag: request.eTag,
  Enabled: request.enabled,
  StartTime: request.startTime,
  EndTime: request.endTime,
  Id: request.id,
  Name: request.name,
  Description: request.description,
  DeviceModels: toDeviceModels(request.deviceModels),
  IoTHubs: toIoTHubs(request.iotHubs),
  DeleteDevicesWhenSimulationEnds: request.devicesDeletionRequired,
  DevicesDeletionComplete: false,
  RateLimits: toRateLimits(request.iotHubs[0].iotHubSku, request.iotHubs[0].iotHubUnits)
});

// Request models
export const toSimulationUpdateModel = (request = {}) => ({
  ETag: request.eTag,
  Enabled: request.enabled,
  StartTime: request.startTime,
  EndTime: request.endTime,
  Id: request.id,
  Name: request.name,
  Description: request.description,
  DeviceModels: toCloneDeviceModels(request.deviceModels),
  IoTHubs: toIoTHubs(request.iotHubs),
  DeleteDevicesWhenSimulationEnds: request.devicesDeletionRequired,
  RateLimits: toRateLimits(request.iotHubs[0].iotHubSku, request.iotHubs[0].iotHubUnits)
});

// Request models
export const toSimulationPatchModel = (request = {}, enabled) => ({
  ETag: request.eTag,
  Id: request.id,
  Enabled: enabled
});

export const deviceDeletionPatchModel = (request = {}, deleteDevices) => ({
  ETag: request.eTag,
  Id: request.id,
  DeleteDevicesOnce: true
});

// Map to deviceModels in simulation request model
const toDeviceModels = (deviceModels = []) =>
  deviceModels.map(({ name: Id, count: Count, interval }) => {
    const Interval = `${interval.hours}:${interval.minutes}:${interval.seconds}`;
    return {
      Id,
      Count,
      Override: {
        Simulation: {
          Interval
        },
        Telemetry: [{
          Interval
        }]
      }
    };
  });

// Map to deviceModels in simulation request model
const toCloneDeviceModels = (deviceModels = []) =>
  deviceModels.map(({ id, count: Count, interval }) => {
    return {
      Id: id,
      Count,
      Override: {
        Simulation: {
          Interval: interval
        },
        Telemetry: [{
          Interval: interval
        }]
      }
    };
  });

// Map to deviceModels in simulation request model
const toIoTHubs = (iotHubs = []) =>
  iotHubs.map(({ connectionString }) => {
    return { ConnectionString: connectionString };
  });

// Map to rateLimits in simulation request model
const toRateLimits = (iotHubSku = 'S2', iotHubUnits = 1) => {
  let rateLimits = {};

  switch(iotHubSku) {
    case 'S1':
      rateLimits = Config.iotHubRateLimits.s1;
      break;
    case 'S2':
      rateLimits = Config.iotHubRateLimits.s2;
      break;
    case 'S3':
      rateLimits = Config.iotHubRateLimits.s3;
      break;
    default:
      rateLimits = Config.iotHubRateLimits.s2;
      break;
  }

  return {
    RegistryOperationsPerMinute: rateLimits.registryOperationsPerMinute * iotHubUnits,
    TwinReadsPerSecond: rateLimits.twinReadsPerSecond * iotHubUnits,
    TwinWritesPerSecond: rateLimits.twinWritesPerSecond * iotHubUnits,
    ConnectionsPerSecond: rateLimits.connectionsPerSecond * iotHubUnits,
    DeviceMessagesPerSecond: rateLimits.deviceMessagesPerSecond * iotHubUnits
  };
};
