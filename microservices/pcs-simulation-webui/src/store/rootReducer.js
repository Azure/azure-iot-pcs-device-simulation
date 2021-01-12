// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';

// Reducers
import { reducer as appReducer } from './reducers/appReducer';
import { reducer as simulationReducer } from './reducers/simulationReducer';
import { reducer as deviceModelsReducer } from './reducers/deviceModelsReducer';

const rootReducer = combineReducers({
  ...appReducer,
  ...simulationReducer,
  ...deviceModelsReducer
});

export default rootReducer;
