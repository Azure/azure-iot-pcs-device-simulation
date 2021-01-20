// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.ApplicationInsights;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.External;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Models;
using Microsoft.Azure.IoTSolutions.Diagnostics.Services.Runtime;
using Newtonsoft.Json;

namespace Microsoft.Azure.IoTSolutions.Diagnostics.Services
{
    public interface ILogDiagnostics
    {
        Task<bool> LogEventsAsync(DiagnosticsEventsServiceModel serviceModelData);
    }

    public class DiagnosticsEventsService : ILogDiagnostics
    {
        private readonly ILogger log;
        private readonly IDiagnosticsClient diagnosticsClient;
        private readonly IServicesConfig servicesConfig;
        private readonly ITelemetryClientWrapper telemetryClientWrapper;
        private static DateTimeOffset lastPolled = DateTimeOffset.UtcNow;
        private static bool? userConsent = null;

        public DiagnosticsEventsService(
            IDiagnosticsClient diagnosticsClient,
            IServicesConfig servicesConfig,
            ITelemetryClientWrapper telemetryClientWrapper,
            ILogger logger)
        {
            this.log = logger;
            this.diagnosticsClient = diagnosticsClient;
            this.servicesConfig = servicesConfig;
            this.telemetryClientWrapper = telemetryClientWrapper;
        }

        public async Task<bool> LogEventsAsync(DiagnosticsEventsServiceModel serviceModelData)
        {
            DateTimeOffset now = DateTimeOffset.UtcNow;
            TimeSpan duration = now - lastPolled;

            if (userConsent == null || duration.TotalSeconds >= this.servicesConfig.UserConsentPollingIntervalSecs)
            {
                try
                {
                    userConsent = await this.diagnosticsClient.CheckUserConsentAsync();
                    lastPolled = now;
                }
                catch (Exception e)
                {
                    this.log.Error(e.Message, () => { });
                }
            }

            if (userConsent == true)
            {
                try
                {
                    // Call out to App Insights
                    TelemetryClient telemetryClient =
                        this.telemetryClientWrapper.CreateTelemetryClient(this.servicesConfig);
                    var appInsightsModelData = AppInsightsDataModel.FromServiceModel(serviceModelData);
                    this.telemetryClientWrapper.SetSessionAndDeploymentId(telemetryClient, appInsightsModelData);
                    this.telemetryClientWrapper.TrackEvent(telemetryClient, appInsightsModelData);

                    return true;
                }
                catch (Exception e)
                {
                    this.log.Error(e.Message, () => { });
                }
            }

            return false;
        }
    }
}
