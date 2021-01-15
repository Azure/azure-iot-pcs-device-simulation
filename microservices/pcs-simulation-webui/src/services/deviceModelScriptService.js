// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import {
  toDeviceModelScripts,
  toDeviceModelScript,
  toDeviceModelScriptRequestModel,
  toValidationModel
} from './models';

const ENDPOINT = `${Config.simulationApiUrl}devicemodelscripts`;

const uploadOptions = {
  headers: {
    'Accept': undefined,
    'Content-Type': undefined
  }
};

/** Contains methods for calling the device model service */
export class DeviceModelScriptsService {

  /** Returns a list of device model scripts */
  static getDeviceModelScripts() {
    return HttpClient.get(ENDPOINT)
      .map(toDeviceModelScripts);
  }

  /** Returns a device model script by id */
  static getDeviceModelScriptById(id) {
    return HttpClient.get(`${ENDPOINT}/${id}`)
      .map(toDeviceModelScript);
  }

  /** Creates a device model script */
  static uploadsDeviceModelScript(script) {
    return HttpClient.post(ENDPOINT, toDeviceModelScriptRequestModel(script), uploadOptions)
      .map(toDeviceModelScript);
  }

  /** Updates a device model script */
  static updateSingleDeviceModelScript(script) {
    return HttpClient.put(`${ENDPOINT}/${script.id}`, toDeviceModelScriptRequestModel(script), uploadOptions)
      .map(toDeviceModelScript);
  }

  /** Deletes a device model script by id */
  static deleteDeviceModelScriptById(id) {
    return HttpClient.delete(`${ENDPOINT}/${id}`);
  }

  /** Validate a device model script */
  static validateDeviceModelScript(script) {
    return HttpClient.post(`${ENDPOINT}!validate`, toDeviceModelScriptRequestModel(script), uploadOptions)
      .map(toValidationModel);
  }
}
