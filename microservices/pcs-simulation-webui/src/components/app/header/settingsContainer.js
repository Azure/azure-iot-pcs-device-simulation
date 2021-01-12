// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import Settings from './settings';
import {
  epics,
  getSolutionSettings
} from 'store/reducers/appReducer';

const mapStateToProps = state => ({
  settings: getSolutionSettings(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  updateSolutionSettings: settings => dispatch(epics.actions.updateSolutionSettings(settings)),
});

export const SettingsContainer = withNamespaces()(connect(mapStateToProps, mapDispatchToProps)(Settings));
