// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';

const ENDPOINT = Config.configApiUrl;

/** Contains methods for calling the config service */
export class ConfigService {
  /* get solution settings */
  static getSolutionSettings() {
    return HttpClient.get(`${ENDPOINT}solution-settings/theme`);
  }

  /* update solution settings */
  static updateSolutionSettings(model) {
    return HttpClient.put(`${ENDPOINT}solution-settings/theme`, model);
  }
}
