// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toDeviceModels, toDeviceModel, toDeviceModelRequestModel, toDeviceModelUploadRequestModel } from './models';

const ENDPOINT = `${Config.simulationApiUrl}deviceModels`;

/** Contains methods for calling the simulation service */
export class DeviceModelsService {

  /** Returns a list of device models */
  static getDeviceModels() {
    return HttpClient.get(ENDPOINT)
      .map(toDeviceModels);
  }

  /** Returns a device model by id */
  static getDeviceModelById(id) {
    return HttpClient.get(`${ENDPOINT}/${id}`)
      .map(toDeviceModel);
  }

  /** Creates a device model */
  static createDeviceModel(model) {
    return HttpClient.post(ENDPOINT, toDeviceModelRequestModel(model))
      .map(toDeviceModel);
  }

  /** Updates a device model */
  static updateSingleDeviceModel(model) {
    return HttpClient.put(`${ENDPOINT}/${model.id}`, toDeviceModelRequestModel(model))
      .map(toDeviceModel);
  }

  /** Deletes a device model by id */
  static deleteDeviceModelById(id) {
    return HttpClient.delete(`${ENDPOINT}/${id}`);
  }

  /** Uploads a device model */
  static uploadDeviceModel(model) {
    return HttpClient.post(ENDPOINT, toDeviceModelUploadRequestModel(model))
      .map(toDeviceModel);
  }
}
