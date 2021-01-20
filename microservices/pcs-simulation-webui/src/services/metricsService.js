// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs/Observable';
import { HttpClient } from './httpClient';
import Config from 'app.config';
import { toIothubMetricsModel } from './models';

const ENDPOINT = Config.simulationApiUrl;

/** Contains methods for calling the diagnostics service */
export class MetricsService {
  /**Log event */
  static fetchIothubMetrics(id, payload = null) {
    return HttpClient.post(
      `${ENDPOINT}simulations/${id}/metrics/iothub!search`,
      payload,
      true
    )
    .map(toIothubMetricsModel)
    .catch(error => Observable.throw(error));
  }
}
