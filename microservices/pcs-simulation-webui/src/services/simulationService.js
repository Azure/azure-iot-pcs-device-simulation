// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toSimulationStatusModel, toSimulationModel, toSimulationListModel, toDeviceModel, toSimulationRequestModel, toSimulationPatchModel, deviceDeletionPatchModel } from './models';
import { Observable } from 'rxjs/Observable';

const ENDPOINT = Config.simulationApiUrl;

/** Contains methods for calling the simulation service */
export class SimulationService {

  /** Returns the device status */
  static getStatus() {
    return HttpClient.get(`${ENDPOINT}status`)
      .map(toSimulationStatusModel);
  }

  /** Returns a list of device models */
  static getDeviceModels() {
    return HttpClient.get(`${ENDPOINT}devicemodels`)
      .map(({ Items }) => Items)
      .map(models => models.map(toDeviceModel));
  }

  /** Returns list of simulations */
  static getSimulationList() {
    return HttpClient.get(`${ENDPOINT}simulations`)
      .map(toSimulationListModel)
      .catch(error => {
        // A 404 from the GET request means that no simulation is configured, not an actual 404 error
        if (error.status === 404) return Observable.of(toSimulationListModel({ Enabled: null }))
        return Observable.throw(error);
      });
  }

  /** Returns any currently running simulation */
  static getSimulation(id = '') {
    return HttpClient.get(`${ENDPOINT}simulations/${id}`)
      .map(toSimulationModel)
      .catch(error => {
        // A 404 from the GET request means that no simulation is configured, not an actual 404 error
        if (error.status === 404) return Observable.of(toSimulationModel({ Enabled: null }))
        return Observable.throw(error);
      });
  }

  /** Enables or disables a simulation */
  static toggleSimulation({ eTag, enabled, id }) {
    return HttpClient.patch(`${ENDPOINT}simulations/${id}`, { ETag: eTag, Enabled: enabled })
      .map(toSimulationModel)
      .catch(resolveConflict);
  }

  /** Creates a new simulation */
  static createSimulation(model) {
    return HttpClient.post(
        `${ENDPOINT}simulations`,
        toSimulationRequestModel(model)
      )
      .map(toSimulationModel)
      .catch(resolveConflict);
  }

  /** Start/Restart a simulation */
  static startSimulation(simulation) {
    return HttpClient.patch(`${ENDPOINT}simulations/${simulation.id}`, { ETag: simulation.eTag, Enabled: true })
      .map(toSimulationModel)
      .catch(resolveConflict);
  }

  /** Disable a simulation */
  static stopSimulation(simulation) {
    return SimulationService.getSimulation(simulation.id)
      .flatMap(({ eTag }) => {
        return HttpClient.patch(
            `${ENDPOINT}simulations/${simulation.id}`,
            toSimulationPatchModel({ ...simulation, eTag }, false)
          )
          .map(toSimulationModel)
          .catch(resolveConflict);
      });
  }

  /** Disable a simulation */
  static deleteSimulation(id) {
    return HttpClient.delete(`${ENDPOINT}simulations/${id}`)
      .catch(resolveConflict);
  }

  /** Patch a simulation */
  static patchSimulation(simulation) {
    return HttpClient.patch(
      `${ENDPOINT}simulations/${simulation.id}`,
      deviceDeletionPatchModel(simulation, true)
      )
      .map(toSimulationModel)
      .catch(resolveConflict);
  }
}

/** If the UI resource is out of sync with the service, update the UI resource */
function resolveConflict(error) {
  return Observable.throw(error);
}
