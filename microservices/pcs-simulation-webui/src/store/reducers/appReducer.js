// Copyright (c) Microsoft. All rights reserved.

import moment from 'moment';
import { Observable } from 'rxjs';
import diagnosticsEvent from 'store/logEventUtil';
import { ConfigService, DiagnosticsService } from 'services';
import { createAction, createReducerScenario, createEpicScenario } from 'store/utilities';
import {
  epics as simulationEpics,
  redux as simulationRedux
} from './simulationReducer';
import { epics as deviceModelsEpics } from './deviceModelsReducer';

// ========================= Reducers - START
const deviceModelErrorReducer = (state, action) => ({ ...state, error: action.payload });
const updateSolutionSettingsReducer = (state, action) => ({ ...state, settings: action.payload});

// session management variables declaration
// using 'Timestamp as session id'
let sessionId = moment().toISOString();

export const redux = createReducerScenario({
  deviceModelsError: { type: 'DEVICE_MODELS_ERROR', reducer: deviceModelErrorReducer },
  updateSolutionSettings: { type: 'APP_SOLUTION_ADD_SETTINGS', reducer: updateSolutionSettingsReducer}
});

export const reducer = { app: redux.getReducer() };
// ========================= Reducers - END

// ========================= Selectors - START
export const getSolutionSettings = state => state.app.settings;
// ========================= Selectors - END

// ========================= Epics - START
export const epics = createEpicScenario({
  /** Kicks off all the events that need to happen on app initialization */
  initializeApp: {
    type: 'APP_INITIALIZE',
    epic: () => {
      const event = diagnosticsEvent('UserLogInSuccess', {});
      return [
        simulationRedux.actions.revertToInitial(),
        simulationEpics.actions.fetchSimulationStatus(),
        simulationEpics.actions.fetchSimulationList(),
        epics.actions.getSolutionSettings(),
        epics.actions.logEvent(event),
        deviceModelsEpics.actions.fetchDeviceModels()
    ]}
    },

  updateSession: {
    type: 'UPDATE_SESSION',
    epic: (sessionStatus) => {
      sessionId = moment().toISOString();
      return Observable.empty()
    }
  },

  /** Log diagnostics data */
  logEvent: {
    type: 'APP_LOG_EVENT',
    epic: ({ payload }, store) => {
      const settings = getSolutionSettings(store.getState());
      const diagnosticsOptOut = settings === undefined ? true : settings.diagnosticsOptOut;
      (payload.eventProperties || {}).sessionId = sessionId;
      if (!diagnosticsOptOut) {
        return DiagnosticsService.logEvent(payload)
          .flatMap(_ => Observable.empty())
          .catch(_ => Observable.empty())
      } else {
        return Observable.empty()
      }
    }
  },

  /** Get solution settings */
  getSolutionSettings: {
    type: 'APP_SOLUTION_GET_SETTINGS',
    epic: () =>
      ConfigService.getSolutionSettings()
        .map(redux.actions.updateSolutionSettings)
        .catch(_ => Observable.empty())
  },

  /** Update solution settings */
  updateSolutionSettings: {
    type: 'APP_SOLUTION_UPDATE_SETTINGS',
    epic: ({ payload }) =>
      ConfigService.updateSolutionSettings(payload)
        .map(redux.actions.updateSolutionSettings)
        .catch(_ => Observable.empty())
  },

  /** Listen to route events and emit a route change event when the url changes */
  detectRouteChange: {
    type: 'APP_ROUTE_EVENT',
    rawEpic: (action$, store, actionType) =>
      action$.ofType(actionType)
        .map(({ payload }) => payload) // Pathname
        .distinctUntilChanged()
        .map(createAction('EPIC_APP_ROUTE_CHANGE'))
  },
});
// ========================= Epics - END
