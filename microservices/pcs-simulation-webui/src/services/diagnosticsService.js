// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { logEventRequestModel } from './models';

const ENDPOINT = Config.diagnosticsApiUrl;

/** Contains methods for calling the diagnostics service */
export class DiagnosticsService {
  /**Log event */
  static logEvent(model) {
    return HttpClient.post(
      `${ENDPOINT}diagnosticsevents`,
      logEventRequestModel(model),
    );
  }
}
