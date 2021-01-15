// Copyright (c) Microsoft. All rights reserved.

using Microsoft.ApplicationInsights;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.Services.ApplicationInsights
{
    public interface ITelemetryClientWrapper
    {
        TelemetryClient CreateTelemetryClient(IServicesConfig config);

        void SetSessionAndDeploymentId(
            TelemetryClient telemetryClient,
            AppInsightsDataModel dataModel);

        void TrackEvent(TelemetryClient telemetryClient, AppInsightsDataModel dataModel);
    }

    public class TelemetryClientWrapper: ITelemetryClientWrapper
    {
        public TelemetryClient CreateTelemetryClient(IServicesConfig config)
        {
            return new TelemetryClient
            {
                InstrumentationKey = config.AppInsightsInstrumentationKey
            };
        }

        public void SetSessionAndDeploymentId(
            TelemetryClient telemetryClient,
            AppInsightsDataModel dataModel)
        {
            telemetryClient.Context.Session.Id = dataModel.SessionId.ToString();
            telemetryClient.Context.User.Id = dataModel.DeploymentId;
        }

        public void TrackEvent(TelemetryClient telemetryClient, AppInsightsDataModel dataModel)
        {
            telemetryClient.TrackEvent(dataModel.EventType, dataModel.EventProperties);
        }
    }
}
