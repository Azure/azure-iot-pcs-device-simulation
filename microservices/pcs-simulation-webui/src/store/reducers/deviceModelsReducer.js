// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';
import { schema, normalize } from 'normalizr';
import update from 'immutability-helper';
import { createSelector } from 'reselect';
import { DeviceModelsService } from 'services';
import { epics as appEpics } from './appReducer';
import diagnosticsEvent from '../logEventUtil';
import {
  createReducerScenario,
  createEpicScenario,
  errorPendingInitialState,
  errorReducer,
  getError
} from 'store/utilities';

// ========================= Epics - START
const handleError = fromAction => error => {
  const errorEvent = diagnosticsEvent('DeviceModelsUXError');
  return Observable.of(redux.actions.registerError(fromAction.type, { error, fromAction }))
    .startWith(appEpics.actions.logEvent(errorEvent))
}

export const epics = createEpicScenario({
  /** Loads the list of device models */
  fetchDeviceModels: {
    type: 'DEVICE_MODELS_FETCH',
    epic: (fromAction) =>
      DeviceModelsService.getDeviceModels()
        .map(redux.actions.updateDeviceModels)
        .catch(handleError(fromAction))
  },

  /** Create a device model */
  createDeviceModel: {
    type: 'DEVICE_MODEL_INSERT',
    epic: (fromAction, store) =>{
      const eventProps = {
        DeviceModelId: fromAction.payload.id
      };
      const event = diagnosticsEvent('CreateDeviceModel', eventProps);

      return DeviceModelsService.createDeviceModel(fromAction.payload)
        .map(redux.actions.createDeviceModel)
        .startWith(appEpics.actions.logEvent(event))
        .catch(handleError(fromAction))
    }
  },

  /** Upload a device model */
  uploadDeviceModel: {
    type: 'DEVICE_MODEL_UPLOAD',
    epic: (fromAction) =>
      DeviceModelsService.uploadDeviceModel(fromAction.payload)
        .map(redux.actions.uploadDeviceModel)
        .catch(handleError(fromAction))
  },

  /** Edit a single device model */
  editDeviceModel:{
    type: 'DEVICE_MODEL_UPDATE',
    epic: (fromAction, store) =>{
      const eventProps = {
        DeviceModelId: fromAction.payload.id
      };
      const event = diagnosticsEvent('UpdateDeviceModel', eventProps);

      return DeviceModelsService.updateSingleDeviceModel(fromAction.payload)
        .map(redux.actions.updateSingleDeviceModel)
        .startWith(appEpics.actions.logEvent(event))
        .catch(handleError(fromAction))
    }
  },

  /** Delete a device model */
  deleteDeviceModel: {
    type: 'DEVICE_MODEL_DELETE',
    epic: (fromAction, store) => {
      const eventProps = {
        DeviceModelId: fromAction.payload
      };
      const event = diagnosticsEvent('DeleteDeviceModel', eventProps);

      return DeviceModelsService.deleteDeviceModelById(fromAction.payload)
        .map(redux.actions.deleteDeviceModel)
        .startWith(appEpics.actions.logEvent(event))
        .catch(handleError(fromAction))
    }
  }
});
// ========================= Epics - END

// Device models reducer constants
const initialState = {
  ...errorPendingInitialState,
  entities: {},
  items: []
};

// ========================= Schemas - START
const deviceModelSchema = new schema.Entity('deviceModels');
const deviceModelsSchema = new schema.Array(deviceModelSchema);
// ========================= Schemas - END

// ========================= Reducers - START
// Populate the store with multiple devices
const updateDeviceModelsReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize(payload, deviceModelsSchema);
  return update(state, {
    entities: { $set: deviceModels },
    items: { $set: result }
  });
};
// Update a single device model
const updateSingleDeviceModelReducer = (state, {payload}) => {
  return update(state, {
    entities: {[payload.id]: {$set: payload}}
  });
}
const createDeviceModelReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize([payload], deviceModelsSchema);
  return update(state, {
    entities: { $merge: deviceModels },
    items: { $splice: [[state.items.length, 0, result]] }
  });
};
const uploadDeviceModelReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize([payload], deviceModelsSchema);
  return update(state, {
    entities: { $merge: deviceModels },
    items: { $splice: [[state.items.length, 0, result]] }
  });
};
const deleteDeviceModelReducer = (state, { payload }) => {
  const itemIdx = state.items.indexOf(payload);
  return update(state, {
    entities: { $unset: [payload] },
    items: { $splice: [[itemIdx, 1]] }
  });
};

// Where payload is an action type
const wipeReducer = (state, { payload }) => update(state, {
  errors: { $unset: [payload] }
});

export const redux = createReducerScenario({
  updateDeviceModels: { type: 'DEVICE_MODELS_UPDATE', reducer: updateDeviceModelsReducer },
  updateSingleDeviceModel: { type: 'DEVICE_MODEL_SINGLE_UPDATE', reducer: updateSingleDeviceModelReducer },
  createDeviceModel: { type: 'CREATE_DEVICE_MODEL', reducer: createDeviceModelReducer },
  uploadDeviceModel: { type: 'UPLOAD_DEVICE_MODEL', reducer: uploadDeviceModelReducer },
  deleteDeviceModel: { type: 'DELETE_DEVICE_MODEL', reducer: deleteDeviceModelReducer },
  clearUploadDeviceModelError: { type: 'WIPE_ERROR', reducer: wipeReducer, staticPayload: epics.actionTypes.uploadDeviceModel },
  registerError: { type: 'DEVICE_MODELS_REDUCER_ERROR', reducer: errorReducer },
});

export const reducer = { deviceModels: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
export const getDeviceModelsReducer = state => state.deviceModels;
export const getDeviceModelEntities = state => getDeviceModelsReducer(state).entities;
export const getItems = state => getDeviceModelsReducer(state).items;
export const getDeviceModels = createSelector(
  getDeviceModelEntities, getItems,
  (entities, items) => items.map(id => entities[id])
);
export const getDeviceModelsNameSet = createSelector(
  getDeviceModels,
  models => new Set(models.map(model => model.name.toLowerCase()))
);
export const getDeleteDeviceModelError = state =>
  getError(getDeviceModelsReducer(state), epics.actionTypes.deleteDeviceModel);
export const getUpLoadDeviceModelsError = state =>
  getError(getDeviceModelsReducer(state), epics.actionTypes.uploadDeviceModel);
// ========================= Selectors - END
