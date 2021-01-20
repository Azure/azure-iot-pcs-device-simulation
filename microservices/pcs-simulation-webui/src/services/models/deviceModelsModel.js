// Copyright (c) Microsoft. All rights reserved.
import Config from 'app.config';

// Map to deviceModes in device model tabs
export const toDeviceModels = ({ Items = []}) => Items.map(toDeviceModel);

// Map to deviceModel in device model form view
export const toDeviceModel = (response = {}) => ({
  id: response.Id,
  name: response.Name,
  description: response.Description,
  eTag: response.ETag,
  version: response.Version,
  type: response.Type,
  simulation: response.Simulation,
  telemetry: response.Telemetry,
  cloudToDeviceMethods: response.CloudToDeviceMethods,
  properties: response.Properties,
});

// Request model
export const toDeviceModelRequestModel = (request = {}) => {
  const { id = 'new', eTag, name, description, version, interval = '00:00:10', sensors, frequency = '00:00:10' } = request;
  const { script, messageTemplate, messageSchema } = toCustomSensorModel(sensors);
  return {
    Id: id,
    ETag: eTag,
    Name: name,
    Description: description,
    Version: version,
    Protocol: 'MQTT',
    Type: Config.deviceModelTypes.customModel,
    Simulation: {
      Interval: frequency,
      Scripts: script
    },
    Telemetry: [{
      Interval: interval,
      MessageTemplate: messageTemplate,
      MessageSchema: messageSchema
    }]
  };
};

const toCustomSensorModel = (sensors = []) => {
  const behaviorMap = {};
  let Fields = {};
  let messages = [];

  sensors
    .forEach(({ name, behavior, minValue, maxValue, unit }) => {
      const _name = name.toLowerCase();
      const _unit = unit.toLowerCase();
      const nameString = `"${_name}":$\{${_name}}`;
      const unitString = `"${_name}_unit":"${_unit}"`;
      const path = behavior.value;
      messages = [...messages, nameString, unitString];
      Fields = { ...Fields, [_name]: 'double', [`${_name}_unit`]: 'text' };
      if(!behaviorMap[path]) behaviorMap[path] = {};
      behaviorMap[path] = {
        ...behaviorMap[path],
        [_name]: {
          Min: minValue,
          Max: maxValue,
          Step: 1,
          Unit: unit
        }
      }
    });

    const script = Object.keys(behaviorMap).map(Path => ({
      Type: 'internal',
      Path,
      Params: behaviorMap[Path]
    }));
    const messageTemplate = `{${messages.join(',')}}`;
    const messageSchema = {
      Name: 'custom-sensors;v1',
      Format: 'JSON',
      Fields
    };

    return {
      script,
      messageTemplate,
      messageSchema
    };
};

// Upload request model
export const toDeviceModelUploadRequestModel = (request = {}) => ({
    ...request,
    Type: Config.deviceModelTypes.customModel,
});
