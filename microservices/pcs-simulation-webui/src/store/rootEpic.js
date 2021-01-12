// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import { epics as appEpics } from './reducers/appReducer';
import { epics as simulationEpics } from './reducers/simulationReducer';
import { epics as deviceModelsEpics } from './reducers/deviceModelsReducer';

// Extract the epic function from each property object
const epics = [
  ...appEpics.getEpics(),
  ...simulationEpics.getEpics(),
  ...deviceModelsEpics.getEpics()
];

const rootEpic = combineEpics(...epics);

export default rootEpic;
